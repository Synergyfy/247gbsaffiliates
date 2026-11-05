'use client';

import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function ConsultantMessagesPage() {
  return (
    <div className="h-[calc(100dvh-64px)] min-h-[560px] p-3 sm:p-5">
      <ChatWorkspace
        title="Messages"
        subtitle="Real-time conversations with businesses and affiliates"
        emptyHint="Start a conversation with a business or an affiliate."
      />
    </div>
  );
}
