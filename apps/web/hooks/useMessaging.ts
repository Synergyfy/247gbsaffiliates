'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { chatConnection, ConnectionState } from '@/lib/chat/connection';
import { useAuthStore } from '@/store/useAuthStore';

export interface ConversationParticipant {
  id: string;
  centralUserId?: string;
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
  role?: string;
  roleTitle?: string;
  status?: 'online' | 'offline';
  isOnline?: boolean;
  lastReadAt?: string | null;
  isViewer?: boolean;
}

export interface Conversation {
  id: string;
  type?: string;
  participantIds?: string[];
  lastMessageContent?: string | null;
  lastMessageAt?: string | null;
  updatedAt: string;
  createdAt?: string;
  unreadCount?: number;
  isMuted?: boolean;
  isOnline?: boolean;
  viewerCentralId?: string;
  participants?: ConversationParticipant[];
  participant?: ConversationParticipant;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string | null;
  content: string;
  createdAt: string;
  isSender?: boolean;
  isRead?: boolean;
  pending?: boolean;
  failed?: boolean;
  clientTempId?: string | null;
}

export interface DirectoryUser {
  id: string;
  localUserId?: string | null;
  displayName: string;
  email: string;
  role: string;
  businessName?: string | null;
  profileImage?: string | null;
  isOnline?: boolean;
}

export interface TypingUser {
  userId: string;
  userName: string;
  expiresAt?: number;
}

const conversationsKey = ['conversations'] as const;
const messagesKey = (conversationId?: string) => ['messages', conversationId] as const;

function mergeMessage(list: Message[], incoming: Message): Message[] {
  const tempId = incoming.clientTempId || null;
  const withoutTemp = tempId ? list.filter((message) => message.id !== tempId) : list;
  if (withoutTemp.some((message) => message.id === incoming.id)) {
    return withoutTemp.map((message) =>
      message.id === incoming.id ? { ...message, ...incoming, pending: false, failed: false } : message,
    );
  }
  return [...withoutTemp, { ...incoming, pending: false, failed: false }];
}

function updateConversationPreview(
  conversations: Conversation[] | undefined,
  conversationId: string,
  patch: Partial<Conversation>,
): Conversation[] | undefined {
  if (!conversations) return conversations;
  return conversations.map((conversation) =>
    conversation.id === conversationId ? { ...conversation, ...patch } : conversation,
  );
}

export function useMessaging(selectedConversationId?: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    chatConnection.getState(),
  );
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [disabledReason, setDisabledReason] = useState<string | null>(
    chatConnection.getDisabledReason(),
  );
  const typingTimer = useRef<any>(null);

  // ── Connection lifecycle ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = chatConnection.subscribe();
    const offState = chatConnection.onStateChange((next) => {
      setConnectionState(next);
      setDisabledReason(chatConnection.getDisabledReason());
    });
    return () => {
      offState();
      unsubscribe();
    };
  }, []);

  // ── Conversation list ─────────────────────────────────────────────────────
  const conversationsQuery = useQuery({
    queryKey: conversationsKey,
    queryFn: async () => {
      const response = await apiClient.get('/messaging/conversations');
      return response.data as Conversation[];
    },
    // Socket events keep this fresh; polling is only a safety net.
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  // ── Messages for the selected conversation ────────────────────────────────
  const messagesQuery = useQuery({
    queryKey: messagesKey(selectedConversationId),
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const response = await apiClient.get(
        `/messaging/conversations/${selectedConversationId}/messages`,
        { params: { limit: 50 } },
      );
      return response.data as Message[];
    },
    enabled: Boolean(selectedConversationId),
  });

  const markRead = useCallback(
    (conversationId: string) => {
      apiClient
        .post(`/messaging/conversations/${conversationId}/read`)
        .catch(() => undefined);
      queryClient.setQueryData<Conversation[]>(conversationsKey, (old) =>
        updateConversationPreview(old, conversationId, { unreadCount: 0 }),
      );
    },
    [queryClient],
  );

  // ── Real-time events ──────────────────────────────────────────────────────
  useEffect(() => {
    const offNewMessage = chatConnection.on('new_message', (payload: Message) => {
      const isActive = payload.conversationId === selectedConversationId;
      queryClient.setQueryData<Message[]>(messagesKey(payload.conversationId), (old = []) =>
        mergeMessage(old, payload),
      );
      const isMine = Boolean(payload.isSender) || payload.senderId === user?.id;
      queryClient.setQueryData<Conversation[]>(conversationsKey, (old) =>
        old?.map((conversation) =>
          conversation.id === payload.conversationId
            ? {
                ...conversation,
                lastMessageContent: payload.content,
                lastMessageAt: payload.createdAt,
                updatedAt: payload.createdAt,
                unreadCount:
                  isActive || isMine ? 0 : (conversation.unreadCount || 0) + 1,
              }
            : conversation,
        ),
      );
      if (isActive && !payload.isSender && payload.senderId !== user?.id) {
        markRead(payload.conversationId);
      }
    });

    const offInbox = chatConnection.on('inbox_update', (payload: any) => {
      queryClient.setQueryData<Conversation[]>(conversationsKey, (old) =>
        old?.map((conversation) => {
          if (conversation.id !== payload.conversationId) return conversation;
          const isActive = conversation.id === selectedConversationId;
          const isMine = payload.lastMessageSenderId === conversation.viewerCentralId;
          return {
            ...conversation,
            lastMessageContent: payload.lastMessageText,
            lastMessageAt: payload.lastMessageAt,
            updatedAt: payload.lastMessageAt,
            unreadCount: isActive || isMine ? 0 : (conversation.unreadCount || 0) + 1,
          };
        }),
      );
    });

    const offTyping = chatConnection.on('typing_update', (payload: any) => {
      if (payload?.conversationId !== selectedConversationId) return;
      setTypingUsers(
        (payload.typingUsers || []).filter((entry: TypingUser) => entry.userId !== user?.id),
      );
    });

    const offPresence = chatConnection.on('presence_update', (payload: any) => {
      queryClient.setQueryData<Conversation[]>(conversationsKey, (old) =>
        old?.map((conversation) => ({
          ...conversation,
          participants: conversation.participants?.map((participant) =>
            (participant.centralUserId || participant.id) === payload.userId
              ? { ...participant, isOnline: Boolean(payload.isOnline), status: payload.isOnline ? 'online' : 'offline' }
              : participant,
          ),
        })),
      );
    });

    const offNotification = chatConnection.on('chat_notification', () => {
      void queryClient.invalidateQueries({ queryKey: conversationsKey });
    });

    return () => {
      offNewMessage();
      offInbox();
      offTyping();
      offPresence();
      offNotification();
    };
  }, [selectedConversationId, queryClient, user?.id, markRead]);

  // ── Join the active conversation & watch participant presence ─────────────
  useEffect(() => {
    if (!selectedConversationId) return;
    const join = () => {
      chatConnection.emit('join_conversation', { conversationId: selectedConversationId });
      chatConnection.emit('viewing_conversation', { conversationId: selectedConversationId });
    };
    // The socket may still be connecting when a conversation is selected, so
    // re-join whenever the connection (re)opens.
    join();
    const offConnect = chatConnection.on('connect', join);
    const offConnected = chatConnection.on('connected', join);
    setTypingUsers([]);
    return () => {
      offConnect();
      offConnected();
      chatConnection.emit('leave_conversation', { conversationId: selectedConversationId });
      chatConnection.emit('stop_viewing_conversation', {
        conversationId: selectedConversationId,
      });
    };
  }, [selectedConversationId]);

  useEffect(() => {
    const centralIds = Array.from(
      new Set(
        (conversationsQuery.data || [])
          .flatMap((conversation) => conversation.participants || [])
          .map((participant) => participant.centralUserId)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    if (!centralIds.length) return;

    const watch = () => chatConnection.emit('watch_presence', { userIds: centralIds });
    watch();
    const offConnect = chatConnection.on('connect', watch);
    return () => offConnect();
  }, [conversationsQuery.data]);

  // ── Send (socket first, REST fallback) ────────────────────────────────────
  const sendMessageMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: Message = {
        id: tempId,
        conversationId: id,
        senderId: user?.id || 'me',
        content,
        createdAt: new Date().toISOString(),
        isSender: true,
        pending: true,
        clientTempId: tempId,
      };
      queryClient.setQueryData<Message[]>(messagesKey(id), (old = []) => [...old, optimistic]);
      queryClient.setQueryData<Conversation[]>(conversationsKey, (old) =>
        updateConversationPreview(old, id, {
          lastMessageContent: content,
          lastMessageAt: optimistic.createdAt,
          updatedAt: optimistic.createdAt,
        }),
      );

      const useRest = () =>
        apiClient
          .post(`/messaging/conversations/${id}/messages`, {
            content,
            idempotencyKey: tempId,
          })
          .then((response) => {
            queryClient.setQueryData<Message[]>(messagesKey(id), (old = []) =>
              mergeMessage(old, { ...response.data, clientTempId: tempId }),
            );
            return response.data;
          })
          .catch((error) => {
            queryClient.setQueryData<Message[]>(messagesKey(id), (old = []) =>
              old.map((message) => (message.id === tempId ? { ...message, pending: false, failed: true } : message)),
            );
            throw error;
          });

      const emitted = chatConnection.emit(
        'send_message',
        { conversationId: id, content, idempotencyKey: tempId },
        (response: any) => {
          if (response?.success && response.message) {
            queryClient.setQueryData<Message[]>(messagesKey(id), (old = []) =>
              mergeMessage(old, { ...response.message, clientTempId: tempId }),
            );
            return;
          }
          void useRest();
        },
      );

      if (!emitted) return useRest();
      return { pending: true };
    },
  });

  const startConversationMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await apiClient.post('/messaging/conversations', {
        recipientId,
      });
      return response.data as Conversation;
    },
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(conversationsKey, (old = []) => {
        if (old.some((entry) => entry.id === conversation.id)) return old;
        return [conversation, ...old];
      });
    },
  });

  const searchDirectory = useCallback(async (query: string): Promise<DirectoryUser[]> => {
    const response = await apiClient.get('/messaging/directory', {
      params: { q: query },
    });
    return (response.data || []) as DirectoryUser[];
  }, []);

  const notifyTyping = useCallback(() => {
    if (!selectedConversationId) return;
    chatConnection.emit('typing_start', { conversationId: selectedConversationId });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      chatConnection.emit('typing_stop', { conversationId: selectedConversationId });
    }, 2500);
  }, [selectedConversationId]);

  useEffect(
    () => () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    },
    [],
  );

  const conversations = conversationsQuery.data || [];
  const messages = messagesQuery.data || [];
  const unreadTotal = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0),
    [conversations],
  );

  return {
    conversations,
    messages,
    isLoading: conversationsQuery.isLoading || messagesQuery.isLoading,
    isLoadingConversations: conversationsQuery.isLoading,
    isSending: sendMessageMutation.isPending,
    isConnected: connectionState === 'CONNECTED',
    connectionState,
    disabledReason,
    typingUsers,
    unreadTotal,
    sendMessage: sendMessageMutation.mutateAsync,
    createConversation: startConversationMutation.mutateAsync,
    isCreatingConversation: startConversationMutation.isPending,
    searchDirectory,
    notifyTyping,
    markRead,
    refreshConversations: () => queryClient.invalidateQueries({ queryKey: conversationsKey }),
  };
}
