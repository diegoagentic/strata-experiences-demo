import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Send,
    User,
    Bot,
    Sparkles,
    Smile,
    Frown,
    Meh,
    ThumbsUp,
    MessageSquare,
    RefreshCcw,
    Zap,
    Settings
} from 'lucide-react';
import { CheckCircleIcon, ArrowPathIcon, ArrowRightIcon, StarIcon } from '@heroicons/react/24/outline';
import { useDemo } from '../../context/DemoContext';
import { useDemoProfile } from '../../context/useDemoProfile';
import { AIAgentAvatar } from './DemoAvatars';
import MobileDeviceFrame from './MobileDeviceFrame';
import { CONTINUA_STEP_TIMING } from '../../config/profiles/continua-demo';

// ─── Continua Step 4.4: Post-Occupancy Intelligence Constants ───────────────
const SURVEY_AGENTS = [
    { name: 'SurveyDeployer', detail: 'Deploying survey to floor 4 occupants (60-day post-install)...' },
    { name: 'ResponseCollector', detail: 'Collecting responses — 85 of 92 employees responded...' },
    { name: 'SentimentAnalyzer', detail: 'AI sentiment analysis — 92% overall satisfaction...' },
    { name: 'InsightGenerator', detail: 'Generating insights: chairs 4.6/5, AV 3.8/5...' },
    { name: 'ReportPublisher', detail: 'Compiling report for facilities team...' },
]
const SURVEY_CATEGORIES = [
    { label: 'Task Chairs', score: 4.6, responses: 85, sentiment: 'positive' as const },
    { label: 'Workstations', score: 4.4, responses: 85, sentiment: 'positive' as const },
    { label: 'Lighting', score: 4.2, responses: 85, sentiment: 'positive' as const },
    { label: 'Noise Level', score: 4.0, responses: 85, sentiment: 'positive' as const },
    { label: 'Conference AV', score: 3.8, responses: 85, sentiment: 'neutral' as const },
]
type SurveyDemoPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

interface Message {
    id: number;
    text: string;
    sender: 'ai' | 'user';
    timestamp: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
}

export default function ConversationalSurvey() {
    const { currentStep, nextStep, isPaused } = useDemo();
    const { activeProfile } = useDemoProfile();
    const isContinua = activeProfile.id === 'continua';
    const stepId = currentStep?.id || '';

    // Pause-aware timer helper
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 200);
        };
    }, []);

    // ─── Continua Step 4.4: Post-Occupancy Intelligence ─────────────────────────
    const [survDemoPhase, setSurvDemoPhase] = useState<SurveyDemoPhase>('idle');
    const survDemoPhaseRef = useRef(survDemoPhase);
    useEffect(() => { survDemoPhaseRef.current = survDemoPhase; }, [survDemoPhase]);
    const [survDemoAgents, setSurvDemoAgents] = useState(SURVEY_AGENTS.map(a => ({ ...a, visible: false, done: false })));
    const [survDemoProgress, setSurvDemoProgress] = useState(0);

    const tp44 = CONTINUA_STEP_TIMING['4.4'];
    useEffect(() => {
        if (!isContinua || stepId !== '4.4') { setSurvDemoPhase('idle'); return; }
        setSurvDemoPhase('idle');
        setSurvDemoAgents(SURVEY_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setSurvDemoPhase('notification')), tp44.notifDelay));
        timers.push(setTimeout(pauseAware(() => { if (survDemoPhaseRef.current === 'notification') setSurvDemoPhase('processing'); }), tp44.notifDelay + tp44.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [isContinua, stepId]);

    useEffect(() => {
        if (survDemoPhase !== 'processing') return;
        setSurvDemoAgents(SURVEY_AGENTS.map(a => ({ ...a, visible: false, done: false })));
        setSurvDemoProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setSurvDemoProgress(100), 50));
        SURVEY_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setSurvDemoAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * tp44.agentStagger));
            timers.push(setTimeout(pauseAware(() => setSurvDemoAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * tp44.agentStagger + tp44.agentDone));
        });
        timers.push(setTimeout(pauseAware(() => setSurvDemoPhase('breathing')), SURVEY_AGENTS.length * tp44.agentStagger + tp44.agentDone + 300));
        return () => timers.forEach(clearTimeout);
    }, [survDemoPhase]);

    useEffect(() => {
        if (survDemoPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setSurvDemoPhase('revealed')), tp44.breathing);
        return () => clearTimeout(t);
    }, [survDemoPhase]);

    useEffect(() => {
        if (survDemoPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setSurvDemoPhase('results')), 1500);
        return () => clearTimeout(t);
    }, [survDemoPhase]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm the Strata Feedback Assistant. Based on your recent transactions in the Expert Hub, I'd love to hear about your experience with the AI validation process.",
            sender: 'ai',
            timestamp: '11:05 AM'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            let aiText = "Thank you for that feedback. I've noted your points about the discrepancy resolution speed. How would you rate the clarity of the AI insights provided?";
            let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

            if (inputValue.toLowerCase().includes('great') || inputValue.toLowerCase().includes('good') || inputValue.toLowerCase().includes('easy')) {
                aiText = "That's wonderful to hear! We've been working on making those insights more actionable. Is there anything else you'd like to see improved?";
                sentiment = 'positive';
            } else if (inputValue.toLowerCase().includes('hard') || inputValue.toLowerCase().includes('slow') || inputValue.toLowerCase().includes('confusing')) {
                aiText = "I'm sorry to hear that. I've flagged this for our design team to review the interface clarity. Which specific section felt most confusing?";
                sentiment = 'negative';
            }

            const aiResponse: Message = {
                id: Date.now() + 1,
                text: aiText,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sentiment
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-zinc-950 -mt-16 pt-16 text-foreground font-sans">
            <div className="flex items-start justify-center pt-6 pb-8 min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
                <MobileDeviceFrame>
                    {/* ─── Mobile navbar ─── */}
                    <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-[10px] font-black text-primary-foreground">S</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-medium leading-none">End User Survey</p>
                                <p className="text-xs font-bold text-foreground leading-tight">Floor 4 Occupants</p>
                            </div>
                        </div>
                    </div>

            {/* ─── Continua Step 4.4: Post-Occupancy Intelligence ─── */}
            {isContinua && stepId === '4.4' && survDemoPhase !== 'idle' && (
                    <div className="space-y-3 p-4 animate-in fade-in duration-300">

                        {/* NOTIFICATION */}
                        {survDemoPhase === 'notification' && (
                            <button onClick={() => setSurvDemoPhase('processing')}
                                className="w-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/30 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-400/60 transition-all group animate-in slide-in-from-top-4 duration-500">
                                <AIAgentAvatar name="SurveyDeployer" size="md" />
                                <div className="flex-1 text-left">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Post-Occupancy Survey · Floor 4</div>
                                    <div className="text-sm font-bold text-foreground">60-day post-install survey deployed — 85 of 92 responses collected</div>
                                    <div className="text-xs text-muted-foreground mt-1">Click to analyze satisfaction scores and generate insights report</div>
                                </div>
                                <ArrowRightIcon className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        {/* PROCESSING */}
                        {survDemoPhase === 'processing' && (
                            <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5 animate-in fade-in duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex items-center justify-center w-10 h-10">
                                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 border-t-indigo-500 animate-spin" />
                                        <Sparkles className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest text-indigo-500">Analyzing Responses</div>
                                        <div className="text-[10px] text-muted-foreground font-medium">AI sentiment analysis in progress...</div>
                                    </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-[3500ms] ease-out" style={{ width: `${survDemoProgress}%` }} />
                                </div>
                                <div className="space-y-2">
                                    {survDemoAgents.map((agent, i) => (
                                        <div key={i} className={`flex items-center gap-3 text-xs transition-all duration-300 ${agent.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                            <AIAgentAvatar name={agent.name} size="xs" />
                                            <span className="flex-1 font-semibold text-muted-foreground">{agent.detail}</span>
                                            {agent.done
                                                ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                                : agent.visible && <ArrowPathIcon className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                                            }
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* BREATHING */}
                        {survDemoPhase === 'breathing' && (
                            <div className="bg-card border border-border/60 rounded-2xl p-5 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                            </div>
                        )}

                        {/* CONFIRMED */}
                        {(survDemoPhase === 'revealed' || survDemoPhase === 'results') && (
                            <div className="bg-green-500/5 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
                                <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0" />
                                <div className="flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">External Systems · Synced</span>
                                </div>
                                <div className="flex gap-1.5 flex-wrap justify-end">
                                    {['Survey Engine', 'NLP Pipeline', 'Sentiment DB', 'Report Builder'].map(s => (
                                        <span key={s} className="px-2 py-0.5 rounded-full bg-green-500/10 text-[9px] font-bold text-green-600 border border-green-500/20">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RESULTS */}
                        {survDemoPhase === 'results' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Summary header */}
                                <div className="bg-card border border-border/60 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Post-Occupancy Survey Results</div>
                                            <div className="text-lg font-black text-foreground">Floor 4 — 60-Day Assessment</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-green-500">92%</div>
                                            <div className="text-[10px] font-bold text-muted-foreground">Overall Satisfaction</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-muted/30 rounded-xl p-3 text-center">
                                            <div className="text-lg font-black text-foreground">85</div>
                                            <div className="text-[10px] font-bold text-muted-foreground">Responses</div>
                                        </div>
                                        <div className="bg-muted/30 rounded-xl p-3 text-center">
                                            <div className="text-lg font-black text-foreground">92%</div>
                                            <div className="text-[10px] font-bold text-muted-foreground">Response Rate</div>
                                        </div>
                                        <div className="bg-muted/30 rounded-xl p-3 text-center">
                                            <div className="text-lg font-black text-foreground">4.2</div>
                                            <div className="text-[10px] font-bold text-muted-foreground">Avg Score</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category breakdown */}
                                <div className="bg-card border border-border/60 rounded-2xl p-5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Category Scores</div>
                                    <div className="space-y-3">
                                        {SURVEY_CATEGORIES.map((cat, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-foreground w-28 shrink-0">{cat.label}</span>
                                                <div className="flex-1 bg-muted/30 rounded-full h-3 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-700 ${cat.score >= 4.2 ? 'bg-green-500' : cat.score >= 4.0 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${(cat.score / 5) * 100}%` }} />
                                                </div>
                                                <div className="flex items-center gap-1.5 w-16 justify-end">
                                                    {cat.score >= 4.2 ? <Smile className="w-3.5 h-3.5 text-green-500" /> : cat.score >= 4.0 ? <Meh className="w-3.5 h-3.5 text-yellow-500" /> : <Meh className="w-3.5 h-3.5 text-orange-500" />}
                                                    <span className="text-sm font-black">{cat.score}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key insight */}
                                <div className="bg-amber-500/5 border border-amber-400/30 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">AI Recommendation</div>
                                            <div className="text-sm font-semibold text-foreground">Conference AV scored lowest (3.8/5) — employees report audio quality issues in rooms 401-404. Recommend microphone recalibration and acoustic panel review.</div>
                                        </div>
                                    </div>
                                </div>

                                {/* FM Actions Panel */}
                                <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-[8px] font-bold">CR</div>
                                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">Carlos Rivera — Facilities Actions</span>
                                    </div>
                                    <div className="space-y-1.5 text-[10px] text-foreground/80">
                                        <div className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Maintenance ticket: AV recalibration rooms 401-404</div>
                                        <div className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Ergonomics report forwarded to HR</div>
                                        <div className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Acoustic panel review scheduled</div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <button onClick={() => nextStep()}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20">
                                    Send Report to Client
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
            )}

            {/* ─── Chat interface (idle state) ─── */}
            {!(isContinua && stepId === '4.4' && survDemoPhase !== 'idle') && (
            <div className="flex flex-col overflow-hidden">
                {/* Chat Header */}
                <header className="p-6 border-b border-border/50 flex items-center justify-between bg-white/50 dark:bg-muted/10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Bot size={24} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-[#161b22]" />
                        </div>
                        <div>
                            <h2 className="font-black tracking-tight text-lg">Process Audit Assistant</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</span>
                                <span className="text-[10px] text-muted-foreground font-medium">• Sentiment Analysis Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                            <RefreshCcw size={18} />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${msg.sender === 'ai' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'
                                    }`}>
                                    {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="space-y-1">
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'ai'
                                        ? 'bg-muted/40 dark:bg-muted/20 rounded-tl-none border border-border/30'
                                        : 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10 font-medium'
                                        }`}>
                                        {msg.text}
                                        {msg.sentiment && (
                                            <div className="mt-2 pt-3 border-t border-border/20 flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Detected Sentiment:</span>
                                                {msg.sentiment === 'positive' && <Smile size={14} className="text-green-500" />}
                                                {msg.sentiment === 'negative' && <Frown size={14} className="text-red-500" />}
                                                {msg.sentiment === 'neutral' && <Meh size={14} className="text-blue-500" />}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-bold text-muted-foreground block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-muted/40 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggested Actions */}
                <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {['Everything is clear', 'Needs more detail', 'Resolution is slow'].map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => { setInputValue(suggestion); }}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-border/50 text-xs font-bold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <footer className="p-6 pt-2">
                    <div className="relative group">
                        <input
                            id="survey-chat-input"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your feedback here..."
                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 pl-12 pr-14 text-sm font-medium focus:outline-none focus:ring-2 ring-primary/20 focus:bg-background transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <MessageSquare size={18} />
                        </div>
                        <button
                            onClick={handleSend}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.1] active:scale-[0.9] transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <ThumbsUp size={16} className="cursor-pointer hover:text-primary transition-colors" />
                            <Sparkles size={16} className="cursor-pointer hover:text-primary transition-colors" />
                            <Zap size={16} className="cursor-pointer hover:text-primary transition-colors" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Powered by Strata Intelligence
                        </p>
                    </div>
                </footer>
            </div>
            )}

                </MobileDeviceFrame>
            </div>
        </div>
    );
}
