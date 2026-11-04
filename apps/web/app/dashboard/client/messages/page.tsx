'use client';

import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function ClientMessagesPage() {
  return (
    <div className="h-[calc(100dvh-4rem)] min-h-[560px] p-3 sm:p-5">
      <ChatWorkspace
        title="Messages"
        subtitle="Talk to your account manager and affiliates in real time"
        emptyHint="Start a conversation with your account manager."
      />
    </div>
  );
}
