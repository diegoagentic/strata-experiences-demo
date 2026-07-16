/**
 * w2.3 — AdminScene
 * AP (Letza): manager list + expense categories + GL rules + approval hierarchy
 * Pain points resolved: PP6 (manager dropdown IT-gated), PP7 (categories outdated),
 *   PP8 (GL codes manual lookup → rules engine)
 */

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, X, CheckCircle2, ChevronRight, ChevronDown, Sparkles, Check, Link2, GripVertical, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import { useDemo } from '../../context/DemoContext'

const INITIAL_MANAGERS = [
    { name: 'Operations Manager Solano', dept: 'Operations', location: 'Tampa' },
    { name: 'Mike Torres',   dept: 'Sales',      location: 'Orlando' },
    { name: 'Ana Reyes',     dept: 'Procurement', location: 'Miami' },
]

const DEPARTMENTS = ['Operations', 'Sales', 'Procurement', 'Finance', 'IT', 'HR']
const LOCATIONS   = ['Tampa', 'Orlando', 'Miami', 'Jacksonville', 'Fort Lauderdale']

const CORE_PEOPLE = [
    { name: 'David Chen',    dept: 'Operations',  location: 'Tampa'        },
    { name: 'Lisa Martinez', dept: 'Sales',        location: 'Jacksonville' },
    { name: 'James Wilson',  dept: 'Finance',      location: 'Miami'        },
]

const INITIAL_CATEGORIES = ['Air Fare', 'Car Rental', 'Lodging', 'Tolls / Cab / Parking', 'Mileage', 'Misc Cost', 'Personal Meals', 'Business Meals & Entertainment', 'Market Events', 'Other']
const CATEGORY_SUGGESTIONS = ['Air Fare', 'Car Rental', 'Lodging', 'Tolls / Cab / Parking', 'Mileage', 'Misc Cost', 'Personal Meals', 'Business Meals & Entertainment', 'Market Events', 'Other', 'Conference', 'Subscriptions']

const GL_RULES_INITIAL = [
    { category: 'Mileage',                       glCode: '6200', glName: 'Vehicle Expenses',      confidence: 94 },
    { category: 'Business Meals & Entertainment', glCode: '6100', glName: 'Meals & Entertainment', confidence: 91 },
    { category: 'Air Fare',                       glCode: '6210', glName: 'Travel & Transit',       confidence: 96 },
    { category: 'Tolls / Cab / Parking',          glCode: '6210', glName: 'Travel & Transit',       confidence: 72 },
    { category: 'Misc Cost',                      glCode: '6300', glName: 'Office Expenses',         confidence: 89 },
]

const GL_CODE_OPTIONS = [
    { code: '6200', name: 'Vehicle Expenses' },
    { code: '6100', name: 'Meals & Entertainment' },
    { code: '6210', name: 'Travel & Transit' },
    { code: '6300', name: 'Office Expenses' },
    { code: '6400', name: 'Training & Development' },
    { code: '6500', name: 'Equipment & Supplies' },
]

export default function AdminScene({ onSave }: { onSave?: () => void }) {
    const { nextStep } = useDemo()
    const [managers, setManagers]           = useState(INITIAL_MANAGERS)
    const [categories, setCategories]       = useState(INITIAL_CATEGORIES)
    const [glRules, setGlRules]             = useState(GL_RULES_INITIAL)
    const [showAddMgr, setShowAddMgr]       = useState(false)
    const [newMgr, setNewMgr]               = useState({ name: '', customName: '', dept: '', location: '' })
    const [saved, setSaved]                 = useState(false)
    const [editingRule, setEditingRule]     = useState<string | null>(null)
    const [ruleImproved, setRuleImproved]   = useState(false)
    const [confirmedRules, setConfirmedRules] = useState<Set<string>>(new Set())
    const [editingManager, setEditingManager] = useState<string | null>(null)
    const [editMgrData, setEditMgrData]     = useState({ name: '', customName: '', dept: '', location: '' })
    const [showCatDropdown, setShowCatDropdown] = useState(false)
    const [showCustomCat, setShowCustomCat] = useState(false)
    const [customCatInput, setCustomCatInput] = useState('')
    const catDropdownRef = useRef<HTMLDivElement>(null)
    const [openSections, setOpenSections]         = useState<Set<string>>(new Set(['gl-rules', 'managers', 'categories', 'hierarchy', 'core-integration']))
    const toggleSection = (id: string) => setOpenSections(prev => {
        const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
    })
    const [editingHierarchy, setEditingHierarchy] = useState(false)
    const [hierarchySaved, setHierarchySaved]     = useState(false)
    const [hierarchy, setHierarchy]               = useState(['Employee', 'Manager', 'Dept Head', 'CFO / AP'])
    const hierarchySnapshot                       = useRef<string[]>([])
    const dragIdx                                 = useRef<number | null>(null)
    const [dragOver, setDragOver]                 = useState<number | null>(null)

    const handleDragStart = (i: number) => { dragIdx.current = i }
    const handleDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i) }
    const handleDrop      = (i: number) => {
        if (dragIdx.current === null || dragIdx.current === i) { setDragOver(null); return }
        const next = [...hierarchy]
        const [item] = next.splice(dragIdx.current, 1)
        next.splice(i, 0, item)
        setHierarchy(next)
        dragIdx.current = null
        setDragOver(null)
    }
    const handleDragEnd = () => { dragIdx.current = null; setDragOver(null) }

    useEffect(() => {
        if (!showCatDropdown) return
        const handler = (e: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
                setShowCatDropdown(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showCatDropdown])

    // ── Manager CRUD ─────────────────────────────────────────────────────────

    const startEditManager = (m: typeof managers[number]) => {
        setEditingManager(m.name)
        setEditMgrData({ name: m.name, customName: '', dept: m.dept, location: m.location })
    }

    const saveEditManager = (originalName: string) => {
        const resolvedName = editMgrData.name === '__other__' ? editMgrData.customName.trim() : editMgrData.name
        if (!resolvedName) return
        setManagers(prev => prev.map(m =>
            m.name === originalName
                ? { name: resolvedName, dept: editMgrData.dept, location: editMgrData.location }
                : m
        ))
        setEditingManager(null)
    }

    const handleEditMgrSelect = (value: string) => {
        if (value === '__other__') {
            setEditMgrData(p => ({ ...p, name: '__other__', customName: '', dept: p.dept, location: p.location }))
        } else {
            const person = CORE_PEOPLE.find(p => p.name === value)
            setEditMgrData({ name: value, customName: '', dept: person?.dept ?? '', location: person?.location ?? '' })
        }
    }

    const addManager = () => {
        const resolvedName = newMgr.name === '__other__' ? newMgr.customName.trim() : newMgr.name
        if (!resolvedName) return
        setManagers(prev => [...prev, { name: resolvedName, dept: newMgr.dept || 'Operations', location: newMgr.location || 'Tampa' }])
        setNewMgr({ name: '', customName: '', dept: '', location: '' })
        setShowAddMgr(false)
    }

    const handleNewMgrSelect = (value: string) => {
        if (value === '__other__') {
            setNewMgr(p => ({ ...p, name: '__other__', customName: '', dept: '', location: '' }))
        } else {
            const person = CORE_PEOPLE.find(p => p.name === value)
            setNewMgr({ name: value, customName: '', dept: person?.dept ?? '', location: person?.location ?? '' })
        }
    }

    const removeManager = (name: string) => setManagers(prev => prev.filter(m => m.name !== name))

    // ── Category CRUD ─────────────────────────────────────────────────────────

    const availableSuggestions = CATEGORY_SUGGESTIONS.filter(s => !categories.includes(s))

    const addCategorySuggestion = (cat: string) => {
        if (cat === '__other__') { setShowCustomCat(true); setShowCatDropdown(false); return }
        setCategories(prev => [...prev, cat])
        setShowCatDropdown(false)
    }

    const addCustomCategory = () => {
        if (!customCatInput.trim()) return
        setCategories(prev => [...prev, customCatInput.trim()])
        setCustomCatInput('')
        setShowCustomCat(false)
    }

    const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat))

    // ── GL Rules ──────────────────────────────────────────────────────────────

    const updateGlRule = (category: string, glCode: string) => {
        const option = GL_CODE_OPTIONS.find(o => o.code === glCode)
        if (!option) return
        setGlRules(prev => prev.map(r =>
            r.category === category ? { ...r, glCode: option.code, glName: option.name, confidence: category === 'Tolls / Cab / Parking' ? 97 : r.confidence } : r
        ))
        if (category === 'Tolls / Cab / Parking') setRuleImproved(true)
        setEditingRule(null)
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => { setSaved(false); onSave?.() }, 1400)
    }

    return (
        <div className="space-y-5">

            {/* Triggered context — connects to w2.2 Tolls/Cab/Parking 72% */}
            {!ruleImproved && (
                <div className="bg-warning/5 border border-warning/20 rounded-xl px-3 py-3 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                        <p className="text-xs font-semibold text-foreground">1 mapping rule needs attention</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        The <span className="font-semibold text-foreground">Tolls / Cab / Parking</span> category matched at <span className="font-semibold text-warning">72% confidence</span> on the expense you just reviewed. Update the GL rule so future expenses auto-classify correctly — no IT ticket needed.
                    </p>
                    <p className="text-[10px] text-ai">✦ Strata flagged this automatically after the manual verification in GL review</p>
                </div>
            )}
            {ruleImproved && (
                <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-3 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
                        <p className="text-xs font-semibold text-success">Tolls / Cab / Parking rule corrected — live immediately</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-destructive/70 bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded-full">72%</span>
                            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-success bg-success/15 border border-success/25 px-1.5 py-0.5 rounded-full">97%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Auto-classification · no manual verification needed</p>
                    </div>
                    <p className="text-[10px] text-ai">✦ Every future parking expense auto-classifies correctly — this fix applies retroactively to the rules engine</p>
                </div>
            )}

            {/* Section GL Mapping Rules — first, it's the triggered action from w2.2 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-ai" />
                        <p className="text-xs font-bold text-foreground">GL Mapping Rules</p>
                        {!ruleImproved && (
                            <span className="ml-auto text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full">1 needs attention</span>
                        )}
                        {ruleImproved && (
                            <span className="ml-auto text-[10px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full">Updated ✓</span>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Powers AI confidence scores in AP review — click any row to edit</p>
                </div>

                <div className="divide-y divide-border">
                    {glRules.map(rule => {
                        const isLowConf = rule.category === 'Tolls / Cab / Parking' && !ruleImproved
                        const isConfirmed = confirmedRules.has(rule.category)
                        return (
                            <div key={rule.category} className={`flex items-center gap-2 px-4 py-2.5 transition-colors ${isLowConf ? 'bg-warning/5' : ''}`}>
                                <div className="flex flex-col gap-0.5 w-40 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-foreground">{rule.category}</span>
                                        {isLowConf && <AlertTriangle className="h-3 w-3 text-warning shrink-0" />}
                                    </div>
                                    {isLowConf && (
                                        <p className="text-[9px] text-warning leading-tight">
                                            Overlaps with Mileage — toll &amp; parking receipts split between Vehicle and Transit accounts
                                        </p>
                                    )}
                                </div>
                                {editingRule === rule.category ? (
                                    <select
                                        autoFocus
                                        value={rule.glCode}
                                        onChange={e => updateGlRule(rule.category, e.target.value)}
                                        onBlur={() => setEditingRule(null)}
                                        className="flex-1 text-xs bg-background border border-primary rounded px-2 py-1 text-foreground outline-none"
                                    >
                                        {GL_CODE_OPTIONS.map(o => (
                                            <option key={o.code} value={o.code}>{o.code} · {o.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">{rule.glCode}</span>
                                        <span className="text-[11px] text-foreground truncate">· {rule.glName}</span>
                                        {rule.category === 'Tolls / Cab / Parking' && ruleImproved ? (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-[10px] font-bold text-muted-foreground/50 line-through">72%</span>
                                                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
                                                <ConfidencePill pct={rule.confidence} />
                                            </div>
                                        ) : (
                                            <ConfidencePill pct={rule.confidence} />
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => setEditingRule(editingRule === rule.category ? null : rule.category)}
                                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground border border-border px-2 py-0.5 rounded-full hover:bg-muted/50 transition-colors"
                                        title="Edit GL mapping"
                                    >
                                        <Pencil className="h-2.5 w-2.5" />
                                        Edit
                                    </button>
                                    {isLowConf && !isConfirmed ? (
                                        <button
                                            onClick={() => setConfirmedRules(prev => new Set([...prev, rule.category]))}
                                            className="flex items-center gap-1 text-[10px] font-semibold text-success border border-success/30 bg-success/5 px-2 py-0.5 rounded-full hover:bg-success/15 transition-colors"
                                            title="Approve this GL mapping"
                                        >
                                            <Check className="h-2.5 w-2.5" />
                                            Approve
                                        </button>
                                    ) : (
                                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                            isConfirmed
                                                ? 'text-success bg-success/10 border-success/20'
                                                : 'text-muted-foreground bg-muted/30 border-border'
                                        }`}>
                                            <Check className="h-2.5 w-2.5" />
                                            {isConfirmed ? 'Approved' : 'Verified'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="px-4 py-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">Before Strata: Letza looked up GL codes manually for each expense — no rules engine, no consistency</p>
                </div>
            </div>

            {/* Section — Manager List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('managers')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                    <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Approval Managers</p>
                        <p className="text-[10px] text-muted-foreground">Feeds the submission dropdown — always current</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{managers.length} managers</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${openSections.has('managers') ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {openSections.has('managers') && (
                <div className="border-t border-border">
                <div className="px-4 py-2 flex justify-end border-b border-border">
                    <button
                        onClick={() => { setShowAddMgr(!showAddMgr); setEditingManager(null) }}
                        className="flex items-center gap-1 text-xs text-ai font-medium hover:text-ai/80 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                </div>
                <div className="divide-y divide-border">
                    {managers.map(m => (
                        <div key={m.name}>
                            <div className="flex items-center justify-between px-4 py-2.5">
                                <div>
                                    <p className="text-xs font-semibold text-foreground">{m.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{m.dept} · {m.location}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => editingManager === m.name ? setEditingManager(null) : startEditManager(m)}
                                        className="p-1 text-muted-foreground hover:text-ai transition-colors"
                                        aria-label="Edit"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => removeManager(m.name)}
                                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                        aria-label="Remove"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Inline edit form */}
                            {editingManager === m.name && (
                                <div className="px-4 pb-3 space-y-2 animate-in fade-in duration-200 bg-muted/20 border-t border-border">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide pt-2">Edit manager</p>
                                    <select
                                        value={editMgrData.name}
                                        onChange={e => handleEditMgrSelect(e.target.value)}
                                        className="w-full text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="">Select from CORE...</option>
                                        {CORE_PEOPLE.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                        <option value="__other__">Other (not in CORE)</option>
                                    </select>
                                    {editMgrData.name === '__other__' && (
                                        <input
                                            value={editMgrData.customName}
                                            onChange={e => setEditMgrData(p => ({ ...p, customName: e.target.value }))}
                                            placeholder="Full name"
                                            className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    )}
                                    <div className="flex gap-2">
                                        <select
                                            value={editMgrData.dept}
                                            onChange={e => setEditMgrData(p => ({ ...p, dept: e.target.value }))}
                                            className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                                        >
                                            <option value="">Department</option>
                                            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                        <select
                                            value={editMgrData.location}
                                            onChange={e => setEditMgrData(p => ({ ...p, location: e.target.value }))}
                                            className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                                        >
                                            <option value="">Location</option>
                                            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingManager(null)} className="flex-1 text-xs text-muted-foreground py-1.5 hover:text-foreground">Cancel</button>
                                        <button
                                            onClick={() => saveEditManager(m.name)}
                                            className="flex-1 text-xs bg-primary text-primary-foreground font-bold py-1.5 rounded-lg hover:opacity-90"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add manager form */}
                {showAddMgr && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="h-3 w-3 text-ai" />
                            <p className="text-[10px] font-semibold text-ai">Lookup from CORE</p>
                        </div>
                        <select
                            value={newMgr.name}
                            onChange={e => handleNewMgrSelect(e.target.value)}
                            className="w-full text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">Select employee from CORE...</option>
                            {CORE_PEOPLE.map(p => <option key={p.name} value={p.name}>{p.name} · {p.dept}</option>)}
                            <option value="__other__">Other (not in CORE)</option>
                        </select>

                        {newMgr.name === '__other__' && (
                            <input
                                value={newMgr.customName}
                                onChange={e => setNewMgr(p => ({ ...p, customName: e.target.value }))}
                                placeholder="Full name"
                                className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                            />
                        )}

                        {newMgr.name && newMgr.name !== '__other__' && (
                            <div className="flex items-center gap-1.5 bg-ai/5 border border-ai/20 rounded-lg px-3 py-1.5 animate-in fade-in duration-150">
                                <Check className="h-3 w-3 text-ai shrink-0" />
                                <p className="text-[11px] text-foreground">
                                    CORE match: <span className="font-semibold">{newMgr.dept} · {newMgr.location}</span>
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <select
                                value={newMgr.dept}
                                onChange={e => setNewMgr(p => ({ ...p, dept: e.target.value }))}
                                className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                            >
                                <option value="">Department</option>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                            <select
                                value={newMgr.location}
                                onChange={e => setNewMgr(p => ({ ...p, location: e.target.value }))}
                                className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                            >
                                <option value="">Location</option>
                                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddMgr(false)} className="flex-1 text-xs text-muted-foreground py-1.5 hover:text-foreground">Cancel</button>
                            <button
                                onClick={addManager}
                                disabled={!newMgr.name || (newMgr.name === '__other__' && !newMgr.customName.trim())}
                                className="flex-1 text-xs bg-primary text-primary-foreground font-bold py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40"
                            >
                                Save Manager
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Before Strata: required an IT ticket to update this dropdown</p>
                    </div>
                )}
                </div>
                )}
            </div>

            {/* Section 2 — Expense Categories */}
            <div className="bg-card border border-border rounded-xl">
                <button
                    onClick={() => toggleSection('categories')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                    <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Expense Categories</p>
                        <p className="text-[10px] text-muted-foreground">Feed the GL rules engine — changes apply immediately</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{categories.length} categories</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${openSections.has('categories') ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {openSections.has('categories') && (
                    <div className="border-t border-border">
                        <div className="px-4 py-3 flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <span key={cat} className="group inline-flex items-center gap-1 text-xs bg-muted border border-border text-foreground px-2.5 py-1 rounded-full">
                                    {cat}
                                    <button onClick={() => removeCategory(cat)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all" aria-label={`Remove ${cat}`}>
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </span>
                            ))}
                            <div className="relative" ref={catDropdownRef}>
                                <button
                                    onClick={() => { setShowCatDropdown(!showCatDropdown); setShowCustomCat(false) }}
                                    className="inline-flex items-center gap-1 text-xs text-ai border border-dashed border-ai/40 hover:border-ai/80 hover:bg-ai/5 px-2.5 py-1 rounded-full transition-all"
                                >
                                    <Plus className="h-3 w-3" /> Add category
                                </button>
                                {showCatDropdown && (
                                    <div className="absolute left-0 top-full mt-1 z-10 bg-card border border-border rounded-xl shadow-lg min-w-[180px] py-1 animate-in fade-in duration-150">
                                        {availableSuggestions.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => addCategorySuggestion(s)}
                                                className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-muted/60 transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                        {availableSuggestions.length > 0 && <div className="border-t border-border my-1" />}
                                        <button
                                            onClick={() => addCategorySuggestion('__other__')}
                                            className="w-full text-left px-3 py-1.5 text-xs text-ai hover:bg-ai/5 transition-colors"
                                        >
                                            Other (type name) →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {showCustomCat && (
                            <div className="px-4 pb-3 flex items-center gap-2 animate-in fade-in duration-150">
                                <input
                                    value={customCatInput}
                                    onChange={e => setCustomCatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addCustomCategory()}
                                    placeholder="Category name"
                                    autoFocus
                                    className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button onClick={addCustomCategory} className="text-xs bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40" disabled={!customCatInput.trim()}>
                                    Add
                                </button>
                                <button onClick={() => { setShowCustomCat(false); setCustomCatInput('') }} className="text-xs text-muted-foreground hover:text-foreground">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                        <div className="px-4 pb-3">
                            <p className="text-[10px] text-muted-foreground">Before Strata: categories lived in a spreadsheet, disconnected from the GL lookup</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Section — Approval Hierarchy */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('hierarchy')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                    <div className="text-left">
                        <p className="text-xs font-bold text-foreground">Approval Hierarchy</p>
                        <p className="text-[10px] text-muted-foreground">Powers division rollup on the spend dashboard</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">Employee → Manager → Dept Head → CFO/AP</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${openSections.has('hierarchy') ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {openSections.has('hierarchy') && (
                    <div className="border-t border-border">
                        <div className="px-4 py-2.5 flex items-center justify-between border-b border-border">
                            {!editingHierarchy && !hierarchySaved && (
                                <button
                                    onClick={() => { hierarchySnapshot.current = [...hierarchy]; setEditingHierarchy(true) }}
                                    className="flex items-center gap-1 text-[10px] font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Pencil className="h-3 w-3" />
                                    Edit Hierarchy
                                </button>
                            )}
                            {hierarchySaved && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
                                    <Check className="h-3 w-3" />
                                    Saved
                                </span>
                            )}
                        </div>
                        {!editingHierarchy && (
                            <div className="px-4 py-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {hierarchy.map((level, i, arr) => (
                                        <div key={level} className="flex items-center gap-2">
                                            <span className={`text-xs border px-3 py-1.5 rounded-full font-medium transition-colors ${
                                                hierarchySaved ? 'bg-success/10 border-success/30 text-success' : 'bg-muted border-border text-foreground'
                                            }`}>{level}</span>
                                            {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                        </div>
                                    ))}
                                </div>
                                {hierarchySaved && (
                                    <p className="text-[10px] text-success mt-2 animate-in fade-in duration-300">
                                        Hierarchy updated · division rollup will reflect changes
                                    </p>
                                )}
                            </div>
                        )}
                        {editingHierarchy && (
                            <div className="px-4 py-4 space-y-3 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-muted-foreground">Drag to reorder · each level reports up</p>
                                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                                        <span className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded font-semibold">1</span>
                                        <span>= submits first</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {hierarchy.map((level, i) => (
                                        <div
                                            key={level}
                                            draggable
                                            onDragStart={() => handleDragStart(i)}
                                            onDragOver={(e) => handleDragOver(e, i)}
                                            onDrop={() => handleDrop(i)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all cursor-grab active:cursor-grabbing ${
                                                dragOver === i ? 'border-ai/40 bg-ai/5 scale-[1.01]' : 'border-border bg-card hover:bg-muted/30'
                                            }`}
                                        >
                                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                i === 0 ? 'bg-foreground text-background' : 'bg-muted text-foreground/70'
                                            }`}>{i + 1}</div>
                                            <p className="text-xs font-medium text-foreground flex-1">{level}</p>
                                            {i < hierarchy.length - 1 && (
                                                <span className="text-[10px] text-muted-foreground font-medium">reports to ↑</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => { setEditingHierarchy(false); setHierarchySaved(true) }}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        Confirm Hierarchy
                                    </button>
                                    <button
                                        onClick={() => { setHierarchy(hierarchySnapshot.current); setEditingHierarchy(false) }}
                                        className="px-3 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Section — Accounting System Integration */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleSection('core-integration')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                    <div className="flex items-center gap-2 text-left">
                        <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-foreground">Accounting System Integration</p>
                            <p className="text-[10px] text-muted-foreground">Auto-post on AP approval · no manual re-entry</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full">Active ✓</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${openSections.has('core-integration') ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {openSections.has('core-integration') && (
                    <div className="border-t border-border px-3 py-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Connection method</span>
                            <span className="font-medium text-foreground">REST API · OAuth 2.0</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Auto-post on AP approval</span>
                            <span className="font-medium text-success">Enabled</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Last sync</span>
                            <span className="font-medium text-foreground">Today, 9:41 AM</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                            Approved entries post automatically — no manual re-entry, no copy-paste, no accounting errors.
                        </p>
                    </div>
                )}
            </div>

            {/* Save CTA */}
            <button
                onClick={handleSave}
                disabled={saved}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-all"
            >
                {saved ? (
                    <>
                        <CheckCircle2 className="h-4 w-4" />
                        Changes applied · classification rules updated
                    </>
                ) : (
                    'Save all changes →'
                )}
            </button>
            {saved && (
                <div className="space-y-3 animate-in fade-in duration-400">
                    {/* Who sees the change */}
                    <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-3 space-y-2.5">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                            <p className="text-xs font-semibold text-success">Rule live · classification engine updated</p>
                        </div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Who sees this change</p>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mt-1.5 shrink-0" />
                                <p className="text-[11px] text-foreground leading-snug"><span className="font-semibold">Accountant</span> — next parking expense auto-classifies at 97%+, no manual review needed</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mt-1.5 shrink-0" />
                                <p className="text-[11px] text-foreground leading-snug"><span className="font-semibold">CFO / CAO</span> — May spend report shows corrected category breakdown immediately</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mt-1.5 shrink-0" />
                                <p className="text-[11px] text-foreground leading-snug"><span className="font-semibold">Employees</span> — Tolls / Cab / Parking maps correctly on next submission · no IT ticket required</p>
                            </div>
                        </div>
                    </div>
                    {/* Bridge to CFO dashboard */}
                    <div className="bg-ai/5 border border-ai/20 rounded-xl px-3 py-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                            <p className="text-xs font-semibold text-foreground">May 2026 cycle closed</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            23 expenses posted · all receipts verified · 1 classification rule improved · CFO notified
                        </p>
                        <button
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            See CFO spend dashboard
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}

function ConfidencePill({ pct }: { pct: number }) {
    const color = pct >= 90 ? 'text-success bg-success/10' : pct >= 75 ? 'text-warning bg-warning/10' : 'text-muted-foreground bg-muted'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{pct}%</span>
    )
}
