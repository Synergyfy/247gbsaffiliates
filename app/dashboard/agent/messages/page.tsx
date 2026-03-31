'use client';

import React from 'react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuthStore } from '@/store/useAuthStore';

export default function AgentMessagesPage() {
    const { user } = useAuthStore();
    const { conversations, messages, sendMessage, isSending } = useMessaging();
    const [selectedConvId, setSelectedConvId] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState('');

    // Fetch messages for the selected conversation automatically via the hook
    // (The hook already takes selectedConversationId as an argument and refetches)

    const handleSendReply = async () => {
        if (!selectedConvId || !replyText.trim()) return;
        try {
            await sendMessage({ id: selectedConvId, content: replyText });
            setReplyText('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const selectedConversation = conversations?.find(c => c.id === selectedConvId);

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col font-display">
            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-80 border-r border-slate-200 bg-surface-light flex flex-col">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-black text-text-main uppercase tracking-tighter italic">Inbox</h2>
                        <div className="mt-4 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" 
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {conversations?.map((conv) => (
                            <div 
                                key={conv.id} 
                                onClick={() => setSelectedConvId(conv.id)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                                    selectedConvId === conv.id 
                                    ? 'bg-primary/5 border-primary/20 shadow-md ring-1 ring-primary/10' 
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-slate-800 shrink-0 flex items-center justify-center text-white text-xs font-bold italic shadow-inner">
                                        {conv.participant?.name.slice(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="text-xs font-black text-text-main truncate uppercase tracking-tighter">
                                                {conv.participant?.name}
                                            </h4>
                                            <span className="text-[9px] font-bold text-text-secondary italic">
                                                {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-medium text-text-secondary truncate leading-relaxed">
                                            {conv.lastMessageContent || 'No messages yet...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50/30">
                    {selectedConversation ? (
                        <>
                            <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold italic">
                                        {selectedConversation.participant?.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-text-main uppercase tracking-tighter">
                                            {selectedConversation.participant?.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-1.5 bg-green-500 rounded-full"></span>
                                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Active Now</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-primary transition-all">
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="flex justify-center">
                                    <span className="bg-slate-100 text-slate-400 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border border-slate-200">Session Securely Encrypted</span>
                                </div>

                                {messages?.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-4 rounded-2xl max-w-md text-[13px] font-medium shadow-sm leading-relaxed ${
                                            msg.senderId === user?.id 
                                            ? 'bg-primary text-white rounded-tr-none' 
                                            : 'bg-white text-text-main border border-slate-200 rounded-tl-none'
                                        }`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-[8px] font-bold mt-2 uppercase tracking-widest ${
                                                msg.senderId === user?.id ? 'text-white/60' : 'text-slate-400'
                                            }`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                                <div className="max-w-4xl mx-auto flex items-center gap-3">
                                    <button className="p-3 text-slate-400 hover:text-primary transition-all hover:bg-slate-50 rounded-2xl">
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </button>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" 
                                            placeholder="Forge your message..." 
                                            className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all italic placeholder:text-slate-300" 
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        />
                                        <button 
                                            onClick={handleSendReply}
                                            disabled={isSending || !replyText.trim()}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary p-2 hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                                        >
                                            <span className="material-symbols-outlined font-black">send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 animate-bounce">forum</span>
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter italic">Select a conversation</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">to begin your strategic session</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
