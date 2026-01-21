'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ChatOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    recipientAvatar: string;
}

export default function ChatOverlay({ isOpen, onClose, recipientName, recipientAvatar }: ChatOverlayProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm on my way. Should be there in about 12 minutes.", sender: "artisan", time: "10:15 AM" },
        { id: 2, text: "Great, thanks for letting me know! The gate code is 4432.", sender: "user", time: "10:16 AM" },
        { id: 3, text: "Got it. See you soon!", sender: "artisan", time: "10:17 AM" },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        const newMessage = {
            id: messages.length + 1,
            text: message,
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...messages, newMessage]);
        setMessage("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 pointer-events-auto"
                    />

                    {/* Chat Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[450px] bg-white shadow-2xl z-70 pointer-events-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-cover bg-center border-2 border-primary/20" style={{ backgroundImage: `url('${recipientAvatar}')` }}></div>
                                <div>
                                    <h3 className="text-lg font-black text-text-main leading-tight">{recipientName}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-text-secondary transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex justify-center mb-4">
                                <span className="px-4 py-1.5 rounded-full bg-gray-50 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] border border-gray-100 text-center">
                                    Wednesday, Oct 24
                                </span>
                            </div>

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-gray-100 text-text-main rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] font-bold text-text-secondary mt-1.5 px-1">{msg.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3 bg-white p-2 rounded-[1.25rem] border border-gray-200 shadow-sm focus-within:border-primary/50 transition-colors">
                                <button className="size-10 flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">add_circle</span>
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-text-secondary/50 focus:ring-0"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim()}
                                    className="size-10 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:bg-gray-200 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-text-secondary font-bold mt-4 uppercase tracking-widest opacity-50">
                                Messages are encrypted and secure
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
