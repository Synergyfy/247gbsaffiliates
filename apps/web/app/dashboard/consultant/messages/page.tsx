'use client';

import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function ConsultantMessagesPage() {
  return (
    <div className="h-[calc(100dvh-9rem)] min-h-[400px] p-2 sm:h-[calc(100dvh-68px)] sm:min-h-[460px] sm:p-4">
      <ChatWorkspace
        title="Messages"
        subtitle="Real-time conversations with businesses and affiliates"
        emptyHint="Start a conversation with a business or an affiliate."
      />
    </div>
  );
}
