import { useCallback, useRef, useState } from 'react';
import { api } from '../utils/apiClient';

const FALLBACK_TEXT = {
  hi: 'एआई सहायक अभी उपलब्ध नहीं है — कृपया कुछ क्षण बाद पुनः प्रयास करें।',
  mr: 'एआय सहाय्यक सध्या उपलब्ध नाही — कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.',
  en: 'AI Assistant is temporarily unavailable — try again in a moment.'
};

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * Drives the agentic assistant: keeps the conversation, surfaces the tools the
 * agent ran, and holds any write it wants to make until the user approves it.
 */
export function useAgent(lang = 'hi') {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // The agent needs the full turn history; message ids and step traces are
  // presentation-only, so the wire format is tracked separately.
  const historyRef = useRef([]);

  const reset = useCallback((greeting) => {
    historyRef.current = [];
    setPendingAction(null);
    setMessages(greeting ? [{ id: 'msg_welcome', sender: 'ai', text: greeting, steps: [], timestamp: now() }] : []);
  }, []);

  const runTurn = useCallback(
    async (approvedAction) => {
      setIsThinking(true);
      try {
        const res = await api.agentChat(historyRef.current, lang, approvedAction);
        setPendingAction(res.pendingAction ?? null);

        // A gated write can come back with no prose — the confirm card is the
        // whole message, so don't paper over it with the offline fallback.
        const spoken = res.reply?.trim();
        const reply = spoken || (res.pendingAction ? '' : FALLBACK_TEXT[lang] || FALLBACK_TEXT.en);

        if (reply) {
          historyRef.current = [...historyRef.current, { role: 'model', text: reply }];
          setMessages((prev) => [
            ...prev,
            { id: `ai_${Date.now()}`, sender: 'ai', text: reply, steps: res.steps ?? [], timestamp: now() }
          ]);
        }
        return reply;
      } catch (err) {
        console.warn('[Agent] request failed:', err.message);
        const text = FALLBACK_TEXT[lang] || FALLBACK_TEXT.en;
        setMessages((prev) => [...prev, { id: `err_${Date.now()}`, sender: 'ai', text, steps: [], timestamp: now() }]);
        return text;
      } finally {
        setIsThinking(false);
      }
    },
    [lang]
  );

  const send = useCallback(
    async (rawText) => {
      const text = rawText?.trim();
      if (!text || isThinking) return null;

      historyRef.current = [...historyRef.current, { role: 'user', text }];
      setMessages((prev) => [...prev, { id: `usr_${Date.now()}`, sender: 'user', text, timestamp: now() }]);
      setPendingAction(null);
      return runTurn(null);
    },
    [isThinking, runTurn]
  );

  const approve = useCallback(async () => {
    if (!pendingAction) return null;
    const action = pendingAction;
    setPendingAction(null);
    return runTurn(action);
  }, [pendingAction, runTurn]);

  const decline = useCallback(() => setPendingAction(null), []);

  return { messages, isThinking, pendingAction, send, approve, decline, reset };
}
