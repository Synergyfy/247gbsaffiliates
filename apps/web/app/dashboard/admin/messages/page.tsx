'use client';

import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function AdminMessagesPage() {
  return (
    <div className="h-[calc(100dvh-9rem)] min-h-[560px]">
      <ChatWorkspace
        title="Messages"
        subtitle="Platform-wide real-time conversations"
        emptyHint="Start a conversation with a business or an affiliate."
      />
    </div>
  );
}
