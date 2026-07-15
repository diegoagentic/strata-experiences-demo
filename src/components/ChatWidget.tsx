
import { useState, useRef, useEffect } from 'react'
import {
    PaperAirplaneIcon,
    SparklesIcon,
    ArrowPathIcon,
    DocumentChartBarIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    ChartBarIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    PencilIcon,
    PaperClipIcon,
    XCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    Bars3Icon,
    ExclamationCircleIcon,
    CommandLineIcon,
    ClockIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline'

// --- Internal Components ---

interface Order {
    id: string;
    client: string;
    amount: string;
    status: 'pending' | 'urgent';
    details: string;
}

const DiscrepancyResolutionFlow = () => {
    const [status, setStatus] = useState<'initial' | 'requesting' | 'pending' | 'approved'>('initial')
    const [requestText, setRequestText] = useState('')

    const handleRequest = () => {
        setStatus('pending')
        setTimeout(() => setStatus('approved'), 3000)
    }

    if (status === 'initial') {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Found 3 discrepancies in recent shipments.
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground dark:text-gray-300">
                    <li>Order #ORD-2054: Weight mismatch (Logs: 50kg vs Gateway: 48kg)</li>
                    <li>Order #ORD-2051: Timestamp sync error</li>
                    <li>Order #ORD-2048: Missing carrier update</li>
                </ul>
                <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-zinc-900 dark:text-primary hover:bg-primary/20 text-xs font-medium rounded-lg transition-colors">
                        <ArrowPathIcon className="w-3.5 h-3.5" /> Sync & Report
                    </button>
                    <button
                        onClick={() => setStatus('requesting')}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-muted-foreground dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <PencilIcon className="w-3.5 h-3.5" /> Request Changes
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'requesting') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-medium text-foreground">Describe required changes:</p>
                <textarea
                    className="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-card text-foreground focus:ring-2 ring-primary outline-none transition-all placeholder:text-muted-foreground"
                    rows={3}
                    placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <PaperClipIcon className="w-4 h-4" /> Attach File
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatus('initial')}
                            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRequest}
                            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-primary">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Requesting approval from Logistics Manager...</span>
                </div>
            </div>
        )
    }

    if (status === 'approved') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircleIcon className="w-5 h-5" />
                    Changes approved. PO updated.
                </div>
                <div className="p-3 bg-card rounded-lg border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                            <DocumentChartBarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-foreground">PO_Revised_Final.pdf</p>
                            <p className="text-xs text-muted-foreground">Updated just now</p>
                        </div>
                    </div>
                    <button className="text-xs font-medium text-zinc-900 dark:text-primary hover:underline">Download</button>
                </div>
            </div>
        )
    }
    return null
}

const PendingOrders = () => {
    const [orders, setOrders] = useState<Order[]>([
        { id: 'ORD-5001', client: 'Alpha Corp', amount: '$12,500', status: 'urgent', details: 'Requires immediate approval for expedited shipping due to stock delay.' },
        { id: 'ORD-5002', client: 'Beta Ltd', amount: '$4,200', status: 'pending', details: 'Standard restock. Verify discount application.' },
        { id: 'ORD-5003', client: 'Gamma Inc', amount: '$8,900', status: 'pending', details: 'New client account. Credit check passed.' },
    ])
    const [expanded, setExpanded] = useState<string | null>(null)
    const [processed, setProcessed] = useState<string[]>([])

    const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id)

    const handleAction = (id: string, action: 'approve' | 'reject') => {
        setProcessed(prev => [...prev, id])
        console.log(`Order ${id} ${action}d`)
    }

    const activeOrders = orders.filter(o => !processed.includes(o.id))

    if (activeOrders.length === 0) {
        return (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">All pending orders processed!</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-muted-foreground">Pending Review ({activeOrders.length})</span>
            </div>
            {activeOrders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <button
                        onClick={() => toggleExpand(order.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${order.status === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-foreground'
                                }`}>
                                {order.status}
                            </span>
                            <div className="text-left">
                                <div className="text-sm font-medium text-foreground">{order.id} - {order.client}</div>
                                <div className="text-xs text-muted-foreground">{order.amount}</div>
                            </div>
                        </div>
                        {expanded === order.id ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground" /> : <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />}
                    </button>

                    {expanded === order.id && (
                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-foreground mb-3">{order.details}</p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    className="flex items-center gap-1 px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                                    onClick={() => handleAction(order.id, 'reject')}
                                >
                                    <XCircleIcon className="h-3 w-3" /> Request Changes
                                </button>
                                <button
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                    onClick={() => handleAction(order.id, 'approve')}
                                >
                                    <CheckCircleIcon className="h-3 w-3" /> Approve
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// --- Main Widget Component ---

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: React.ReactNode;
    timestamp: Date;
    typing?: boolean;
}

interface AppActivity {
    id: number;
    app: 'Inventory' | 'Analytics' | 'CRM';
    text: string;
    time: string;
    icon: any;
}

interface ChatWidgetProps {
    className?: string;
}

export default function ChatWidget({ className }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI Copilot. I can help you analyze orders, sync data, or generate reports based on your preferences. How can I assist you today?",
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [showActivity, setShowActivity] = useState(false)

    // Activity Log State
    const [appActivities, setAppActivities] = useState<AppActivity[]>([
        { id: 1, app: 'Inventory', text: "Assets updated in Inventory App (Order #ORD-2054)", time: "10:45 AM", icon: ArchiveBoxIcon },
        { id: 2, app: 'Analytics', text: "Data extracted for Analytics Report", time: "10:15 AM", icon: ChartBarIcon },
        { id: 3, app: 'CRM', text: "Client record updated 'TechDealer'", time: "09:30 AM", icon: UsersIcon },
        { id: 4, app: 'Analytics', text: "Report created from Analytics", time: "09:00 AM", icon: DocumentChartBarIcon },
    ])

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    // Minimal system log mock for simulation compatibility
    const addSystemLog = (text: string, type: string) => {
        console.log(`[System Log - ${type}] ${text}`)
    }

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newUserMsg])
        setInputValue('')
        setIsTyping(true)

        // Simulation Logic
        const lowerText = text.toLowerCase()
        if (lowerText.includes('discrep') || lowerText.includes('sync')) {
            simulateDiscrepancyFlow()
        } else if (lowerText.includes('summarize') || lowerText.includes('activity')) {
            simulateSummaryFlow()
        } else if (lowerText.includes('pending') || lowerText.includes('urgent')) {
            simulatePendingOrdersFlow()
        } else {
            setTimeout(() => {
                const responseMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "I'm tuned to help with specific operational tasks right now. Try asking me to analyze order discrepancies or summarize recent activity.",
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, responseMsg])
                setIsTyping(false)
            }, 1000)
        }
    }

    const simulatePendingOrdersFlow = () => {
        addSystemLog("Retrieving pending orders", "system")
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `pending-${Date.now()}`,
                role: 'assistant',
                content: <PendingOrders />,
                timestamp: new Date()
            }])
            setIsTyping(false)
        }, 1200)
    }

    const simulateDiscrepancyFlow = () => {
        addSystemLog("Started discrepancy analysis", "system")
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: 'step-1',
                role: 'assistant',
                content: (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Scanning recent orders for "TechDealer Solutions"...
                        </span>
                    </div>
                ),
                timestamp: new Date()
            }])
        }, 1500)

        setTimeout(() => {
            addSystemLog("Found 3 discrepancies", "warning")
            setMessages(prev => {
                return [...prev, {
                    id: 'step-2',
                    role: 'assistant',
                    content: <DiscrepancyResolutionFlow />,
                    timestamp: new Date()
                }]
            })
        }, 3500)
    }

    const simulateSummaryFlow = () => {
        addSystemLog("Started activity summary", "system")
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: 'summary-step-1',
                role: 'assistant',
                content: (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 animate-pulse text-zinc-900 dark:text-primary" />
                            Analyzing recent activity for "TechDealer Solutions"...
                        </span>
                    </div>
                ),
                timestamp: new Date()
            }])
        }, 1500)

        setTimeout(() => {
            addSystemLog("Analysis complete: 3 orders found", "success")
            setMessages(prev => [...prev, {
                id: 'summary-step-2',
                role: 'assistant',
                content: (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
                            <DocumentChartBarIcon className="w-5 h-5" />
                            Analysis Complete. Found 3 orders under $1M.
                        </div>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground dark:text-gray-300">
                            <li>Order #ORD-2054: $850k - <span className="text-amber-500 font-medium">Missing Logistics Provider</span></li>
                            <li>Order #ORD-2051: $420k - In Transit</li>
                            <li>Order #ORD-2048: $120k - Delivered</li>
                        </ul>
                        <p className="text-sm mt-1">Order #ORD-2054 needs immediate attention. Shall I assign the default logistics provider and dispatch?</p>
                    </div>
                ),
                timestamp: new Date()
            }])
        }, 3500)
    }

    const handleSyncAndReport = () => {
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: "Yes, sync them and generate the report.",
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newUserMsg])
        setIsTyping(true)
        addSystemLog("Initiated DB Sync", "info")

        setTimeout(() => {
            addSystemLog("Report generated", "success")
            setMessages(prev => [...prev, {
                id: 'step-3',
                role: 'assistant',
                content: (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <ArrowPathIcon className="w-4 h-4" />
                            <span>Syncing 3 records to Central DB... Done.</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-primary">
                            <DocumentChartBarIcon className="w-4 h-4" />
                            <span>Generating Reconciliation Report... Done.</span>
                        </div>
                        <div className="mt-3 p-3 bg-card rounded-lg border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <DocumentChartBarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-foreground">Reconciliation_Report.pdf</p>
                                    <p className="text-xs text-muted-foreground">1.2 MB • Generated just now</p>
                                </div>
                            </div>
                            <button className="text-xs font-medium text-zinc-900 dark:text-primary hover:underline">Download</button>
                        </div>
                    </div>
                ),
                timestamp: new Date()
            }])
            setIsTyping(false)
        }, 3000)
    }

    const handleAssignAndDispatch = () => {
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: "Assign provider and dispatch.",
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newUserMsg])
        setIsTyping(true)
        addSystemLog("Dispatch sequence started", "info")

        setTimeout(() => {
            addSystemLog("Logistics provider assigned", "success")
            setMessages(prev => [...prev, {
                id: 'summary-step-3',
                role: 'assistant',
                content: (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Logistics Provider "FastTrack" assigned.</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-primary">
                            <PaperAirplaneIcon className="w-4 h-4" />
                            <span>Dispatch signal sent to warehouse. Order is now processing.</span>
                        </div>
                    </div>
                ),
                timestamp: new Date()
            }])
            setIsTyping(false)
        }, 3000)
    }

    return (
        <div className={`bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[600px] ${className}`}>
            <div className="p-3 border-b border-border flex items-center justify-between bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Bars3Icon className="w-5 h-5 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing mr-2" />
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-primary">
                        <SparklesIcon className="w-5 h-5" />
                        <h3 className="font-semibold text-lg font-brand text-foreground">AI Copilot</h3>
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                            Essential
                        </span>
                    </div>
                </div>

                {/* Toolbar Tools */}
                <div className="flex items-center gap-4">
                    {/* Frequent Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleSendMessage("Analyze orders for TechDealer Solutions with discrepancies")}
                            className="flex flex-col items-center justify-center gap-1 group p-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors min-w-[50px]"
                            title="Analyze Discrepancies"
                        >
                            <div className="text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Analyze</span>
                        </button>
                        <button
                            onClick={() => handleSendMessage("Summarize recent activity")}
                            className="flex flex-col items-center justify-center gap-1 group p-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors min-w-[50px]"
                            title="Summarize Activity"
                        >
                            <div className="text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                <SparklesIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Summarize</span>
                        </button>
                        <button
                            onClick={() => handleSendMessage("Check inventory levels")}
                            className="flex flex-col items-center justify-center gap-1 group p-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors min-w-[50px]"
                            title="Check Inventory"
                        >
                            <div className="text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                <ArchiveBoxIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Inventory</span>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-border hidden sm:block"></div>

                    {/* Status Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleSendMessage("Show pending orders")}
                            className="flex flex-col items-center justify-center gap-1 group p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg transition-colors min-w-[50px]"
                            title="Show Pending"
                        >
                            <div className="text-amber-500 group-hover:text-amber-600 dark:text-amber-400 dark:group-hover:text-amber-300 transition-colors">
                                <ExclamationCircleIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">3 Pending</span>
                        </button>
                        <button
                            onClick={() => handleSendMessage("Show pending orders")}
                            className="flex flex-col items-center justify-center gap-1 group p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors min-w-[50px]"
                            title="Show Urgent"
                        >
                            <div className="text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300 transition-colors">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">1 Urgent</span>
                        </button>
                        <div className="w-px h-6 bg-border mx-1"></div>
                        <button
                            onClick={() => setShowActivity(!showActivity)}
                            className={`p-1.5 rounded-lg transition-colors border ${showActivity ? 'bg-primary/10 border-primary text-zinc-900 dark:text-primary' : 'bg-transparent border-transparent text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white'}`}
                            title="Toggle Recent Activity"
                        >
                            <ClockIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Activity Sidebar (Left) - Collapsible */}
                <div className={`${showActivity ? 'w-[240px] border-r' : 'w-0 border-r-0'} flex flex-col border-border bg-gray-50/50 dark:bg-zinc-800/30 backdrop-blur-sm transition-all duration-300 overflow-hidden`}>
                    <div className="p-3 border-b border-border min-w-[240px]">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <ClockIcon className="w-3.5 h-3.5" /> Recent Activity
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-w-[240px]">
                        {appActivities.map((activity, i) => {
                            let iconColorClass = "bg-primary/10 text-zinc-900 dark:text-primary" // Default
                            if (activity.app === 'Inventory') iconColorClass = "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            if (activity.app === 'Analytics') iconColorClass = "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                            if (activity.app === 'CRM') iconColorClass = "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"

                            return (
                                <div key={activity.id} className="relative pl-0 pb-2 border-b border-border last:border-0 hover:bg-white dark:hover:bg-white/5 p-2 rounded-md transition-colors group">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className={`p-1.5 rounded-md ${iconColorClass} transition-colors`}>
                                            <activity.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">{activity.app}</span>
                                    </div>
                                    <p className="text-xs font-medium leading-tight text-muted-foreground">{activity.text}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">{activity.time}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gray-50/50 dark:bg-black/20">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] rounded-2xl p-4 shadow-sm border
                                ${msg.role === 'user'
                                    ? 'bg-primary text-zinc-900 rounded-br-none border-primary/50'
                                    : 'bg-card text-gray-800 dark:text-gray-100 rounded-bl-none border-border'
                                }
                            `}>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium text-xs">
                                        <SparklesIcon className="w-3 h-3" />
                                        <span>AI Copilot</span>
                                    </div>
                                )}
                                <div className="text-sm leading-relaxed">
                                    {msg.content}
                                </div>

                                {/* Action Buttons for specific messages */}
                                {msg.role === 'assistant' && msg.id === 'step-2' && (
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={handleSyncAndReport} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-zinc-900 dark:text-primary hover:bg-primary/20 text-xs font-medium rounded-lg transition-colors">
                                            <ArrowPathIcon className="w-3.5 h-3.5" /> Sync & Report
                                        </button>
                                    </div>
                                )}
                                {msg.role === 'assistant' && msg.id === 'summary-step-2' && (
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={handleAssignAndDispatch} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-zinc-900 dark:text-primary hover:bg-primary/20 text-xs font-medium rounded-lg transition-colors">
                                            <PaperAirplaneIcon className="w-3.5 h-3.5" /> Assign & Execute
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-card border border-border rounded-2xl rounded-bl-none p-3 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75" />
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-4 bg-card border-t border-border">
                <div className="relative flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 p-2 pr-2 rounded-full border border-gray-200 dark:border-white/10 focus-within:ring-2 ring-primary/20 focus-within:border-primary transition-all">
                    <div className="pl-3 text-muted-foreground">
                        <SparklesIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        placeholder="Ask copilot..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder-gray-400 h-10"
                    />
                    <button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className={`p-2 rounded-full transition-all duration-200 ${inputValue.trim()
                            ? 'bg-primary text-zinc-900 shadow-md transform scale-100'
                            : 'bg-gray-200 dark:bg-white/10 text-muted-foreground scale-95'
                            }`}
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
