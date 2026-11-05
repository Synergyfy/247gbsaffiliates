'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatConnection } from '@/lib/chat/connection';
import { useAuthStore } from '@/store/useAuthStore';

interface ChatNotificationPayload {
  type?: string;
  conversationId?: string | null;
  messageId?: string | null;
  senderId?: string | null;
  senderName?: string | null;
  content?: string | null;
  createdAt?: string | null;
}

interface ChatToastItem {
  id: string;
  conversationId: string;
  senderName: string;
  content: string | null;
}

/**
 * In-app toast for new chat messages on the 247GBS dashboard.
 *
 * The affiliate chat runs over the Central Hub socket, which emits
 * `chat_notification` to every other participant. We intentionally do NOT
 * register a service worker / web-push subscription here: an open dashboard
 * gets a live toast, and push is not enabled for the affiliate origin.
 *
 * Rendered with local state instead of react-toastify because the root
 * `ToastContainer` resolves to a different module instance in this Next
 * setup, so programmatic toasts never appeared.
 */
export function ChatNotificationToasts() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const [toasts, setToasts] = useState<ChatToastItem[]>([]);
  const seenMessageIds = useRef<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = chatConnection.subscribe();

    const off = chatConnection.on('chat_notification', (payload: ChatNotificationPayload) => {
      if (!payload || payload.type !== 'NEW_MESSAGE' || !payload.conversationId) return;

      const messageId =
        payload.messageId ||
        `${payload.conversationId}:${payload.createdAt || payload.content || Date.now()}`;
      if (seenMessageIds.current.has(messageId)) return;
      seenMessageIds.current.add(messageId);
      if (seenMessageIds.current.size > 200) {
        seenMessageIds.current = new Set(Array.from(seenMessageIds.current).slice(-100));
      }

      // Don't toast the conversation the user is already reading.
      const params = new URLSearchParams(window.location.search);
      const onMessagesPage = window.location.pathname.endsWith('/messages');
      if (onMessagesPage && params.get('conversationId') === payload.conversationId) return;

      const item: ChatToastItem = {
        id: messageId,
        conversationId: payload.conversationId,
        senderName: payload.senderName || 'New message',
        content: payload.content || null,
      };

      setToasts((current) => [item, ...current].slice(0, 4));
      const timer = setTimeout(() => dismiss(messageId), 6000);
      timers.current.set(messageId, timer);
    });

    return () => {
      off();
      unsubscribe();
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, [dismiss]);

  const openConversation = (item: ChatToastItem) => {
    dismiss(item.id);
    const rolePath = (role || 'agent').toLowerCase().replace(/_/g, '-');
    router.push(`/dashboard/${rolePath}/messages?conversationId=${item.conversationId}`);
    window.dispatchEvent(
      new CustomEvent('mcom_open_chat_conversation', {
        detail: { conversationId: item.conversationId },
      }),
    );
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => openConversation(item)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl transition-shadow hover:shadow-2xl"
        >
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined mt-0.5 text-primary">chat</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{item.senderName}</p>
              {item.content ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{item.content}</p>
              ) : null}
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Open conversation
              </p>
            </div>
            <span
              role="button"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                dismiss(item.id);
              }}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ChatNotificationToasts;
