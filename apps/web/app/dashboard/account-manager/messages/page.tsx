'use client';

import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function AccountManagerMessagesPage() {
  return (
    <div className="h-[calc(100dvh-64px)] min-h-[560px] p-3 sm:p-5">
      <ChatWorkspace
        title="Messages"
        subtitle="Talk to the businesses and agents you manage"
        emptyHint="Start a conversation with a business or an agent."
      />
    </div>
  );
}
