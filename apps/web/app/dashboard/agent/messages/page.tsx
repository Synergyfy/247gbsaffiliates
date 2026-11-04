'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMessaging, type Conversation } from '@/hooks/useMessaging';
import { useAuthStore } from '@/store/useAuthStore';

const getParticipant = (conversation: Conversation, userId?: string) =>
    conversation.participants?.find((participant) => participant.id !== userId)
    ?? conversation.participant;

const getParticipantName = (conversation: Conversation, userId?: string) => {
    const participant = getParticipant(conversation, userId);
    if (!participant) return 'Conversation';
    if (participant.name) return participant.name;
    return [participant.firstName, participant.lastName].filter(Boolean).join(' ') || participant.email || 'Conversation';
};

const getInitials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';

export default function AgentMessagesPage() {
    const { user } = useAuthStore();
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [search, setSearch] = useState('');
    const [sendError, setSendError] = useState('');
    const messageListRef = useRef<HTMLDivElement>(null);
    const { conversations, messages, sendMessage, isSending, isLoading } = useMessaging(selectedConvId || undefined);

    const visibleConversations = useMemo(
        () => (conversations || []).filter((conversation) => getParticipantName(conversation, user?.id).toLowerCase().includes(search.trim().toLowerCase())),
        [conversations, search, user?.id],
    );
    const selectedConversation = conversations?.find((conversation) => conversation.id === selectedConvId);
    const selectedParticipantName = selectedConversation ? getParticipantName(selectedConversation, user?.id) : '';

    useEffect(() => {
        const messageList = messageListRef.current;
        if (messageList) messageList.scrollTop = messageList.scrollHeight;
    }, [selectedConvId, messages?.length]);

    const handleSendReply = async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (!selectedConvId || !replyText.trim() || isSending) return;
        setSendError('');
        try {
            await sendMessage({ id: selectedConvId, content: replyText.trim() });
            setReplyText('');
        } catch {
            setSendError('Message could not be sent. Please try again.');
        }
    };

    return (
        <div className="h-full min-h-0 w-full overflow-hidden bg-white font-display text-slate-900 lg:rounded-xl lg:border lg:border-slate-200">
            <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className={`${selectedConvId ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-col border-slate-200 lg:border-r`}>
                    <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h1 className="text-lg font-bold text-slate-950 sm:text-xl">Messages</h1>
                                <p className="mt-0.5 text-[11px] text-slate-500">Your conversations</p>
                            </div>
                            {conversations?.length ? <span className="text-[10px] font-medium text-slate-500">{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</span> : null}
                        </div>
                        <label className="mt-3 flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                            <span className="material-symbols-outlined shrink-0 text-lg text-slate-400">search</span>
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 sm:text-sm" />
                        </label>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        {isLoading && !conversations?.length ? <p className="px-4 py-8 text-center text-sm text-slate-500">Loading conversations…</p> : null}
                        {!isLoading && !conversations?.length ? <div className="px-5 py-12 text-center"><span className="material-symbols-outlined text-3xl text-slate-300">forum</span><h2 className="mt-2 text-sm font-semibold text-slate-800">No conversations yet</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Your affiliate conversations will appear here.</p></div> : null}
                        {conversations?.length && !visibleConversations.length ? <p className="px-4 py-8 text-center text-sm text-slate-500">No conversations match that search.</p> : null}
                        {visibleConversations.map((conversation) => {
                            const name = getParticipantName(conversation, user?.id);
                            const participant = getParticipant(conversation, user?.id);
                            const isSelected = selectedConvId === conversation.id;
                            return (
                                <button key={conversation.id} type="button" onClick={() => { setSelectedConvId(conversation.id); setSendError(''); }} aria-current={isSelected ? 'true' : undefined} className={`flex w-full min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors sm:px-5 ${isSelected ? 'border-l-[3px] border-l-blue-700 bg-blue-50/70' : 'hover:bg-slate-50'}`}>
                                    {participant?.profileImage ? <img src={participant.profileImage} alt="" className="size-10 shrink-0 rounded-full object-cover" /> : <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{getInitials(name)}</span>}
                                    <span className="min-w-0 flex-1">
                                        <span className="flex min-w-0 items-center justify-between gap-2"><span className="truncate text-[13px] font-semibold text-slate-900">{name}</span><time className="shrink-0 text-[10px] text-slate-500">{new Date(conversation.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</time></span>
                                        <span className="mt-1 block truncate text-xs text-slate-600">{conversation.lastMessageContent || 'No messages yet'}</span>
                                        {participant?.role && <span className="mt-1 block truncate text-[10px] capitalize text-slate-400">{participant.role.replaceAll('_', ' ')}</span>}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <section className={`${selectedConvId ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-col bg-slate-50/60`} aria-label="Conversation">
                    {selectedConversation ? <>
                        <header className="flex min-h-[60px] shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-5">
                            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <button type="button" onClick={() => { setSelectedConvId(null); setReplyText(''); setSendError(''); }} aria-label="Back to conversations" className="flex size-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"><span className="material-symbols-outlined">arrow_back</span></button>
                                {(() => { const participant = getParticipant(selectedConversation, user?.id); return participant?.profileImage ? <img src={participant.profileImage} alt="" className="size-9 shrink-0 rounded-full object-cover" /> : <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{getInitials(selectedParticipantName)}</span>; })()}
                                <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-950">{selectedParticipantName}</h2><p className="mt-0.5 truncate text-[10px] capitalize text-slate-500">{getParticipant(selectedConversation, user?.id)?.role?.replaceAll('_', ' ') || 'Conversation'}</p></div>
                            </div>
                        </header>

                        <div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-5">
                            {!messages?.length && !isLoading ? <div className="flex h-full min-h-40 flex-col items-center justify-center text-center"><span className="material-symbols-outlined text-3xl text-slate-300">chat</span><p className="mt-2 text-sm font-medium text-slate-700">Start the conversation</p><p className="mt-1 text-xs text-slate-500">Send a message to begin.</p></div> : null}
                            {messages?.map((message) => {
                                const sentByMe = message.senderId === user?.id;
                                return <div key={message.id} className={`mb-4 flex min-w-0 ${sentByMe ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] break-words rounded-2xl border px-3 py-2.5 text-[13px] leading-5 sm:max-w-[75%] sm:px-4 sm:py-3 sm:text-sm ${sentByMe ? 'rounded-tr-sm border-blue-700 bg-blue-700 text-white' : 'rounded-tl-sm border-slate-200 bg-white text-slate-800'}`}><p className="whitespace-pre-wrap">{message.content}</p><time className={`mt-1.5 block text-right text-[9px] ${sentByMe ? 'text-white/70' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div></div>;
                            })}
                        </div>

                        <form onSubmit={(event) => void handleSendReply(event)} className="shrink-0 border-t border-slate-200 bg-white p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:p-4">
                            {sendError && <p role="alert" className="mb-2 px-1 text-xs text-red-700">{sendError}</p>}
                            <div className="mx-auto flex min-w-0 max-w-4xl items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 sm:gap-3 sm:p-2">
                                <input type="text" placeholder="Write a message…" aria-label="Write a message" className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-slate-400 sm:text-sm" value={replyText} onChange={(event) => setReplyText(event.target.value)} />
                                <button type="submit" disabled={isSending || !replyText.trim()} aria-label="Send message" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"><span className="material-symbols-outlined text-[20px]">send</span></button>
                            </div>
                        </form>
                    </> : <div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><span className="material-symbols-outlined text-4xl text-slate-300">forum</span><h2 className="mt-3 text-sm font-semibold text-slate-800">Select a conversation</h2><p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">Choose a conversation from the list to read and reply.</p></div>}
                </section>
            </div>
        </div>
    );
}
