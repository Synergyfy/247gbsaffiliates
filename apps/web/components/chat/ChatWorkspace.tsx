'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Conversation,
  DirectoryUser,
  Message,
  useMessaging,
} from '@/hooks/useMessaging';
import { useAuthStore } from '@/store/useAuthStore';
import { mcomService } from '@/services/mcom';

interface ChatWorkspaceProps {
  title?: string;
  subtitle?: string;
  emptyHint?: string;
}

function displayName(participant?: {
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  if (!participant) return 'Conversation';
  if (participant.name) return participant.name;
  const full = [participant.firstName, participant.lastName].filter(Boolean).join(' ');
  return full || participant.email || 'Conversation';
}

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'C'
  );
}

function otherParticipant(
  conversation: Conversation | undefined,
  currentUserId?: string,
) {
  if (!conversation) return undefined;
  const participants = conversation.participants || [];
  return (
    participants.find(
      (participant) => !participant.isViewer && participant.id !== currentUserId,
    ) ||
    participants.find((participant) => participant.id !== currentUserId) ||
    participants[0]
  );
}

function relativeTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function clockTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWorkspace({
  title = 'Messages',
  subtitle = 'Real-time conversations with businesses and affiliates',
  emptyHint = 'Your conversations will appear here.',
}: ChatWorkspaceProps) {
  const { user } = useAuthStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sendError, setSendError] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directoryResults, setDirectoryResults] = useState<DirectoryUser[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    isLoading,
    isLoadingConversations,
    isSending,
    isConnected,
    connectionState,
    disabledReason,
    typingUsers,
    unreadTotal,
    sendMessage,
    createConversation,
    isCreatingConversation,
    searchDirectory,
    notifyTyping,
  } = useMessaging(selectedId || undefined);

  const visibleConversations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((conversation) => {
      const participant = otherParticipant(conversation, user?.id);
      return displayName(participant).toLowerCase().includes(needle);
    });
  }, [conversations, search, user?.id]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );
  const selectedParticipant = otherParticipant(selectedConversation, user?.id);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [selectedId, messages.length]);

  // Deep links and toast clicks open a specific conversation.
  const autoCreatedRecipientRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('conversationId');
    if (id) {
      setSelectedId(id);
      return;
    }

    const recipientId = params.get('recipientId') || params.get('affiliateId');
    if (recipientId && user?.id) {
      const existing = conversations.find((c) =>
        (c.participants || []).some((p) => p.id === recipientId),
      );
      if (existing) {
        if (selectedId !== existing.id) setSelectedId(existing.id);
      } else if (!isLoadingConversations && !isCreatingConversation && autoCreatedRecipientRef.current !== recipientId) {
        autoCreatedRecipientRef.current = recipientId;
        createConversation(recipientId)
          .then((conv) => {
            if (conv?.id) setSelectedId(conv.id);
          })
          .catch((err) => {
            console.error('Could not auto-start conversation with recipient:', err);
          });
      }
    }
  }, [conversations, user?.id, isLoadingConversations, isCreatingConversation, createConversation, selectedId]);

  useEffect(() => {
    const onOpenConversation = (event: Event) => {
      const id = (event as CustomEvent<{ conversationId?: string }>).detail?.conversationId;
      if (id) setSelectedId(id);
    };
    window.addEventListener('mcom_open_chat_conversation', onOpenConversation);
    return () => window.removeEventListener('mcom_open_chat_conversation', onOpenConversation);
  }, []);

  // Directory search (debounced) while the new-chat sheet is open.
  useEffect(() => {
    if (!showNewChat) return;
    let cancelled = false;
    setDirectoryLoading(true);
    setDirectoryError('');
    const timer = setTimeout(() => {
      searchDirectory(directoryQuery.trim())
        .then((results) => {
          if (!cancelled) setDirectoryResults(results);
        })
        .catch((error) => {
          if (!cancelled) {
            setDirectoryError(
              error?.response?.data?.message || 'Could not load the directory.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setDirectoryLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [directoryQuery, showNewChat, searchDirectory]);

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!selectedId || !replyText.trim() || isSending) return;
    const content = replyText.trim();
    setReplyText('');
    setSendError('');
    try {
      await sendMessage({ id: selectedId, content });
    } catch {
      setSendError('Message could not be sent. Please try again.');
    }
  };

  const handleStartConversation = async (recipient: DirectoryUser) => {
    setDirectoryError('');
    try {
      const conversation = await createConversation(recipient.id);
      setSelectedId(conversation.id);
      setShowNewChat(false);
      setDirectoryQuery('');
      setDirectoryResults([]);
    } catch (error: any) {
      setDirectoryError(
        error?.response?.data?.message || 'Could not start that conversation.',
      );
    }
  };

  const connectionBanner = (() => {
    if (disabledReason === 'CENTRAL_ACCOUNT_NOT_CONNECTED') {
      return {
        tone: 'amber',
        text: 'Connect your Central Hub account to message businesses in real time.',
        action: (
          <button
            type="button"
            onClick={() => void mcomService.startLogin()}
            className="rounded-md bg-amber-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-800"
          >
            Connect account
          </button>
        ),
      };
    }
    if (connectionState === 'RECONNECTING' || connectionState === 'CONNECTING') {
      return {
        tone: 'blue',
        text: 'Reconnecting to live chat…',
        action: null,
      };
    }
    if (connectionState === 'DISCONNECTED') {
      return {
        tone: 'slate',
        text: 'Live updates are paused. Messages will still send over the API.',
        action: null,
      };
    }
    return null;
  })();

  return (
    <div className="h-full min-h-0 w-full overflow-hidden bg-white font-display text-slate-900 lg:rounded-xl lg:border lg:border-slate-200">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)]">
        {/* Conversation list */}
        <aside
          className={`${selectedId ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-col border-slate-200 lg:border-r`}
        >
          <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
                  {title}
                  {unreadTotal > 0 ? (
                    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">
                      {unreadTotal > 99 ? '99+' : unreadTotal}
                    </span>
                  ) : null}
                </h1>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  <span
                    className={`mr-1.5 inline-block size-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    aria-hidden="true"
                  />
                  {subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChat(true)}
                disabled={disabledReason === 'CENTRAL_ACCOUNT_NOT_CONNECTED'}
                aria-label="Start a new conversation"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <span className="material-symbols-outlined text-[20px]">add_comment</span>
              </button>
            </div>
            <label className="mt-3 flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="material-symbols-outlined shrink-0 text-lg text-slate-400">
                search
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 sm:text-sm"
              />
            </label>
          </div>

          {connectionBanner ? (
            <div
              className={`flex items-center justify-between gap-2 border-b px-4 py-2 text-[11px] ${
                connectionBanner.tone === 'amber'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : connectionBanner.tone === 'blue'
                    ? 'border-blue-100 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <span className="min-w-0">{connectionBanner.text}</span>
              {connectionBanner.action}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isLoading && !conversations.length ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                Loading conversations…
              </p>
            ) : null}
            {!isLoading && !conversations.length ? (
              <div className="px-5 py-12 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300">
                  forum
                </span>
                <h2 className="mt-2 text-sm font-semibold text-slate-800">
                  No conversations yet
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{emptyHint}</p>
              </div>
            ) : null}
            {conversations.length > 0 && !visibleConversations.length ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No conversations match that search.
              </p>
            ) : null}
            {visibleConversations.map((conversation) => {
              const participant = otherParticipant(conversation, user?.id);
              const name = displayName(participant);
              const isSelected = selectedId === conversation.id;
              const unread = conversation.unreadCount || 0;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(conversation.id);
                    setSendError('');
                  }}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`flex w-full min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors sm:px-5 ${
                    isSelected
                      ? 'border-l-[3px] border-l-blue-700 bg-blue-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="relative shrink-0">
                    {participant?.profileImage ? (
                      <img
                        src={participant.profileImage}
                        alt=""
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        {initials(name)}
                      </span>
                    )}
                    {participant?.isOnline ? (
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-slate-900">
                        {name}
                      </span>
                      <time className="shrink-0 text-[10px] text-slate-500">
                        {relativeTime(conversation.lastMessageAt || conversation.updatedAt)}
                      </time>
                    </span>
                    <span className="mt-1 flex min-w-0 items-center gap-2">
                      <span
                        className={`block min-w-0 flex-1 truncate text-xs ${
                          unread > 0 ? 'font-semibold text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        {conversation.lastMessageContent || 'No messages yet'}
                      </span>
                      {unread > 0 ? (
                        <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      ) : null}
                    </span>
                    {participant?.roleTitle || participant?.role ? (
                      <span className="mt-1 block truncate text-[10px] capitalize text-slate-400">
                        {(participant.roleTitle || participant.role || '').replaceAll('_', ' ')}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Thread */}
        <section
          className={`${selectedId ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-col bg-slate-50/60`}
          aria-label="Conversation"
        >
          {selectedConversation ? (
            <>
              <header className="flex min-h-[60px] shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(null);
                      setReplyText('');
                      setSendError('');
                    }}
                    aria-label="Back to conversations"
                    className="flex size-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  {selectedParticipant?.profileImage ? (
                    <img
                      src={selectedParticipant.profileImage}
                      alt=""
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {initials(displayName(selectedParticipant))}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-slate-950">
                      {displayName(selectedParticipant)}
                    </h2>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {typingUsers.length > 0
                        ? `${typingUsers[0].userName} is typing…`
                        : selectedParticipant?.isOnline
                          ? 'Online'
                          : selectedParticipant?.roleTitle ||
                            selectedParticipant?.role?.replaceAll('_', ' ') ||
                            'Conversation'}
                    </p>
                  </div>
                </div>
              </header>

              <div
                ref={messageListRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-5"
              >
                {!messages.length && !isLoading ? (
                  <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300">
                      chat
                    </span>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      Start the conversation
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Send a message to begin.
                    </p>
                  </div>
                ) : null}
                {messages.map((message: Message) => {
                  const sentByMe = message.isSender || message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`mb-4 flex min-w-0 ${sentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[88%] break-words rounded-2xl border px-3 py-2.5 text-[13px] leading-5 sm:max-w-[75%] sm:px-4 sm:py-3 sm:text-sm ${
                          sentByMe
                            ? 'rounded-tr-sm border-blue-700 bg-blue-700 text-white'
                            : 'rounded-tl-sm border-slate-200 bg-white text-slate-800'
                        } ${message.failed ? 'border-red-300 bg-red-50 text-red-800' : ''}`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <time
                          className={`mt-1.5 block text-right text-[9px] ${
                            sentByMe ? 'text-white/70' : 'text-slate-400'
                          }`}
                        >
                          {message.pending
                            ? 'Sending…'
                            : message.failed
                              ? 'Failed'
                              : clockTime(message.createdAt)}
                        </time>
                      </div>
                    </div>
                  );
                })}
                {typingUsers.length > 0 ? (
                  <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                    </span>
                    {typingUsers.map((entry) => entry.userName).join(', ')} typing
                  </div>
                ) : null}
              </div>

              <form
                onSubmit={(event) => void handleSend(event)}
                className="shrink-0 border-t border-slate-200 bg-white p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:p-4"
              >
                {sendError ? (
                  <p role="alert" className="mb-2 px-1 text-xs text-red-700">
                    {sendError}
                  </p>
                ) : null}
                <div className="mx-auto flex min-w-0 max-w-4xl items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 sm:gap-3 sm:p-2">
                  <input
                    type="text"
                    placeholder="Write a message…"
                    aria-label="Write a message"
                    className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-slate-400 sm:text-sm"
                    value={replyText}
                    onChange={(event) => {
                      setReplyText(event.target.value);
                      if (event.target.value.trim()) notifyTyping();
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    aria-label="Send message"
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300">
                forum
              </span>
              <h2 className="mt-3 text-sm font-semibold text-slate-800">
                Select a conversation
              </h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                Choose a conversation from the list, or start a new one with a business.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* New conversation sheet */}
      {showNewChat ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Close new conversation"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setShowNewChat(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-chat-title"
            className="relative flex max-h-[86dvh] w-full max-w-lg flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h2 id="new-chat-title" className="text-sm font-semibold text-slate-900">
                New conversation
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowNewChat(false)}
                className="flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="border-b border-slate-100 px-4 py-3">
              <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="material-symbols-outlined text-lg text-slate-400">
                  search
                </span>
                <input
                  autoFocus
                  value={directoryQuery}
                  onChange={(event) => setDirectoryQuery(event.target.value)}
                  placeholder="Search businesses and members"
                  aria-label="Search directory"
                  className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 sm:text-sm"
                />
              </label>
              {directoryError ? (
                <p role="alert" className="mt-2 text-xs text-red-700">
                  {directoryError}
                </p>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {directoryLoading ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">Searching…</p>
              ) : null}
              {!directoryLoading && !directoryResults.length ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  No people found.
                </p>
              ) : null}
              {directoryResults.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  disabled={isCreatingConversation}
                  onClick={() => void handleStartConversation(person)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-slate-50 disabled:opacity-60"
                >
                  {person.profileImage ? (
                    <img
                      src={person.profileImage}
                      alt=""
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {initials(person.displayName)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-slate-900">
                      {person.displayName}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                      {person.businessName || person.email}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] capitalize text-slate-400">
                    {person.role.replaceAll('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
