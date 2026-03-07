import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ChatMessage, ToolCall, SSEEvent } from '../ai/types';
import { parseSSEStream } from '../ai/streamParser';
import { executeTool } from '../ai/toolExecutor';
import { useInfographicStore } from './useInfographicStore';

interface ApiContentBlock {
  type: string;
  [key: string]: unknown;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string | ApiContentBlock[];
}

interface AiChatStore {
  messages: ChatMessage[];
  apiMessages: ApiMessage[];
  isStreaming: boolean;
  error: string | null;

  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  setError: (error: string | null) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
  messages: [],
  apiMessages: [],
  isStreaming: false,
  error: null,
  selectedModel: 'zai',

  setError: (error) => set({ error }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  clearHistory: () => set({ messages: [], apiMessages: [], error: null }),

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

    // Build API messages list
    const newApiMessages: ApiMessage[] = [...apiMessages, { role: 'user', content: text }];
    set({ apiMessages: newApiMessages });

    // Start the agentic loop
    let currentApiMessages = newApiMessages;
    let continueLoop = true;

    while (continueLoop) {
      continueLoop = false;

      // Take a fresh snapshot each iteration
      const snapshot = useInfographicStore.getState().getSnapshot();

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: currentApiMessages, snapshot, model: get().selectedModel }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'Request failed' }));
          set({ isStreaming: false, error: errData.error || `HTTP ${response.status}` });
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

        for await (const event of parseSSEStream(response)) {
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
              const result = executeTool(sseEvent.name, sseEvent.input as Record<string, unknown>, sseEvent.id);
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
        const message = err instanceof Error ? err.message : 'Network error';
        set({ isStreaming: false, error: message });
        return;
      }
    }

    // Done — save final API messages and stop streaming
    set({ apiMessages: currentApiMessages, isStreaming: false });
  },
}));
