import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Mic } from 'lucide-react';
import { cn } from '../lib/utils';

const initialMessages = [
    {
        id: 1,
        type: 'bot',
        text: 'Hello! I\'m CareBot, your AI Health Assistant. How can I help you today?',
        timestamp: '10:30 AM',
    },
    {
        id: 2,
        type: 'user',
        text: 'I\'ve been having headaches for the past 3 days.',
        timestamp: '10:31 AM',
    },
    {
        id: 3,
        type: 'bot',
        text: 'I understand you\'re experiencing headaches. Can you tell me more about them? Are they constant or do they come and go? What\'s the pain level on a scale of 1-10?',
        timestamp: '10:31 AM',
    },
    {
        id: 4,
        type: 'user',
        text: 'They come and go, mostly in the afternoon. Pain level is around 6-7.',
        timestamp: '10:32 AM',
    },
    {
        id: 5,
        type: 'bot',
        text: 'Thank you for sharing. Based on your symptoms, here are some recommendations:\n\n1. Stay hydrated - drink at least 8 glasses of water daily\n2. Ensure proper sleep (7-8 hours)\n3. Take breaks from screen time\n4. Consider over-the-counter pain relief like Paracetamol\n\nIf headaches persist for more than a week or worsen, I recommend consulting with a doctor. Would you like me to schedule a consultation?',
        timestamp: '10:32 AM',
        suggestions: ['Schedule Consultation', 'Order Medicine', 'More Tips'],
    },
];

export default function AIHealthAssistant() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            type: 'user',
            text: inputText,
            timestamp: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages([...messages, newMessage]);
        setInputText('');

        // Simulate bot response
        setTimeout(() => {
            const botResponse = {
                id: messages.length + 2,
                type: 'bot',
                text: 'I\'m processing your request. This is a demo response. In a real application, this would connect to an AI health assistant API.',
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
            setMessages((prev) => [...prev, botResponse]);
        }, 1000);
    };

    const handleSuggestionClick = (suggestion) => {
        setInputText(suggestion);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-secondary pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <div className="text-left">
                            <h1 className="text-base font-bold text-white">CareBot</h1>
                            <p className="text-xs font-medium text-white/80 flex items-center gap-1">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 px-5 py-4 space-y-4 pb-24 overflow-y-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            'flex',
                            message.type === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'max-w-[80%] rounded-2xl px-4 py-3',
                                message.type === 'user'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-white text-slate-900 rounded-bl-sm shadow-soft'
                            )}
                        >
                            <p className="text-sm font-medium whitespace-pre-line leading-relaxed">
                                {message.text}
                            </p>
                            <p
                                className={cn(
                                    'text-[10px] font-semibold mt-1',
                                    message.type === 'user' ? 'text-white/70' : 'text-slate-400'
                                )}
                            >
                                {message.timestamp}
                            </p>

                            {message.suggestions && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {message.suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="px-3 py-1.5 bg-teal-50 text-primary rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                    <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className={cn(
                            'flex size-10 items-center justify-center rounded-full transition-all',
                            inputText.trim()
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-slate-100 text-slate-400'
                        )}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-center gap-2 mt-3">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100">
                        <Mic className="w-3.5 h-3.5" />
                        Voice
                    </button>
                    <span className="text-[10px] font-medium text-slate-400">
                        END-TO-END ENCRYPTED & CONFIDENTIAL
                    </span>
                </div>
            </div>
        </div>
    );
}
