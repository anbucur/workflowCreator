import type { SSEEvent } from './types';

/**
 * Parses a fetch Response with SSE (text/event-stream) body into an async generator of SSEEvents.
 * We use fetch + ReadableStream instead of EventSource because we need to send POST with a body.
 */
export async function* parseSSEStream(response: Response): AsyncGenerator<SSEEvent> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE format: lines separated by \n\n
      const parts = buffer.split('\n\n');
      // Keep the last incomplete part in the buffer
      buffer = parts.pop() || '';

      for (const part of parts) {
        const event = parseSSEMessage(part);
        if (event) yield event;
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const event = parseSSEMessage(buffer);
      if (event) yield event;
    }
  } finally {
    reader.releaseLock();
  }
}

function parseSSEMessage(raw: string): SSEEvent | null {
  let eventType = '';
  let data = '';

  for (const line of raw.split('\n')) {
    if (line.startsWith('event: ')) {
      eventType = line.slice(7).trim();
    } else if (line.startsWith('data: ')) {
      data = line.slice(6);
    }
  }

  if (!eventType || !data) return null;

  try {
    const parsed = JSON.parse(data);

    switch (eventType) {
      case 'text_delta':
        return { type: 'text_delta', text: parsed.text };
      case 'tool_use':
        return { type: 'tool_use', id: parsed.id, name: parsed.name, input: parsed.input };
      case 'done':
        return { type: 'done', stop_reason: parsed.stop_reason };
      case 'error':
        return { type: 'error', message: parsed.message };
      default:
        return null;
    }
  } catch {
    return null;
  }
}
