import { ArrowLeft, Send, User, Maximize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface Message {
    id: string;
    sender: 'user' | 'support';
    text: string;
    timestamp: string;
}

export default function ChatView({ onBack }: { onBack: () => void }) {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'support',
            text: 'Hi John, I see you have a question about invoice #442. How can I help you today?',
            timestamp: '10:30 AM'
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // Simulate support response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'support',
                text: 'Thanks for the details. Let me check that for you right away.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[500px] bg-white dark:bg-zinc-900 font-sans">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <button
                    onClick={onBack}
                    className="p-1 -ml-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Support Chat</h3>
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Sarah is online
                    </p>
                </div>
                <button
                    className="ml-auto p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    title="Open in full page"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex items-end gap-2 max-w-[85%]",
                            msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                            msg.sender === 'user'
                                ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                : "bg-brand-50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-500/20"
                        )}>
                            {msg.sender === 'user' ? (
                                <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            ) : (
                                <span className="text-xs font-bold text-brand-700 dark:text-brand-400">S</span>
                            )}
                        </div>

                        <div className={clsx(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                            msg.sender === 'user'
                                ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-tr-none"
                                : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-transparent dark:border-zinc-700"
                        )}>
                            {msg.text}
                            <div className={clsx(
                                "text-[10px] mt-1 opacity-50",
                                msg.sender === 'user' ? "text-right" : "text-left"
                            )}>
                                {msg.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-2 pr-2 rounded-full border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-sm px-3 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:ring-0 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-2 rounded-full bg-brand-200 hover:bg-brand-300 dark:bg-brand-400 dark:hover:bg-brand-500 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
