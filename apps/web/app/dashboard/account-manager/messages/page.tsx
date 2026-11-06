'use client';

import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function AccountManagerMessagesPage() {
  return (
    <div className="h-[calc(100dvh-9rem)] min-h-[400px] p-2 sm:h-[calc(100dvh-68px)] sm:min-h-[460px] sm:p-4">
      <ChatWorkspace
        title="Messages"
        subtitle="Talk to the businesses and agents you manage"
        emptyHint="Start a conversation with a business or an agent."
      />
    </div>
  );
}
