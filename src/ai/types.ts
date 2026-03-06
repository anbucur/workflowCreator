export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: string;
  isError?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
}

// API message format (sent to server)
export interface ApiMessage {
  role: 'user' | 'assistant';
  content: string | ApiContentBlock[];
}

export type ApiContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean };

// SSE event types from the server
export type SSEEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'done'; stop_reason: 'end_turn' | 'tool_use' }
  | { type: 'error'; message: string };

export interface ToolResult {
  tool_use_id: string;
  content: string;
  is_error: boolean;
}
