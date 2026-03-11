import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ChatMessage, DocumentContext, ToolCall, SSEEvent } from '../ai/types';
import { parseSSEStream } from '../ai/streamParser';
import { executeTool } from '../ai/toolExecutor';
import { hasBrowserApiKey, callAIDirectly } from '../ai/browserAiClient';
import { useInfographicStore } from './useInfographicStore';
import { useIntegrationsStore } from './useIntegrationsStore';
import type { GitHubConfig, JiraConfig, ConfluenceConfig } from '../types/integrations';

interface ApiContentBlock {
  type: string;
  [key: string]: unknown;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string | ApiContentBlock[];
}

// Maximum number of conversation turns to keep in history
// Each turn = user message + assistant response (potentially with tool calls)
const MAX_HISTORY_TURNS = 10;

// Rough token limit for safety (leaving room for system prompt + tools + response)
const MAX_ESTIMATED_TOKENS = 100000;

/**
 * Estimate token count for a message (rough approximation: ~4 chars per token)
 */
function estimateTokens(message: ApiMessage): number {
  const content = message.content;
  if (typeof content === 'string') {
    return Math.ceil(content.length / 4);
  }
  // For content blocks, stringify and estimate
  return Math.ceil(JSON.stringify(content).length / 4);
}

/**
 * Prune message history to stay within token limits.
 * Always keeps the most recent messages. Removes from the start.
 */
function pruneHistory(messages: ApiMessage[], maxTokens: number): ApiMessage[] {
  if (messages.length === 0) return messages;
  
  // Calculate total tokens
  let totalTokens = messages.reduce((sum, msg) => sum + estimateTokens(msg), 0);
  
  if (totalTokens <= maxTokens) return messages;
  
  // Remove messages from the start until we're under the limit
  // But always keep at least the last turn (user + assistant)
  const result = [...messages];
  while (result.length > 2 && totalTokens > maxTokens) {
    const removed = result.shift()!;
    totalTokens -= estimateTokens(removed);
  }
  
  console.log(`[AI Chat] Pruned history from ${messages.length} to ${result.length} messages (${totalTokens} estimated tokens)`);
  return result;
}

/**
 * Limit history to a maximum number of turns.
 * A "turn" is a user message followed by assistant response(s).
 */
function limitHistoryTurns(messages: ApiMessage[], maxTurns: number): ApiMessage[] {
  if (messages.length <= maxTurns * 2) return messages;
  
  // Find user message positions (start of each turn)
  const userMessageIndices: number[] = [];
  messages.forEach((msg, idx) => {
    if (msg.role === 'user') {
      userMessageIndices.push(idx);
    }
  });
  
  // Keep only the last maxTurns turns
  if (userMessageIndices.length <= maxTurns) return messages;
  
  const startIdx = userMessageIndices[userMessageIndices.length - maxTurns];
  const result = messages.slice(startIdx);
  
  console.log(`[AI Chat] Limited history to ${maxTurns} turns (${result.length} messages)`);
  return result;
}

interface AiEditContext {
  stepId: string;
  phaseId: string;
  stepTitle: string;
  userPrompt: string;
}

interface AiChatStore {
  messages: ChatMessage[];
  apiMessages: ApiMessage[];
  isStreaming: boolean;
  error: string | null;
  documentContext: DocumentContext | null;
  aiEditContext: AiEditContext | null;
  setAiEditContext: (ctx: AiEditContext | null) => void;
  clearAiEditContext: () => void;

  // Web search
  webSearchEnabled: boolean;
  webSearchProvider: 'duckduckgo' | 'brave';
  braveApiKey: string;
  toggleWebSearch: () => void;
  setWebSearchProvider: (provider: 'duckduckgo' | 'brave') => void;
  setBraveApiKey: (key: string) => void;

  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  clearHistory: () => void;
  regenerateLastMessage: () => Promise<void>;
  setError: (error: string | null) => void;
  setDocumentContext: (doc: DocumentContext | null) => void;
  clearDocumentContext: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

// Global AbortController for cancelling ongoing requests
let currentAbortController: AbortController | null = null;

export const useAiChatStore = create<AiChatStore>((set, get) => ({
  messages: [],
  apiMessages: [],
  isStreaming: false,
  error: null,
  documentContext: null,
  aiEditContext: null,
  selectedModel: 'k2p5',

  // Web search state — persisted in localStorage
  webSearchEnabled: (() => { try { return localStorage.getItem('ai-web-search') === 'true'; } catch { return false; } })(),
  webSearchProvider: (() => { try { return (localStorage.getItem('ai-web-search-provider') as 'duckduckgo' | 'brave') || 'duckduckgo'; } catch { return 'duckduckgo' as const; } })(),
  braveApiKey: (() => { try { return localStorage.getItem('ai-brave-api-key') || ''; } catch { return ''; } })(),

  setError: (error) => set({ error }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setDocumentContext: (doc) => set({ documentContext: doc }),
  clearDocumentContext: () => set({ documentContext: null }),
  toggleWebSearch: () => {
    const next = !get().webSearchEnabled;
    try { localStorage.setItem('ai-web-search', String(next)); } catch { /* */ }
    set({ webSearchEnabled: next });
  },
  setWebSearchProvider: (provider) => {
    try { localStorage.setItem('ai-web-search-provider', provider); } catch { /* */ }
    set({ webSearchProvider: provider });
  },
  setBraveApiKey: (key) => {
    try { localStorage.setItem('ai-brave-api-key', key); } catch { /* */ }
    set({ braveApiKey: key });
  },

  setAiEditContext: (ctx) => set({ aiEditContext: ctx }),
  clearAiEditContext: () => set({ aiEditContext: null }),

  clearHistory: () => set({ messages: [], apiMessages: [], error: null }),

  regenerateLastMessage: async () => {
    const { messages, apiMessages, isStreaming } = get();
    if (isStreaming) return;

    // Find the last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const lastUserContent = messages[lastUserIndex].content;

    // Remove messages from lastUserIndex onwards (user msg + assistant response)
    const remainingMessages = messages.slice(0, lastUserIndex);

    // Roll back apiMessages: find matching user message and remove from there
    let lastApiUserIndex = -1;
    for (let i = apiMessages.length - 1; i >= 0; i--) {
      if (apiMessages[i].role === 'user' && typeof apiMessages[i].content === 'string' && apiMessages[i].content === lastUserContent) {
        lastApiUserIndex = i;
        break;
      }
    }
    const remainingApiMessages = lastApiUserIndex > 0 ? apiMessages.slice(0, lastApiUserIndex) : [];

    set({ messages: remainingMessages, apiMessages: remainingApiMessages });

    // Re-send the same message
    await get().sendMessage(lastUserContent);
  },

  stopGeneration: () => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
      set({ isStreaming: false });
      console.log('[AI Chat] Generation stopped by user');
    }
  },

  sendMessage: async (text: string) => {
    const { apiMessages } = get();

    // Add user message to display
    const userMsg: ChatMessage = {
      id: nanoid(8),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, userMsg],
      isStreaming: true,
      error: null,
    }));

    // Pre-prune existing history before adding new message
    // This handles the case where history has grown too large
    let prunedHistory = limitHistoryTurns(apiMessages, MAX_HISTORY_TURNS);
    prunedHistory = pruneHistory(prunedHistory, MAX_ESTIMATED_TOKENS);

    // Build API messages list with pruned history
    const newApiMessages: ApiMessage[] = [...prunedHistory, { role: 'user', content: text }];
    set({ apiMessages: newApiMessages });

    // Start the agentic loop
    let currentApiMessages = newApiMessages;
    let continueLoop = true;

    // Create new AbortController for this request
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    while (continueLoop) {
      continueLoop = false;

      // Take a fresh snapshot each iteration
      const snapshot = useInfographicStore.getState().getSnapshot();

      try {
        // Build integration status for this iteration
        const integrations = (() => {
          const integ = useIntegrationsStore.getState();
          const result: Record<string, unknown> = {};
          const ghConn = integ.connections['github'];
          if (ghConn) result.github = { connected: ghConn.connected, ...(ghConn.connected ? { owner: (ghConn.config as GitHubConfig).owner, repo: (ghConn.config as GitHubConfig).repo } : {}) };
          const jiraConn = integ.connections['jira'];
          if (jiraConn) result.jira = { connected: jiraConn.connected, ...(jiraConn.connected ? { projectKey: (jiraConn.config as JiraConfig).projectKey } : {}) };
          const confConn = integ.connections['confluence'];
          if (confConn) result.confluence = { connected: confConn.connected, ...(confConn.connected ? { spaceKey: (confConn.config as ConfluenceConfig).spaceKey } : {}) };
          return Object.keys(result).length > 0 ? result : undefined;
        })();

        // Choose between browser-direct API calls (GitHub Pages / static deployment)
        // and the local Express backend (development / self-hosted).
        const selectedModel = get().selectedModel;
        const useBrowserClient = hasBrowserApiKey(selectedModel);

        async function* getEventStream(): AsyncGenerator<SSEEvent> {
          if (useBrowserClient) {
            yield* callAIDirectly({
              messages: currentApiMessages,
              snapshot,
              model: selectedModel,
              documentContext: get().documentContext,
              webSearchEnabled: get().webSearchEnabled,
              integrations,
              signal,
            });
            return;
          }

          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: currentApiMessages,
              snapshot,
              model: selectedModel,
              documentContext: get().documentContext,
              webSearchEnabled: get().webSearchEnabled,
              webSearchProvider: get().webSearchProvider,
              braveApiKey: get().webSearchEnabled && get().webSearchProvider === 'brave' ? get().braveApiKey : undefined,
              integrations,
            }),
            signal,
          });

          if (signal.aborted) return;

          if (!response.ok) {
            const errData = await response.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
            yield { type: 'error', message: errData.error ?? `HTTP ${response.status}` };
            return;
          }

          yield* parseSSEStream(response);
        }

        // Check if request was aborted before we even start
        if (signal.aborted) {
          return;
        }

        // Process the SSE stream
        let assistantText = '';
        const toolCalls: ToolCall[] = [];
        let stopReason = 'end_turn';

        // Create a placeholder assistant message for streaming
        const assistantMsgId = nanoid(8);
        set((s) => ({
          messages: [...s.messages, {
            id: assistantMsgId,
            role: 'assistant' as const,
            content: '',
            toolCalls: [],
            timestamp: Date.now(),
          }],
        }));

        for await (const event of getEventStream()) {
          const sseEvent = event as SSEEvent;

          switch (sseEvent.type) {
            case 'text_delta': {
              assistantText += sseEvent.text;
              // Update the streaming message
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: assistantText } : m,
                ),
              }));
              break;
            }

            case 'tool_use': {
              // Execute the tool immediately
              const result = await executeTool(sseEvent.name, sseEvent.input as Record<string, unknown>, sseEvent.id);
              const toolCall: ToolCall = {
                id: sseEvent.id,
                name: sseEvent.name,
                input: sseEvent.input as Record<string, unknown>,
                result: result.content,
                isError: result.is_error,
              };
              toolCalls.push(toolCall);

              // Update the message with tool call info
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, toolCalls: [...toolCalls] } : m,
                ),
              }));
              break;
            }

            case 'done': {
              stopReason = sseEvent.stop_reason;
              break;
            }

            case 'error': {
              set({ isStreaming: false, error: sseEvent.message });
              return;
            }
          }
        }

        // Build the API content blocks for this assistant turn
        const assistantContent: ApiContentBlock[] = [];
        if (assistantText) {
          assistantContent.push({ type: 'text', text: assistantText });
        }
        for (const tc of toolCalls) {
          assistantContent.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.name,
            input: tc.input,
          });
        }

        // Add assistant message to API history
        currentApiMessages = [
          ...currentApiMessages,
          { role: 'assistant', content: assistantContent.length === 1 && assistantContent[0].type === 'text' ? (assistantContent[0].text as string) : assistantContent },
        ];

        // If Claude wants to continue with tool results, add them and loop
        if (stopReason === 'tool_use' && toolCalls.length > 0) {
          const toolResultBlocks: ApiContentBlock[] = toolCalls.map((tc) => ({
            type: 'tool_result',
            tool_use_id: tc.id,
            content: tc.result || '{"success": true}',
            ...(tc.isError ? { is_error: true } : {}),
          }));

          currentApiMessages = [
            ...currentApiMessages,
            { role: 'user', content: toolResultBlocks },
          ];

          continueLoop = true;
        }
      } catch (err: unknown) {
        // Don't show error if request was aborted by user
        if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
          console.log('[AI Chat] Request aborted');
          return;
        }
        const message = err instanceof Error ? err.message : 'Network error';
        set({ isStreaming: false, error: message });
        return;
      }
    }

    // Apply history pruning to prevent token overflow
    // 1. Limit to max turns
    let finalMessages = limitHistoryTurns(currentApiMessages, MAX_HISTORY_TURNS);
    // 2. Further prune by token count if needed
    finalMessages = pruneHistory(finalMessages, MAX_ESTIMATED_TOKENS);

    // Done — save final API messages and stop streaming
    set({ apiMessages: finalMessages, isStreaming: false });
  },
}));
