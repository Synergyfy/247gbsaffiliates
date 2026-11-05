'use client';

import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function AgentMessagesPage() {
  return (
    <ChatWorkspace
      title="Messages"
      subtitle="Your real-time conversations"
      emptyHint="Start a conversation with a business or another affiliate."
    />
  );
}
