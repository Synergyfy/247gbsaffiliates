import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageContent?: string;
  updatedAt: string;
  participant?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    status: 'online' | 'offline';
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const useMessaging = (selectedConversationId?: string) => {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiClient.get('/messaging/conversations');
      return response.data as Conversation[];
    },
    refetchInterval: 10000, // Poll conversations list every 10 seconds
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const response = await apiClient.get(`/messaging/conversations/${selectedConversationId}/messages`);
      return response.data as Message[];
    },
    enabled: !!selectedConversationId,
    refetchInterval: 5000, // Poll messages for selected conversation every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await apiClient.post(`/messaging/conversations/${id}/messages`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await apiClient.post('/messaging/conversations', { recipientId });
      return response.data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversations,
    messages,
    isLoading: isLoadingConversations || isLoadingMessages,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    createConversation: createConversationMutation.mutateAsync,
  };
};
