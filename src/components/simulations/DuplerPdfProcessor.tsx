// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 1: Vendor Data Import & Priced SIF Generation
// Steps: d1.1 (Vendor Data Import), d1.2 (AI & Expert Hub),
//        d1.3 (Spec Assembly & SC Handoff),
//        d1.4 (SC Price Validation — DuplerScReview),
//        d1.5 (Priced SIF Generation — DuplerScReview)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';
import {
    DocumentTextIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    CheckIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PencilSquareIcon,
    PaperAirplaneIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    MapIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';

// ─── Designer / SC Avatars ───────────────────────────────────────────────────
const DESIGNER_PHOTO = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face';
const SC_PHOTO = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face';
const MANAGER_PHOTO = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face';

// ─── Types ───────────────────────────────────────────────────────────────────

type ScrapePhase = 'idle' | 'notification' | 'upload-zone' | 'scraping' | 'processing' | 'breathing' | 'revealed' | 'results';
type MappingPhase = 'idle' | 'notification' | 'processing' | 'revealed';
type ValidationPhase = 'idle' | 'processing' | 'revealed';
type PackagePhase = 'idle' | 'processing' | 'revealed';
type ScReviewPhase = 'idle' | 'notification' | 'sc-review' | 'generating' | 'revealed';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TOTAL_ITEMS = 7;
const PROJECT_TOTAL = 28854;
const UPCHARGE_TOTAL = 1470;
const MANUFACTURER = 'Meridian Workspace';
const CATALOG_URL = 'https://meridian-workspace.com/catalog/healthcare-office';
const SPEC_ID = 'SPEC-MH-0412';

interface OptionSegment { code: string; description: string; }

interface WebExtractedItem {
    line: number; sourceCo: string; qty: number; partNumber: string;
    partDescription: string; optionCode: string | null; optionDescription: string;
    tag: string; unitPrice: number; overallConfidence: number;
    status: 'auto' | 'ai-suggested' | 'expert-hub';
    // SPEC pricing fields
    unitPriceExt: number; pctCustomer: number; unitCustomer: number; extendedCust: number;
    unitDealer: number; pctDealer: number; extendedDealer: number;
    marginDollar: number; pctMargin: number;
    // Option breakdown for expanded view
    optionBreakdown: OptionSegment[] | null;
}

const WEB_EXTRACTED_ITEMS: WebExtractedItem[] = [
    { line: 1, sourceCo: 'MWS', qty: 6, partNumber: 'BDL-48S', partDescription: 'Wand LED Lamp Freestanding Base',
      optionCode: '.SVR', optionDescription: 'CLR: Silver',
      tag: 'WAND', unitPrice: 383, overallConfidence: 96, status: 'auto',
      unitPriceExt: 2298, pctCustomer: 0, unitCustomer: 383, extendedCust: 2298,
      unitDealer: 0, pctDealer: -100, extendedDealer: 0, marginDollar: 383, pctMargin: 100,
      optionBreakdown: [{ code: '.SVR', description: 'CLR: Silver' }] },
    { line: 2, sourceCo: 'MWS', qty: 6, partNumber: 'AXM-HBW', partDescription: 'Relate Std Mesh High-Bk/Adj Arms',
      optionCode: '.2/.0/.L/.CBK/LKM01/S(3)/.SX/29',
      optionDescription: 'Standard cushion / Hard Casters / Lumbar / Charblack / CLR: Carbon / GRD 3 UPH / Moxie / Flint',
      tag: 'RELATE W', unitPrice: 1668, overallConfidence: 91, status: 'auto',
      unitPriceExt: 10008, pctCustomer: 0, unitCustomer: 1668, extendedCust: 10008,
      unitDealer: 0, pctDealer: -100, extendedDealer: 0, marginDollar: 1668, pctMargin: 100,
      optionBreakdown: [
        { code: '.2', description: 'Standard cushion' }, { code: '.0', description: 'Hard Casters' },
        { code: '.L', description: 'Lumbar' }, { code: '.CBK', description: 'Charblack' },
        { code: 'LKM01', description: 'CLR: Carbon' }, { code: 'S(3)', description: 'GRD 3 UPH' },
        { code: '.SX', description: 'Moxie' }, { code: '29', description: 'Flint' },
      ] },
    { line: 3, sourceCo: 'MWS', qty: 6, partNumber: 'PDK-3R', partDescription: '3 Receptacle Under-Wrksf Mount',
      optionCode: '—', optionDescription: 'Undecided...',
      tag: 'PDM', unitPrice: 411, overallConfidence: 42, status: 'expert-hub',
      unitPriceExt: 2466, pctCustomer: 0, unitCustomer: 411, extendedCust: 2466,
      unitDealer: 0, pctDealer: -100, extendedDealer: 0, marginDollar: 411, pctMargin: 100,
      optionBreakdown: [{ code: '—', description: 'Undecided...' }] },
    { line: 4, sourceCo: 'MWS', qty: 6, partNumber: 'FXA-SM', partDescription: 'Dynamic Single Monitor Arm',
      optionCode: '—', optionDescription: 'Undecided...',
      tag: 'MAS', unitPrice: 360, overallConfidence: 58, status: 'ai-suggested',
      unitPriceExt: 2160, pctCustomer: 0, unitCustomer: 360, extendedCust: 2160,
      unitDealer: 0, pctDealer: -100, extendedDealer: 0, marginDollar: 360, pctMargin: 100,
      optionBreakdown: [{ code: '—', description: 'Undecided...' }] },
    { line: 5, sourceCo: 'MWS', qty: 6, partNumber: 'CTK-24W', partDescription: 'Cable Mgmt Kit 24W',
      optionCode: '—', optionDescription: 'Undecided...',
      tag: 'CMT', unitPrice: 95, overallConfidence: 62, status: 'ai-suggested',
      unitPriceExt: 570, pctCustomer: 0, unitCustomer: 95, extendedCust: 570,
      unitDealer: 0, pctDealer: -100, extendedDealer: 0, marginDollar: 95, pctMargin: 100,
      optionBreakdown: [{ code: '—', description: 'Undecided...' }] },
    { line: 6, sourceCo: 'MWS', qty: 6, partNumber: 'SBN-15E', partDescription: 'Hinge-Dr Bin 20H×10W×15D RHw/Elock',
      optionCode: '.M/—/—/—/.E/.BNL',
      optionDescription: 'Beam / Undecided... / Undecided... / Undecided... / Digilock / Brushed Ni...',
      tag: 'UHD', unitPrice: 919, overallConfidence: 55, status: 'expert-hub',
      unitPriceExt: 5514, pctCustomer: 0, unitCustomer: 919, extendedCust: 5514,
      unitDealer: 0, pctDealer: -100, extendedDealer: 0, marginDollar: 919, pctMargin: 100,
      optionBreakdown: [
        { code: '.M', description: 'Beam mount' }, { code: '—', description: 'Undecided...' },
        { code: '—', description: 'Undecided...' }, { code: '—', description: 'Undecided...' },
        { code: '.E', description: 'Digilock' }, { code: '.BNL', description: 'Brushed Nickel' },
      ] },
    { line: 7, sourceCo: 'MWS', qty: 3, partNumber: 'PRL-72C', partDescription: 'Optimize 72W 4 Circuit',
      optionCode: 'P', optionDescription: 'CLR: Black',
      tag: 'PT2', unitPrice: 313, overallConfidence: 94, status: 'auto',
      unitPriceExt: 939, pctCustomer: 0, unitCustomer: 313, extendedCust: 939,
      unitDealer: 0, pctDealer: -100, extendedDealer: 0, marginDollar: 313, pctMargin: 100,
      optionBreakdown: [{ code: 'P', description: 'CLR: Black' }] },
];

const AUTO_ITEMS = WEB_EXTRACTED_ITEMS.filter(i => i.status === 'auto');
const AI_SUGGESTED_ITEMS = WEB_EXTRACTED_ITEMS.filter(i => i.status === 'ai-suggested');
const EXPERT_HUB_ITEMS = WEB_EXTRACTED_ITEMS.filter(i => i.status === 'expert-hub');
const NEEDS_REVIEW_ITEMS = [...AI_SUGGESTED_ITEMS, ...EXPERT_HUB_ITEMS];

// ─── Catalog volume: 54 items (7 real + 47 filler) ──────────────────────────

const CATALOG_ITEMS_TOTAL = 54;
const ITEMS_PER_PAGE = 8;

const FILLER_TEMPLATES: { partNumber: string; partDescription: string; optionCode: string; optionDescription: string; tag: string; unitPrice: number; optionBreakdown: OptionSegment[]; }[] = [
    { partNumber: 'WRK-60L', partDescription: 'WorkBench 60" Laminate Top', optionCode: 'STD/MLM', optionDescription: 'Standard / Maple Laminate', tag: 'DESK', unitPrice: 1245, optionBreakdown: [{ code: 'STD', description: 'Standard frame' }, { code: 'MLM', description: 'Maple Laminate' }] },
    { partNumber: 'FLP-22H', partDescription: 'FilePro 2-Drawer Lateral 22"', optionCode: 'STD/.BK', optionDescription: 'Standard lock / Black', tag: 'FIL', unitPrice: 487, optionBreakdown: [{ code: 'STD', description: 'Standard lock' }, { code: '.BK', description: 'Black finish' }] },
    { partNumber: 'TKB-75S', partDescription: 'TaskBar 75W Standing Frame', optionCode: 'ELT/SLV', optionDescription: 'Electric lift / Silver', tag: 'DESK', unitPrice: 892, optionBreakdown: [{ code: 'ELT', description: 'Electric lift' }, { code: 'SLV', description: 'Silver frame' }] },
    { partNumber: 'LED-36P', partDescription: 'LumenPanel 36" Under-Cabinet', optionCode: '.WH/4K', optionDescription: 'White / 4000K Neutral', tag: 'LAMP', unitPrice: 215, optionBreakdown: [{ code: '.WH', description: 'White housing' }, { code: '4K', description: '4000K Neutral' }] },
    { partNumber: 'SCR-12M', partDescription: 'ScreenDivide 12" Modesty Panel', optionCode: 'FAB/GR2', optionDescription: 'Fabric wrap / Grade 2', tag: 'ACC', unitPrice: 178, optionBreakdown: [{ code: 'FAB', description: 'Fabric wrap' }, { code: 'GR2', description: 'Grade 2 textile' }] },
    { partNumber: 'ARM-DM', partDescription: 'DualMount Monitor Arm 27"', optionCode: '.BK/CC', optionDescription: 'Black / C-Clamp', tag: 'MON', unitPrice: 425, optionBreakdown: [{ code: '.BK', description: 'Black finish' }, { code: 'CC', description: 'C-Clamp mount' }] },
    { partNumber: 'PWR-USB4', partDescription: 'PowerPort USB-C 4-Port Hub', optionCode: '.BK/120', optionDescription: 'Black / 120V', tag: 'PWR', unitPrice: 156, optionBreakdown: [{ code: '.BK', description: 'Black housing' }, { code: '120', description: '120V standard' }] },
    { partNumber: 'CAB-30R', partDescription: 'CableRun 30" Vertical Channel', optionCode: 'STD/SLV', optionDescription: 'Standard / Silver', tag: 'CBL', unitPrice: 68, optionBreakdown: [{ code: 'STD', description: 'Standard width' }, { code: 'SLV', description: 'Silver finish' }] },
    { partNumber: 'DRW-3P', partDescription: 'PedestalPro 3-Drawer Mobile', optionCode: '.BK/K', optionDescription: 'Black / Keyed lock', tag: 'FIL', unitPrice: 534, optionBreakdown: [{ code: '.BK', description: 'Black finish' }, { code: 'K', description: 'Keyed lock' }] },
    { partNumber: 'MRR-48W', partDescription: 'MeridianRail 48W Power+Data', optionCode: '.BK/120/2D', optionDescription: 'Black / 120V / 2 Data ports', tag: 'PWR', unitPrice: 289, optionBreakdown: [{ code: '.BK', description: 'Black finish' }, { code: '120', description: '120V standard' }, { code: '2D', description: '2 Data ports' }] },
];

const FILLER_QTY = [3, 6, 4, 6, 3, 6, 6, 3, 4, 6];
const FILLER_ITEMS: WebExtractedItem[] = FILLER_TEMPLATES.flatMap((tpl, pi) => {
    const count = pi < 7 ? 5 : 4; // 7×5 + 3×4 = 47
    return Array.from({ length: count }, (_, ci) => {
        const qty = FILLER_QTY[pi];
        return {
            line: 8 + pi * 5 + ci, sourceCo: 'MWS', qty,
            partNumber: tpl.partNumber, partDescription: tpl.partDescription,
            optionCode: tpl.optionCode, optionDescription: tpl.optionDescription,
            tag: tpl.tag, unitPrice: tpl.unitPrice,
            overallConfidence: 88 + (ci % 10), status: 'auto' as const,
            unitPriceExt: qty * tpl.unitPrice, pctCustomer: 0, unitCustomer: tpl.unitPrice,
            extendedCust: qty * tpl.unitPrice, unitDealer: 0, pctDealer: -100,
            extendedDealer: 0, marginDollar: tpl.unitPrice, pctMargin: 100,
            optionBreakdown: tpl.optionBreakdown,
        };
    });
}).slice(0, 47);

const ALL_CATALOG_ITEMS = [...WEB_EXTRACTED_ITEMS, ...FILLER_ITEMS];
const MAPPED_ITEMS_COUNT = ALL_CATALOG_ITEMS.filter(i => i.status === 'auto').length; // 50

// Review items with resolution data for d1.2 accordion
const REVIEW_ITEMS_WITH_DATA: { item: WebExtractedItem; aiSuggestion: AiSuggestion | null; expertResolution: ExpertResolution | null; }[] = [];
// Populated after AI_SUGGESTIONS & EXPERT_RESOLUTIONS are defined (see below)

interface AiSuggestion {
    id: string; itemLine: number; partNumber: string; partDescription: string;
    suggestedCode: string; suggestedDescription: string;
    reasoning: string; confidence: number;
    catalogContext: string;
}

const AI_SUGGESTIONS: AiSuggestion[] = [
    { id: 'ai1', itemLine: 4, partNumber: 'FXA-SM', partDescription: 'FlexArm Single Monitor',
      suggestedCode: 'BK/CC', suggestedDescription: 'Black / C-Clamp Mount',
      reasoning: 'Based on project context (healthcare office, laminate worksurfaces), C-Clamp is the standard mount type. Black matches the Apex chair color palette specified in line 2.',
      confidence: 85,
      catalogContext: 'FXA-SM  FlexArm Single Monitor Arm\nMount: C-Clamp (CC) | Grommet (GR) | Bolt-Through (BT)\nFinish: Black (BK) | Silver (SVR) | White (WH)\nCapacity: 7–20 lbs' },
    { id: 'ai2', itemLine: 5, partNumber: 'CTK-24W', partDescription: 'CableTrack Kit 24W',
      suggestedCode: 'UM', suggestedDescription: 'Under-Mount Standard',
      reasoning: 'CableTrack 24W has only one mounting option for standard worksurfaces. Under-Mount is the universal configuration — no other option applies.',
      confidence: 92,
      catalogContext: 'CTK-24W  CableTrack Cable Management Kit 24W\nMount: Under-Mount (UM) — standard\nFinish: matches worksurface\nIncludes: tray + clips + ties' },
];

interface ExpertResolution {
    id: string; itemLine: number; partNumber: string; partDescription: string;
    currentOption: string;
    expertName: string; expertRole: string;
    recommendation: string;
    resolvedCode: string; resolvedDescription: string;
    confidence: number;
    catalogContext: string;
}

const EXPERT_RESOLUTIONS: ExpertResolution[] = [
    { id: 'er1', itemLine: 3, partNumber: 'PDK-3R', partDescription: 'PowerDock 3-Receptacle Mount',
      currentOption: 'Undecided...',
      expertName: 'Marcus Chen', expertRole: 'Product Specialist, Meridian',
      recommendation: 'For healthcare office installations, the PowerDock 3R needs voltage and finish specification. Recommended: BK/120V/TAM — Black finish, 120V standard, Tamper-resistant outlets (required by code in medical facilities).',
      resolvedCode: 'BK/120V/TAM', resolvedDescription: 'Black / 120V Std / Tamper-resistant',
      confidence: 95,
      catalogContext: 'PDK-3R  PowerDock 3-Receptacle Under-Worksurface\nVoltage: 120V (std) | 240V\nFinish: Black (BK) | Silver (SVR)\nOutlet type: Standard (STD) | Tamper-resistant (TAM)\n*TAM required for healthcare per NEC 406.12' },
    { id: 'er2', itemLine: 6, partNumber: 'SBN-15E', partDescription: 'SecureBin 15D Storage w/Lock',
      currentOption: 'Undecided...',
      expertName: 'Marcus Chen', expertRole: 'Product Specialist, Meridian',
      recommendation: 'SecureBin with electronic lock (E) needs lock type specification: DGL (Digilock programmable) is standard for healthcare — supports temporary codes for rotating staff. Lock finish should match hardware: Brushed Nickel already specified.',
      resolvedCode: 'DGL', resolvedDescription: 'Digilock Programmable',
      confidence: 93,
      catalogContext: 'SBN-15E  SecureBin 15D Storage 20H×10W×15D\nLock: Keyed (K) | Digilock (DGL) | RFID (RFD)\nMount: Beam (M) | Lateral (L)\nFinish: Brushed Nickel (BNL) | Chrome (CHR)\n*DGL recommended for multi-user healthcare environments' },
];

// Populate REVIEW_ITEMS_WITH_DATA now that AI_SUGGESTIONS & EXPERT_RESOLUTIONS exist
NEEDS_REVIEW_ITEMS.forEach(item => {
    REVIEW_ITEMS_WITH_DATA.push({
        item,
        aiSuggestion: AI_SUGGESTIONS.find(s => s.itemLine === item.line) || null,
        expertResolution: EXPERT_RESOLUTIONS.find(e => e.itemLine === item.line) || null,
    });
});

interface UpchargeItem {
    id: string; itemLine: number; product: string;
    finishOrOption: string; perUnit: number; qty: number; total: number;
    note: string;
}

const UPCHARGE_ITEMS: UpchargeItem[] = [
    { id: 'uc1', itemLine: 2, product: 'Apex Mesh High-Back Adj Arms', finishOrOption: 'Grade 3 upholstery (Charcoal)', perUnit: 185, qty: 6, total: 1110,
      note: 'Grade 3 fabric specified on seat cushion — upgrade from standard Grade 1. Charcoal colorway from premium textile collection.' },
    { id: 'uc2', itemLine: 6, product: 'SecureBin 15D Storage w/Lock', finishOrOption: 'Digilock electronic lock', perUnit: 60, qty: 6, total: 360,
      note: 'Electronic Digilock selected per Expert Hub recommendation. Replaces standard keyed lock — requires power connection at install.' },
];

// d1.3: Items split by price review vs verified
const PRICE_REVIEW_ITEMS = WEB_EXTRACTED_ITEMS.filter(
    item => UPCHARGE_ITEMS.some(uc => uc.itemLine === item.line)
);
const VERIFIED_ITEMS = WEB_EXTRACTED_ITEMS.filter(
    item => !UPCHARGE_ITEMS.some(uc => uc.itemLine === item.line)
);

// Spec preview items (all Meridian Workspace)
const SPEC_PREVIEW_ITEMS = WEB_EXTRACTED_ITEMS.map(item => ({
    line: item.line, mfg: MANUFACTURER, product: item.partDescription,
    partNumber: item.partNumber, qty: item.qty, listPrice: item.unitPrice,
    source: item.status as 'auto' | 'ai-suggested' | 'expert-hub',
}));

// SC items for d1.5 review table
interface ScSpecItem {
    line: number; mfg: string; product: string; partNumber: string;
    optionDesc: string; qty: number; listPrice: number;
    source: 'auto' | 'ai-suggested' | 'expert-hub';
    flagged: boolean; flagNote?: string;
}

const SC_SPEC_ITEMS: ScSpecItem[] = [
    { line: 1, mfg: 'MWS', product: 'Beacon LED Desk Lamp 48"', partNumber: 'BDL-48S', optionDesc: 'Silver', qty: 6, listPrice: 383, source: 'auto', flagged: false },
    { line: 2, mfg: 'MWS', product: 'Apex Mesh High-Back Adj Arms', partNumber: 'AXM-HBW', optionDesc: 'Std cushion / Hard Casters / Lumbar / Charcoal', qty: 6, listPrice: 1668, source: 'auto', flagged: false },
    { line: 3, mfg: 'MWS', product: 'PowerDock 3-Receptacle Mount', partNumber: 'PDK-3R', optionDesc: 'Black / 120V / Tamper-resistant', qty: 6, listPrice: 411, source: 'expert-hub', flagged: true, flagNote: 'Expert Hub resolved — Marcus Chen confirmed TAM outlets required for healthcare' },
    { line: 4, mfg: 'MWS', product: 'FlexArm Single Monitor', partNumber: 'FXA-SM', optionDesc: 'Black / C-Clamp', qty: 6, listPrice: 360, source: 'ai-suggested', flagged: false },
    { line: 5, mfg: 'MWS', product: 'CableTrack Kit 24W', partNumber: 'CTK-24W', optionDesc: 'Under-Mount Standard', qty: 6, listPrice: 95, source: 'ai-suggested', flagged: false },
    { line: 6, mfg: 'MWS', product: 'SecureBin 15D Storage w/Lock', partNumber: 'SBN-15E', optionDesc: 'Beam / Digilock / Brushed Nickel', qty: 6, listPrice: 919, source: 'expert-hub', flagged: true, flagNote: 'Expert Hub resolved — Marcus Chen recommended Digilock for healthcare' },
    { line: 7, mfg: 'MWS', product: 'PowerRail 72W 4-Circuit', partNumber: 'PRL-72C', optionDesc: 'Black', qty: 3, listPrice: 313, source: 'auto', flagged: false },
];

// SC filler items for pagination (lines 8–54)
const SC_FILLER_ITEMS: ScSpecItem[] = FILLER_ITEMS.slice(0, 47).map((fi, i) => ({
    line: 8 + i, mfg: 'MWS', product: fi.partDescription, partNumber: fi.partNumber,
    optionDesc: fi.optionDescription, qty: fi.qty, listPrice: fi.unitPrice,
    source: 'auto' as const, flagged: false,
}));
const ALL_SC_ITEMS = [...SC_SPEC_ITEMS, ...SC_FILLER_ITEMS];

const SOURCE_EXCERPTS: Record<number, string> = {
    2: 'AXM-HBW  Relate Std Mesh High-Back / Adj Arms\nUpholstery: Grade 1 (std) | Grade 2 | Grade 3 (premium)\nCushion: Standard | Comfort\nCasters: Hard (std) | Soft\n*Grade 3 — Moxie Flint from premium textile collection',
    3: 'PDK-3R  PowerDock 3-Receptacle Under-Worksurface\nVoltage: 120V (std) | 240V\nFinish: Black (BK) | Silver (SVR)\nOutlet: Standard (STD) | Tamper-resistant (TAM)\n*TAM required for healthcare per NEC 406.12',
    4: 'FXA-SM  FlexArm Single Monitor Arm\nMount: C-Clamp (CC) | Grommet (GR)\nFinish: Black (BK) | Silver (SVR)\nCapacity: 7–20 lbs — standard medical display',
    5: 'CTK-24W  CableTrack Kit 24W\nMount: Under-Mount (UM) — standard\nIncludes: tray + clips + ties\nFinish: matches worksurface',
    6: 'SBN-15E  SecureBin 15D Storage\nLock: Keyed (K) | Digilock (DGL) | RFID\nMount: Beam (M) | Lateral (L)\nFinish: Brushed Nickel (BNL) | Chrome\n*DGL for multi-user healthcare',
};

const DISCOUNT_TIERS = [
    { id: 'dt1', manufacturer: MANUFACTURER, discountType: 'Dealer Standard', rate: 38, source: `${MANUFACTURER} Dealer Agreement #2026-MWS-D041`, items: 48, listTotal: 22340, aiJustification: 'Standard dealer tier based on annual volume commitment ($500K+). Consistent with last 3 POs.' },
    { id: 'dt2', manufacturer: MANUFACTURER, discountType: 'Healthcare Program', rate: 12, source: `${MANUFACTURER} Healthcare Vertical Incentive #HCI-2026`, items: CATALOG_ITEMS_TOTAL, listTotal: PROJECT_TOTAL, aiJustification: 'Mercy Health qualifies for healthcare vertical pricing. Applied to full spec as supplemental discount.' },
    { id: 'dt3', manufacturer: MANUFACTURER, discountType: 'Project Volume', rate: 5, source: `${MANUFACTURER} Project Volume Rebate ($25K+ orders)`, items: CATALOG_ITEMS_TOTAL, listTotal: PROJECT_TOTAL, aiJustification: 'Order exceeds $25K threshold. Volume rebate applied post-discount. Confirm with rep before quoting.' },
];

// ─── Agent Arrays ────────────────────────────────────────────────────────────

const EXTRACTION_AGENTS: AgentVis[] = [
    { name: 'DocumentParser', detail: `Reading vendor quote PDF — ${MANUFACTURER} Healthcare Office`, visible: false, done: false },
    { name: 'LineItemExtractor', detail: `Extracting line items with pricing — ${CATALOG_ITEMS_TOTAL} products identified`, visible: false, done: false },
    { name: 'OptionParser', detail: `Classifying part numbers, options, finishes — ${CATALOG_ITEMS_TOTAL} items`, visible: false, done: false },
    { name: 'UndecidedDetector', detail: `${NEEDS_REVIEW_ITEMS.length} items have incomplete options — flagging for review`, visible: false, done: false },
];

const MAPPING_AGENTS: AgentVis[] = [
    { name: 'SpecMapper', detail: `Mapping ${CATALOG_ITEMS_TOTAL} ${MANUFACTURER} items to SPEC format`, visible: false, done: false },
    { name: 'OptionInferenceEngine', detail: 'Analyzing project context — 2 options auto-suggested', visible: false, done: false },
    { name: 'ExpertHubRouter', detail: '2 items escalated to Expert Hub — specialist responded', visible: false, done: false },
];



// ─── Component ───────────────────────────────────────────────────────────────

interface DuplerPdfProcessorProps {
    onNavigate: (page: string) => void;
}

const SOURCE_BADGE_COLORS = {
    teal:   'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
    amber:  'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    green:  'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
    purple: 'bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    blue:   'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
};

function SourceBadge({ label, color = 'teal' }: { label: string; color?: 'teal' | 'amber' | 'green' | 'purple' | 'blue' }) {
    return <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${SOURCE_BADGE_COLORS[color]}`}>{label}</span>;
}

export default function DuplerPdfProcessor({ onNavigate }: DuplerPdfProcessorProps) {
    const { currentStep, nextStep, prevStep, isPaused } = useDemo();
    const stepId = currentStep.id;

    // ── pauseAware ──
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

    // ── d1.1 State: Vendor Data Import ──
    const [scrapePhase, setScrapePhase] = useState<ScrapePhase>('idle');
    // Sync Action Center visibility to the scrapePhase · fire show only when
    // the flow enters the 'notification' phase, hide whenever it leaves.
    // Diego 2026-07-22 · this is the source of truth for the Non-CET alert
    // lifecycle in the AC (before, AC guessed by stepId which desynced from
    // the actual flow phase on import / dismiss / reload / restart).
    useEffect(() => {
        if (scrapePhase === 'notification') {
            window.dispatchEvent(new CustomEvent('dupler:non-cet-show'));
        } else {
            window.dispatchEvent(new CustomEvent('dupler:non-cet-hide'));
        }
    }, [scrapePhase]);
    const [uploadTab, setUploadTab] = useState<'pdf' | 'url' | 'sif'>('pdf');
    const [pdfFile, setPdfFile] = useState(false);
    const [urlPasted, setUrlPasted] = useState(false);
    const [extractAgents, setExtractAgents] = useState(EXTRACTION_AGENTS.map(a => ({ ...a })));
    const [extractProgress, setExtractProgress] = useState(0);
    const [itemsRevealed, setItemsRevealed] = useState(0);
    const [scanProgress, setScanProgress] = useState(0);
    // d1.1 pagination, filters & expandable rows
    const [catalogPage, setCatalogPage] = useState(0);
    const [catalogFilter, setCatalogFilter] = useState<'all' | 'mapped' | 'review'>('all');
    const [filterAutoSwitched, setFilterAutoSwitched] = useState(false);
    const [expandedCatalogItem, setExpandedCatalogItem] = useState<number | null>(null);
    const [editModalItem, setEditModalItem] = useState<WebExtractedItem | null>(null);

    // ── d1.2 State: AI Suggestions & Expert Hub ──
    const [mapPhase, setMapPhase] = useState<MappingPhase>('idle');
    const [mapAgents, setMapAgents] = useState(MAPPING_AGENTS.map(a => ({ ...a })));
    const [reviewResolved, setReviewResolved] = useState<Record<string, 'accepted' | 'edited' | null>>({});
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [expandedReviewItem, setExpandedReviewItem] = useState<string | null>(null);

    // ── d1.3 State: Validation ──
    const [valPhase, setValPhase] = useState<ValidationPhase>('idle');
    const [upchargesAcked, setUpchargesAcked] = useState<Record<string, 'acknowledged' | 'flagged' | null>>({});
    const [valFilter, setValFilter] = useState<'cost-adjustments' | 'price-ok'>('cost-adjustments');
    const [valProgress, setValProgress] = useState(0);

    // ── d1.4 State: Spec Package ──
    const [pkgPhase, setPkgPhase] = useState<PackagePhase>('idle');
    const [pkgProgress, setPkgProgress] = useState(0);
    const [pkgPage, setPkgPage] = useState(0);
    const [sifPhase, setSifPhase] = useState<'idle' | 'converting' | 'ready'>('idle');
    const [sifProgress, setSifProgress] = useState(0);
    const [specSent, setSpecSent] = useState(false);
    const [showSendPopover, setShowSendPopover] = useState(false);
    const [sendToast, setSendToast] = useState(false);
    const [catalogSyncPhase, setCatalogSyncPhase] = useState<'idle' | 'syncing' | 'done'>('idle');
    const [catalogSyncProgress, setCatalogSyncProgress] = useState(0);

    // ── Timing helpers ──
    const tp = (id: string): DuplerStepTiming => DUPLER_STEP_TIMING[id] || DUPLER_STEP_TIMING['d1.1'];

    // ── d1.1 computed: filtered + paginated catalog ──
    const filteredCatalog = catalogFilter === 'all' ? ALL_CATALOG_ITEMS
        : catalogFilter === 'mapped' ? ALL_CATALOG_ITEMS.filter(i => i.status === 'auto')
        : ALL_CATALOG_ITEMS.filter(i => i.status !== 'auto');
    const totalPages = Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE);
    const pagedItems = filteredCatalog.slice(catalogPage * ITEMS_PER_PAGE, (catalogPage + 1) * ITEMS_PER_PAGE);

    // ── d1.3 computed: filtered items for price validation ──
    const valFilteredItems = valFilter === 'cost-adjustments' ? PRICE_REVIEW_ITEMS : VERIFIED_ITEMS;

    // ── d1.4 computed: paginated items for spec package ──
    const pkgTotalPages = Math.ceil(ALL_CATALOG_ITEMS.length / ITEMS_PER_PAGE);
    const pkgPagedItems = ALL_CATALOG_ITEMS.slice(pkgPage * ITEMS_PER_PAGE, (pkgPage + 1) * ITEMS_PER_PAGE);

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.1: Vendor Data Import & AI Extraction
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.1') { setScrapePhase('idle'); return; }
        setScrapePhase('idle');
        setExtractAgents(EXTRACTION_AGENTS.map(a => ({ ...a })));
        setExtractProgress(0);
        setItemsRevealed(0);
        setScanProgress(0);
        setCatalogPage(0);
        setCatalogFilter('all');
        setFilterAutoSwitched(false);
        setExpandedCatalogItem(null);
        setUploadTab('pdf');
        setPdfFile(false);
        setUrlPasted(false);
        const handler = () => setScrapePhase('notification');
        // Import CTA fired from the Action Center notification (Non-CET
        // manufacturer detected) advances the flow to the upload zone.
        const importHandler = () => setScrapePhase('upload-zone');
        window.addEventListener('dupler-vendor-upload', handler);
        window.addEventListener('dupler:import-vendor-data', importHandler);
        return () => {
            window.removeEventListener('dupler-vendor-upload', handler);
            window.removeEventListener('dupler:import-vendor-data', importHandler);
        };
    }, [stepId]);

    // Upload zone: simulate file/URL appearing
    useEffect(() => {
        if (scrapePhase !== 'upload-zone') return;
        setPdfFile(false);
        setUrlPasted(false);
        if (uploadTab === 'pdf') {
            const t1 = setTimeout(pauseAware(() => setPdfFile(true)), 1200);
            return () => clearTimeout(t1);
        } else if (uploadTab === 'url') {
            const t1 = setTimeout(pauseAware(() => setUrlPasted(true)), 1000);
            return () => clearTimeout(t1);
        }
    }, [scrapePhase, uploadTab]);

    // Scraping: scan progress ~2s → processing
    useEffect(() => {
        if (scrapePhase !== 'scraping') return;
        setScanProgress(0);
        const duration = 2000;
        const steps = 20;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(pauseAware(() => setScanProgress(Math.min(100, Math.round((i / steps) * 100)))), (duration / steps) * i));
        }
        timers.push(setTimeout(pauseAware(() => setScrapePhase('processing')), duration + 600));
        return () => timers.forEach(clearTimeout);
    }, [scrapePhase]);

    // Processing: stagger extraction agents
    useEffect(() => {
        if (scrapePhase !== 'processing') return;
        setExtractAgents(EXTRACTION_AGENTS.map(a => ({ ...a })));
        setExtractProgress(0);
        const t = tp('d1.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setExtractProgress(100), 50));
        EXTRACTION_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setExtractAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setExtractAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = EXTRACTION_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setScrapePhase('breathing')), total));
        return () => timers.forEach(clearTimeout);
    }, [scrapePhase]);

    // Breathing → revealed
    useEffect(() => {
        if (scrapePhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setScrapePhase('revealed')), tp('d1.1').breathing);
        return () => clearTimeout(t);
    }, [scrapePhase]);

    // Revealed: stagger first page items → results
    useEffect(() => {
        if (scrapePhase !== 'revealed') return;
        setItemsRevealed(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        const count = Math.min(ITEMS_PER_PAGE, ALL_CATALOG_ITEMS.length);
        for (let i = 0; i < count; i++) {
            timers.push(setTimeout(pauseAware(() => setItemsRevealed(i + 1)), i * 120));
        }
        timers.push(setTimeout(pauseAware(() => setScrapePhase('results')), count * 120 + 500));
        return () => timers.forEach(clearTimeout);
    }, [scrapePhase]);

    // Auto-advance to d1.2 (review) after initial reveal
    useEffect(() => {
        if (scrapePhase !== 'results' || filterAutoSwitched) return;
        const t = setTimeout(pauseAware(() => {
            setFilterAutoSwitched(true);
            nextStep(); // seamless transition — d1.2 continues with Needs Review filter
        }), 1800);
        return () => clearTimeout(t);
    }, [scrapePhase, filterAutoSwitched]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.2: AI Suggestions & Expert Hub Resolution
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.2') { setMapPhase('idle'); return; }
        setMapPhase('idle');
        setReviewResolved({});
        setEditingItem(null);
        setExpandedCatalogItem(null);
        // Seamless continuation from d1.1 — go straight to revealed, no notification/processing
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setMapPhase('revealed')), 300));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    // Auto-expand first unresolved review item in d1.2 (uses same expandedCatalogItem as d1.1 for seamless continuity)
    useEffect(() => {
        if (mapPhase !== 'revealed') return;
        const firstUnresolved = REVIEW_ITEMS_WITH_DATA.find(r => {
            const id = r.aiSuggestion?.id || r.expertResolution?.id;
            return id && !reviewResolved[id];
        });
        if (firstUnresolved) {
            setExpandedCatalogItem(firstUnresolved.item.line);
        }
    }, [mapPhase, reviewResolved]);

    const reviewResolvedCount = Object.values(reviewResolved).filter(v => v !== null).length;
    const allReviewsResolved = reviewResolvedCount >= NEEDS_REVIEW_ITEMS.length;

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.3: Specification Assembly & SC Handoff
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.3') { setPkgPhase('idle'); return; }
        setPkgPhase('idle');
        setPkgProgress(0);
        setPkgPage(0);
        setSpecSent(false);
        setShowSendPopover(false);
        setSendToast(false);
        setCatalogSyncPhase('idle');
        setCatalogSyncProgress(0);
        setExpandedCatalogItem(null);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setPkgPhase('processing')), 300));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    useEffect(() => {
        if (pkgPhase !== 'processing') return;
        setPkgProgress(0);
        const duration = 2000;
        const steps = 20;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(
                pauseAware(() => setPkgProgress(Math.min(100, Math.round((i / steps) * 100)))),
                (duration / steps) * i
            ));
        }
        timers.push(setTimeout(pauseAware(() => setPkgPhase('revealed')), duration + 400));
        return () => timers.forEach(clearTimeout);
    }, [pkgPhase]);

    // SIF conversion effect
    useEffect(() => {
        if (sifPhase !== 'converting') return;
        setSifProgress(0);
        const duration = 1500;
        const steps = 15;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(
                pauseAware(() => setSifProgress(Math.min(100, Math.round((i / steps) * 100)))),
                (duration / steps) * i
            ));
        }
        timers.push(setTimeout(pauseAware(() => setSifPhase('ready')), duration + 400));
        return () => timers.forEach(clearTimeout);
    }, [sifPhase]);

    // Catalog sync effect (d1.4 post-send)
    useEffect(() => {
        if (catalogSyncPhase !== 'syncing') return;
        setCatalogSyncProgress(0);
        const duration = 2200;
        const steps = 20;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(
                pauseAware(() => setCatalogSyncProgress(Math.min(100, Math.round((i / steps) * 100)))),
                (duration / steps) * i
            ));
        }
        timers.push(setTimeout(pauseAware(() => setCatalogSyncPhase('done')), duration + 400));
        timers.push(setTimeout(pauseAware(() => nextStep()), duration + 2500));
        return () => timers.forEach(clearTimeout);
    }, [catalogSyncPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Render Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    const renderAgentPipeline = (agents: AgentVis[], progress: number, label: string) => (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3">
                <AIAgentAvatar />
                <span className="text-xs font-bold text-foreground">{label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${progress}%` }} />
            </div>
            <div className="space-y-1.5">
                {agents.map(agent => (
                    <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                        {agent.done ?
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> :
                            <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                        }
                        <span className={agent.done ? 'text-foreground' : 'text-indigo-600 dark:text-indigo-400'}>{agent.name}</span>
                        <span className="text-muted-foreground">{agent.detail}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderNotification = (icon: React.ReactNode, title: string, detail: React.ReactNode, onClick: () => void) => (
        <button onClick={onClick} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">{icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{title}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">{detail}</div>
                        <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to start <ArrowRightIcon className="h-3 w-3" /></p>
                    </div>
                </div>
            </div>
        </button>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (!stepId.startsWith('d1.') || stepId === 'd1.4' || stepId === 'd1.5') return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">

            {/* ── d1.1: Vendor Data Import & AI Extraction ── */}
            {stepId === 'd1.1' && (
                <>
                    {/* The Non-CET Manufacturer alert now lives inside the
                        Action Center bell popover (Navbar) so the Vendor Data
                        flow uses the DS-canonical notification pattern instead
                        of an inline banner (Diego 2026-07-21).
                        See src/components/notifications/ActionCenter.tsx ·
                        DUPLER_D11_NOTIFICATION. The bell auto-opens once
                        when the user enters d1.1 · the "Import vendor data"
                        CTA dispatches `dupler:import-vendor-data` which the
                        listener below routes to setScrapePhase('upload-zone'). */}

                    {/* Upload zone — 3-tab bar: PDF (primary), URL, SIF */}
                    {scrapePhase === 'upload-zone' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                            {/* Tab bar */}
                            <div className="flex rounded-lg bg-muted/50 p-1 gap-1">
                                <button onClick={() => { setUploadTab('pdf'); setPdfFile(false); setUrlPasted(false); }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-bold transition-all ${
                                        uploadTab === 'pdf' ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    <DocumentTextIcon className="h-3.5 w-3.5" /> Upload PDF
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${uploadTab === 'pdf' ? 'bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>VENDOR PDF</span>
                                </button>
                                <button onClick={() => { setUploadTab('url'); setPdfFile(false); setUrlPasted(false); }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-bold transition-all ${
                                        uploadTab === 'url' ? 'bg-purple-100 dark:bg-ai/15 text-purple-700 dark:text-purple-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    <LinkIcon className="h-3.5 w-3.5" /> Paste URL
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${uploadTab === 'url' ? 'bg-purple-200 dark:bg-ai/20 text-purple-800 dark:text-purple-300' : 'bg-muted text-muted-foreground'}`}>MFR WEBSITE</span>
                                </button>
                                <button onClick={() => { setUploadTab('sif'); setPdfFile(false); setUrlPasted(false); }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-bold transition-all ${
                                        uploadTab === 'sif' ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    <ArrowUpTrayIcon className="h-3.5 w-3.5" /> Import SIF
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${uploadTab === 'sif' ? 'bg-blue-200 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300' : 'bg-muted text-muted-foreground'}`}>SIF FILE</span>
                                </button>
                            </div>

                            {/* PDF tab — drag-drop zone with simulated file */}
                            {uploadTab === 'pdf' && (
                                <div className={`rounded-xl bg-card border-2 border-dashed transition-all duration-300 overflow-hidden ${
                                    pdfFile ? 'border-amber-400 dark:border-amber-500/40' : 'border-amber-300 dark:border-amber-500/30'
                                }`}>
                                    <div className="p-6">
                                        {!pdfFile ? (
                                            <div className="flex flex-col items-center justify-center py-4 gap-3">
                                                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-500/10">
                                                    <DocumentTextIcon className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-foreground">Upload Vendor Quote</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Drag & drop a manufacturer PDF quote or price sheet</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] text-muted-foreground">Supported: PDF, XLSX</span>
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                    <span className="text-[9px] text-muted-foreground">Max 25 MB</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10 shrink-0">
                                                        <DocumentTextIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-foreground truncate">Meridian_Healthcare_Q1_2026.pdf</p>
                                                        <p className="text-[10px] text-muted-foreground">2.4 MB — Vendor quote</p>
                                                    </div>
                                                    <SourceBadge label="VENDOR PDF" color="amber" />
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                                                </div>
                                                <button
                                                    onClick={() => setScrapePhase('scraping')}
                                                    className="w-full mt-3 py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                                                >
                                                    <MagnifyingGlassIcon className="h-4 w-4" />
                                                    Extract Data
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* URL tab — paste URL input */}
                            {uploadTab === 'url' && (
                                <div className="rounded-xl bg-card border-2 border-dashed border-purple-300 dark:border-purple-500/40 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex flex-col items-center justify-center py-4 gap-3">
                                            <div className="p-3 rounded-full bg-purple-100 dark:bg-ai/10">
                                                <LinkIcon className="h-10 w-10 text-ai dark:text-purple-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-foreground">Paste Manufacturer URL</p>
                                                <p className="text-xs text-muted-foreground mt-1">Manufacturer catalog pages, product listings, or price sheets</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all duration-300 mt-2 ${
                                            urlPasted
                                                ? 'bg-purple-50 dark:bg-ai/5 border-purple-400 dark:border-purple-500/40 ring-2 ring-purple-200 dark:ring-purple-500/20'
                                                : 'bg-muted/30 border-border'
                                        }`}>
                                            <div className={`p-1 rounded transition-colors duration-300 ${urlPasted ? 'bg-purple-200 dark:bg-ai/20' : 'bg-muted'}`}>
                                                <LinkIcon className={`h-3.5 w-3.5 transition-colors duration-300 ${urlPasted ? 'text-ai dark:text-purple-400' : 'text-muted-foreground'}`} />
                                            </div>
                                            {urlPasted ? (
                                                <span className="text-xs text-purple-800 dark:text-purple-300 font-mono font-semibold flex-1 truncate animate-in fade-in slide-in-from-left-4 duration-300">
                                                    {CATALOG_URL}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/50 font-mono flex-1 flex items-center">
                                                    https://
                                                    <span className="inline-block w-[1px] h-3.5 bg-muted-foreground/40 ml-0.5 animate-pulse" />
                                                </span>
                                            )}
                                            {urlPasted && (
                                                <SourceBadge label="MFR WEBSITE" color="purple" />
                                            )}
                                        </div>
                                        {urlPasted && (
                                            <button
                                                onClick={() => setScrapePhase('scraping')}
                                                className="w-full mt-3 py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                                            >
                                                <MagnifyingGlassIcon className="h-4 w-4" />
                                                Extract Data
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SIF tab — file drop zone */}
                            {uploadTab === 'sif' && (
                                <div className="rounded-xl bg-card border-2 border-dashed border-blue-300 dark:border-blue-500/40 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex flex-col items-center justify-center py-4 gap-3">
                                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/10">
                                                <ArrowUpTrayIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-foreground">Import SIF File</p>
                                                <p className="text-xs text-muted-foreground mt-1">Drag & drop a SIF specification file from another system</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-muted-foreground">Supported: .sif</span>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                <span className="text-[9px] text-muted-foreground">SPEC interchange format</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scraping/Parsing — reading source data */}
                    {scrapePhase === 'scraping' && (
                        <div className="animate-in fade-in duration-300 space-y-4">
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${uploadTab === 'url' ? 'bg-purple-100 dark:bg-ai/10' : 'bg-amber-100 dark:bg-amber-500/10'}`}>
                                        {uploadTab === 'url'
                                            ? <LinkIcon className="h-5 w-5 text-ai" />
                                            : <DocumentTextIcon className="h-5 w-5 text-amber-500" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground">{MANUFACTURER} — Healthcare Office</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {uploadTab === 'url' ? 'AI navigating manufacturer catalog page...' : 'Reading vendor quote — extracting line items and pricing...'}
                                        </p>
                                    </div>
                                    <SourceBadge label={uploadTab === 'url' ? 'SCRAPING' : 'PARSING PDF'} color={uploadTab === 'url' ? 'purple' : 'amber'} />
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-200 ease-linear ${uploadTab === 'url' ? 'bg-purple-400' : 'bg-amber-400'}`} style={{ width: `${scanProgress}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    {scanProgress < 100
                                        ? (uploadTab === 'url' ? 'Reading catalog page — extracting product data...' : 'Parsing PDF document — identifying tables and line items...')
                                        : 'Extraction complete — starting field analysis...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Processing — agent pipeline */}
                    {scrapePhase === 'processing' && renderAgentPipeline(extractAgents, extractProgress, `Vendor Data Extraction — ${MANUFACTURER} Healthcare Office...`)}

                    {/* Breathing */}
                    {scrapePhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-ai animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Structuring vendor data...</span>
                        </div>
                    )}

                    {/* Revealed + Results — extraction results with expandable rows + filters + pagination */}
                    {(scrapePhase === 'revealed' || scrapePhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Success summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2 mb-3">
                                    <AIAgentAvatar />
                                    <div className="flex-1">
                                        <p className="text-xs text-green-800 dark:text-green-200">
                                            <span className="font-bold">DocumentParser:</span> {CATALOG_ITEMS_TOTAL} items extracted from {MANUFACTURER} vendor quote. Part numbers, quantities, options, and pricing fields identified.
                                        </p>
                                    </div>
                                    <SourceBadge label="VENDOR PDF" color="amber" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1 text-[9px] text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                        <CheckCircleIcon className="h-3 w-3" />{MAPPED_ITEMS_COUNT} Fully Mapped
                                    </span>
                                    <span className="flex items-center gap-1 text-[9px] text-brand-700 dark:text-brand-400 bg-brand-100 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                                        <CheckCircleIcon className="h-3 w-3" />{AI_SUGGESTED_ITEMS.length} AI-Suggested
                                    </span>
                                    <span className="flex items-center gap-1 text-[9px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                                        <ExclamationTriangleIcon className="h-3 w-3" />{EXPERT_HUB_ITEMS.length} Need Expert Hub
                                    </span>
                                </div>
                            </div>

                            {/* Extracted items table — SPEC format with expandable rows */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                {/* Header + Filter chips */}
                                <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <DocumentTextIcon className="h-4 w-4 text-amber-500" />
                                            <span className="text-xs font-bold text-foreground">Vendor Quote — {MANUFACTURER}</span>
                                            <span className="text-[8px] font-mono text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 flex items-center gap-1">
                                                <DocumentTextIcon className="h-2.5 w-2.5" /> Healthcare Office
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-muted-foreground">{filteredCatalog.length} of {CATALOG_ITEMS_TOTAL} items</span>
                                    </div>
                                    {/* Filter chips — Needs Review triggers transition to d1.2 */}
                                    <div className="flex items-center gap-1.5">
                                        {([
                                            { key: 'all' as const, label: 'All', count: ALL_CATALOG_ITEMS.length },
                                            { key: 'mapped' as const, label: 'Mapped', count: MAPPED_ITEMS_COUNT },
                                            { key: 'review' as const, label: 'Needs Review', count: NEEDS_REVIEW_ITEMS.length },
                                        ]).map(f => (
                                            <button key={f.key}
                                                onClick={() => {
                                                    if (f.key === 'review' && scrapePhase === 'results') {
                                                        setFilterAutoSwitched(true);
                                                        nextStep();
                                                    } else {
                                                        setCatalogFilter(f.key); setCatalogPage(0); setExpandedCatalogItem(null);
                                                    }
                                                }}
                                                className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-colors ${
                                                    catalogFilter === f.key
                                                        ? 'bg-brand-400 text-zinc-900'
                                                        : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border'
                                                }`}
                                            >
                                                {f.label} ({f.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[10px]">
                                        <thead>
                                            <tr className="text-muted-foreground border-b border-border bg-muted/30">
                                                <th className="w-6 py-1.5 px-1" />
                                                <th className="text-left py-1.5 px-2 font-medium">Source Co</th>
                                                <th className="text-right py-1.5 px-2 font-medium">Qty</th>
                                                <th className="text-left py-1.5 px-2 font-medium">Part Number</th>
                                                <th className="text-left py-1.5 px-2 font-medium">Part Description</th>
                                                <th className="text-left py-1.5 px-2 font-medium">Option Code</th>
                                                <th className="text-left py-1.5 px-2 font-medium">Option Desc</th>
                                                <th className="text-left py-1.5 px-1 font-medium">Tag</th>
                                                <th className="text-right py-1.5 px-2 font-medium">Unit $</th>
                                                <th className="text-center py-1.5 px-2 font-medium">Status</th>
                                                <th className="w-8 py-1.5 px-1" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedItems.map((item, idx) => {
                                                const isExpanded = expandedCatalogItem === item.line;
                                                const isHidden = scrapePhase === 'revealed' && idx >= itemsRevealed;
                                                return (
                                                    <React.Fragment key={`${item.line}-${item.partNumber}`}>
                                                        <tr
                                                            onClick={() => setExpandedCatalogItem(isExpanded ? null : item.line)}
                                                            className={`border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${isHidden ? 'opacity-0' : 'animate-in fade-in slide-in-from-left-2 duration-300'} ${item.status !== 'auto' ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}`}
                                                        >
                                                            <td className="py-1.5 px-1 text-center">
                                                                {isExpanded
                                                                    ? <ChevronUpIcon className="h-3 w-3 text-muted-foreground" />
                                                                    : <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />}
                                                            </td>
                                                            <td className="py-1.5 px-2 font-mono text-foreground">{item.sourceCo}</td>
                                                            <td className="py-1.5 px-2 text-right text-foreground">{item.qty}</td>
                                                            <td className="py-1.5 px-2 font-mono font-bold text-foreground">{item.partNumber}</td>
                                                            <td className="py-1.5 px-2 text-foreground max-w-[140px] truncate">{item.partDescription}</td>
                                                            <td className="py-1.5 px-2 font-mono text-foreground text-[9px] max-w-[100px] truncate">{item.optionCode ?? <span className="text-muted-foreground">—</span>}</td>
                                                            <td className="py-1.5 px-2 text-[9px] max-w-[120px] truncate">
                                                                {item.optionDescription.includes('Undecided') ? (
                                                                    <span className="font-bold text-amber-600 dark:text-amber-400">{item.optionDescription}</span>
                                                                ) : (
                                                                    <span className="text-foreground">{item.optionDescription}</span>
                                                                )}
                                                            </td>
                                                            <td className="py-1.5 px-1 text-muted-foreground font-mono text-[9px]">{item.tag}</td>
                                                            <td className="py-1.5 px-2 text-right font-medium text-foreground">${item.unitPrice.toLocaleString()}</td>
                                                            <td className="py-1.5 px-2 text-center">
                                                                {item.status === 'auto' && <SourceBadge label="AUTO" color="green" />}
                                                                {item.status === 'ai-suggested' && <SourceBadge label="AI SUGGESTED" color="green" />}
                                                                {item.status === 'expert-hub' && <SourceBadge label="EXPERT HUB" color="blue" />}
                                                            </td>
                                                            <td className="py-1.5 px-1 text-center">
                                                                <button onClick={(e) => { e.stopPropagation(); setEditModalItem(item); }}
                                                                    className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                                                                    title="Edit item">
                                                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {/* Expanded detail panel */}
                                                        {isExpanded && (
                                                            <tr className="border-b border-border/50">
                                                                <td colSpan={11} className="p-0">
                                                                    <div className="px-4 py-3 bg-muted/20 dark:bg-muted/10 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            {/* Left: SPEC Pricing Grid */}
                                                                            <div className="space-y-2">
                                                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">SPEC Pricing Detail</span>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] p-2.5 rounded-lg bg-card border border-border">
                                                                                    <div className="text-muted-foreground">Unit Price Ext <span className="font-mono font-bold text-foreground">${item.unitPriceExt.toLocaleString()}</span></div>
                                                                                    <div className="text-muted-foreground">% Customer <span className="font-mono text-foreground">{item.pctCustomer.toFixed(5)}</span></div>
                                                                                    <div className="text-muted-foreground">Unit Customer <span className="font-mono text-foreground">${item.unitCustomer.toLocaleString()}</span></div>
                                                                                    <div className="text-muted-foreground">Extended Cust <span className="font-mono text-foreground">${item.extendedCust.toLocaleString()}</span></div>
                                                                                    <div className="text-muted-foreground">Unit Dealer <span className="font-mono text-foreground">{item.unitDealer.toFixed(2)}</span></div>
                                                                                    <div className="text-muted-foreground">% Dealer <span className="font-mono text-foreground">{item.pctDealer.toFixed(5)}</span></div>
                                                                                    <div className="text-muted-foreground">Extended Dealer <span className="font-mono text-foreground">{item.extendedDealer.toFixed(2)}</span></div>
                                                                                    <div className="text-muted-foreground">Margin $ <span className="font-mono font-bold text-foreground">${item.marginDollar.toLocaleString()}</span></div>
                                                                                    <div className="col-span-2 text-muted-foreground">% Margin <span className="font-mono font-bold text-green-600 dark:text-green-400">{item.pctMargin.toFixed(5)}</span></div>
                                                                                </div>
                                                                            </div>
                                                                            {/* Right: Option Breakdown */}
                                                                            {item.optionBreakdown && item.optionBreakdown.length > 0 && (
                                                                                <div className="space-y-2">
                                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Option Breakdown</span>
                                                                                    <div className="grid grid-cols-2 gap-1.5 text-[10px] p-2.5 rounded-lg bg-card border border-border">
                                                                                        {item.optionBreakdown.map((ob, oi) => (
                                                                                            <div key={oi} className="flex items-center gap-1.5">
                                                                                                <span className="font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded text-[9px]">{ob.code}</span>
                                                                                                <span className="text-muted-foreground">→</span>
                                                                                                <span className={ob.description.includes('Undecided') ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground'}>{ob.description}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination footer */}
                                <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">
                                        {MAPPED_ITEMS_COUNT} mapped, {AI_SUGGESTED_ITEMS.length} AI-suggested, {EXPERT_HUB_ITEMS.length} Expert Hub
                                    </span>
                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { setCatalogPage(p => Math.max(0, p - 1)); setExpandedCatalogItem(null); }}
                                                disabled={catalogPage === 0}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeftIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            </button>
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                Page {catalogPage + 1} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => { setCatalogPage(p => Math.min(totalPages - 1, p + 1)); setExpandedCatalogItem(null); }}
                                                disabled={catalogPage >= totalPages - 1}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </>
            )}

            {/* ── d1.2: AI Suggestions & Expert Hub Resolution (seamless continuation of d1.1 table) ── */}
            {stepId === 'd1.2' && mapPhase === 'revealed' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                    {/* Same table structure as d1.1 — Needs Review filter active */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        {/* Header + Filter chips (Needs Review locked active) */}
                        <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-bold text-foreground">Vendor Quote — {MANUFACTURER}</span>
                                    <span className="text-[8px] font-mono text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 flex items-center gap-1">
                                        <DocumentTextIcon className="h-2.5 w-2.5" /> Healthcare Office
                                    </span>
                                </div>
                                <span className="text-[9px] text-muted-foreground">{reviewResolvedCount}/{NEEDS_REVIEW_ITEMS.length} Resolved</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {([
                                    { key: 'all' as const, label: 'All', count: ALL_CATALOG_ITEMS.length },
                                    { key: 'mapped' as const, label: 'Mapped', count: MAPPED_ITEMS_COUNT },
                                    { key: 'review' as const, label: 'Needs Review', count: NEEDS_REVIEW_ITEMS.length },
                                ]).map(f => (
                                    <span key={f.key}
                                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                                            f.key === 'review'
                                                ? 'bg-brand-400 text-zinc-900'
                                                : 'bg-muted text-muted-foreground border border-border opacity-40'
                                        }`}
                                    >
                                        {f.label} ({f.count})
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="text-muted-foreground border-b border-border bg-muted/30">
                                        <th className="w-6 py-1.5 px-1" />
                                        <th className="text-left py-1.5 px-2 font-medium">Source Co</th>
                                        <th className="text-right py-1.5 px-2 font-medium">Qty</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Part Number</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Part Description</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Option Code</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Option Desc</th>
                                        <th className="text-left py-1.5 px-1 font-medium">Tag</th>
                                        <th className="text-right py-1.5 px-2 font-medium">Unit $</th>
                                        <th className="text-center py-1.5 px-2 font-medium">Status</th>
                                        <th className="w-8 py-1.5 px-1" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {NEEDS_REVIEW_ITEMS.map(item => {
                                        const reviewData = REVIEW_ITEMS_WITH_DATA.find(r => r.item.line === item.line);
                                        const sug = reviewData?.aiSuggestion ?? null;
                                        const er = reviewData?.expertResolution ?? null;
                                        const rid = sug?.id || er?.id || '';
                                        const isResolved = !!reviewResolved[rid];
                                        const isExpanded = expandedCatalogItem === item.line;

                                        return (
                                            <React.Fragment key={`review-${item.line}`}>
                                                <tr
                                                    onClick={() => !isResolved && setExpandedCatalogItem(isExpanded ? null : item.line)}
                                                    className={`border-b border-border/50 transition-colors ${
                                                        isResolved
                                                            ? 'bg-green-50/50 dark:bg-green-500/5 cursor-default'
                                                            : 'bg-amber-50/50 dark:bg-amber-500/5 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-500/10'
                                                    }`}
                                                >
                                                    <td className="py-1.5 px-1 text-center">
                                                        {isResolved
                                                            ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                                                            : isExpanded
                                                                ? <ChevronUpIcon className="h-3 w-3 text-muted-foreground" />
                                                                : <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />}
                                                    </td>
                                                    <td className="py-1.5 px-2 font-mono text-foreground">{item.sourceCo}</td>
                                                    <td className="py-1.5 px-2 text-right text-foreground">{item.qty}</td>
                                                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">{item.partNumber}</td>
                                                    <td className="py-1.5 px-2 text-foreground max-w-[140px] truncate">{item.partDescription}</td>
                                                    <td className="py-1.5 px-2 font-mono text-foreground text-[9px] max-w-[100px] truncate">{item.optionCode ?? <span className="text-muted-foreground">—</span>}</td>
                                                    <td className="py-1.5 px-2 text-[9px] max-w-[120px] truncate">
                                                        {item.optionDescription.includes('Undecided') ? (
                                                            <span className="font-bold text-amber-600 dark:text-amber-400">{item.optionDescription}</span>
                                                        ) : (
                                                            <span className="text-foreground">{item.optionDescription}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-1.5 px-1 text-muted-foreground font-mono text-[9px]">{item.tag}</td>
                                                    <td className="py-1.5 px-2 text-right font-medium text-foreground">${item.unitPrice.toLocaleString()}</td>
                                                    <td className="py-1.5 px-2 text-center">
                                                        {isResolved
                                                            ? <SourceBadge label="RESOLVED" color="green" />
                                                            : item.status === 'ai-suggested'
                                                                ? <SourceBadge label="AI SUGGESTED" color="green" />
                                                                : <SourceBadge label="EXPERT HUB" color="blue" />}
                                                    </td>
                                                    <td className="py-1.5 px-1 text-center">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditModalItem(item); }}
                                                            className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                                                            title="Edit item">
                                                            <PencilSquareIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {/* Expanded review panel — AI suggestion or Expert Hub resolution */}
                                                {isExpanded && !isResolved && (
                                                    <tr className="border-b border-border/50">
                                                        <td colSpan={11} className="p-0">
                                                            <div className="px-4 py-3 bg-muted/20 dark:bg-muted/10 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                {/* AI Suggestion content */}
                                                                {sug && (
                                                                    <div className="space-y-3">
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                                    <LinkIcon className="h-3.5 w-3.5 text-ai" />
                                                                                    <span className="text-[9px] font-bold text-ai dark:text-purple-400">CATALOG SOURCE</span>
                                                                                </div>
                                                                                <div className="font-mono text-[9px] text-muted-foreground leading-relaxed whitespace-pre-wrap bg-card p-2 rounded border border-border">
                                                                                    {sug.catalogContext}
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20">
                                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                                    <AIAgentAvatar />
                                                                                    <span className="text-[9px] font-bold text-brand-700 dark:text-brand-400">AI SUGGESTION</span>
                                                                                </div>
                                                                                <div className="space-y-1.5 text-[10px]">
                                                                                    <div><span className="text-muted-foreground">Option Code:</span> <span className="font-bold font-mono text-brand-700 dark:text-brand-400">{sug.suggestedCode}</span></div>
                                                                                    <div><span className="text-muted-foreground">Description:</span> <span className="font-bold text-foreground">{sug.suggestedDescription}</span></div>
                                                                                    <p className="text-[9px] text-muted-foreground italic mt-1">{sug.reasoning}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {editingItem === sug.id ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder={sug.suggestedCode}
                                                                                    className="flex-1 px-2 py-1.5 text-[10px] rounded border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-brand-400" />
                                                                                <button onClick={() => { setReviewResolved(p => ({ ...p, [sug.id]: 'edited' })); setEditingItem(null); }}
                                                                                    className="px-2 py-1.5 rounded bg-brand-400 text-zinc-900 text-[10px] font-bold"><CheckIcon className="h-3 w-3" /></button>
                                                                                <button onClick={() => setEditingItem(null)}
                                                                                    className="px-2 py-1.5 rounded border border-border text-[10px]"><XMarkIcon className="h-3 w-3" /></button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <button onClick={() => setReviewResolved(p => ({ ...p, [sug.id]: 'accepted' }))}
                                                                                    className="px-3 py-1.5 rounded-lg bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[10px] font-bold transition-colors">Accept AI Suggestion</button>
                                                                                <button onClick={() => { setEditingItem(sug.id); setEditValue(''); }}
                                                                                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[10px] font-medium transition-colors flex items-center gap-1">
                                                                                    <PencilSquareIcon className="h-3 w-3" /> Edit
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {/* Expert Hub content */}
                                                                {er && (
                                                                    <div className="space-y-3">
                                                                        <p className="text-[10px] text-amber-600 dark:text-amber-400">Current: <span className="font-bold">{er.currentOption}</span></p>
                                                                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">MC</div>
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-foreground">{er.expertName}</p>
                                                                                    <p className="text-[9px] text-muted-foreground">{er.expertRole}</p>
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-[10px] text-blue-800 dark:text-blue-200 mb-2">{er.recommendation}</p>
                                                                            <div className="flex items-center gap-3 text-[10px] p-2 rounded bg-card border border-border">
                                                                                <div><span className="text-muted-foreground">Resolved Code:</span> <span className="font-bold font-mono text-blue-600 dark:text-blue-400">{er.resolvedCode}</span></div>
                                                                                <div><span className="text-muted-foreground">→</span> <span className="font-bold text-foreground">{er.resolvedDescription}</span></div>
                                                                            </div>
                                                                        </div>
                                                                        {editingItem === er.id ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder={er.resolvedCode}
                                                                                    className="flex-1 px-2 py-1.5 text-[10px] rounded border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                                                                <button onClick={() => { setReviewResolved(p => ({ ...p, [er.id]: 'edited' })); setEditingItem(null); }}
                                                                                    className="px-2 py-1.5 rounded bg-blue-500 text-white text-[10px] font-bold"><CheckIcon className="h-3 w-3" /></button>
                                                                                <button onClick={() => setEditingItem(null)}
                                                                                    className="px-2 py-1.5 rounded border border-border text-[10px]"><XMarkIcon className="h-3 w-3" /></button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <button onClick={() => setReviewResolved(p => ({ ...p, [er.id]: 'accepted' }))}
                                                                                    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold transition-colors">Accept Expert Recommendation</button>
                                                                                <button onClick={() => { setEditingItem(er.id); setEditValue(''); }}
                                                                                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[10px] font-medium transition-colors flex items-center gap-1">
                                                                                    <PencilSquareIcon className="h-3 w-3" /> Edit & Override
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Footer with resolution summary */}
                        <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-brand-400" />
                                    <span className="text-[10px] text-muted-foreground">{AI_SUGGESTED_ITEMS.length} AI Suggested</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[10px] text-muted-foreground">{EXPERT_HUB_ITEMS.length} Expert Hub</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-foreground">{reviewResolvedCount}/{NEEDS_REVIEW_ITEMS.length} Resolved</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <button onClick={() => nextStep()} disabled={!allReviewsResolved}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                            allReviewsResolved ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse' : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}>
                        <ShieldCheckIcon className="h-4 w-4" />
                        {allReviewsResolved ? 'Approve All — Continue to Validation' : `Resolve items (${reviewResolvedCount}/${NEEDS_REVIEW_ITEMS.length})`}
                    </button>
                </div>
            )}

            {/* ── d1.3: Specification Assembly & SC Handoff ── */}
            {stepId === 'd1.3' && (pkgPhase === 'processing' || pkgPhase === 'revealed') && (
                <div className="animate-in fade-in duration-300 space-y-4">
                    {/* Toast notification — fixed floating */}
                    {sendToast && (
                        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[210] animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold shadow-lg shadow-green-500/30 flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4 shrink-0" />
                                {SPEC_ID}.pmx sent to Sales Coordinator Marks (SC) — pricing handoff complete
                            </div>
                        </div>
                    )}

                    {/* Processing — compact loading bar above the table */}
                    {pkgPhase === 'processing' && (
                        <div className="p-3 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-foreground">Assembling PMX specification package...</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-brand-400 transition-all duration-200 ease-linear" style={{ width: `${pkgProgress}%` }} />
                            </div>
                            <div className="mt-1.5 space-y-0.5 text-[10px]">
                                {pkgProgress > 20 && (
                                    <p className="text-muted-foreground animate-in fade-in duration-200">Linking {CATALOG_ITEMS_TOTAL} items to vendor quote sources...</p>
                                )}
                                {pkgProgress > 50 && (
                                    <p className="text-muted-foreground animate-in fade-in duration-200">Embedding Expert Hub resolutions and AI suggestions...</p>
                                )}
                                {pkgProgress > 80 && (
                                    <p className="text-ai dark:text-purple-400 animate-in fade-in duration-200 font-medium">{SPEC_ID}.pmx — package ready</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Revealed — spec summary banner */}
                    {pkgPhase === 'revealed' && (
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-ai/5 border border-purple-200 dark:border-purple-500/20 animate-in fade-in duration-500">
                            <div className="flex items-center gap-3">
                                <DocumentTextIcon className="h-5 w-5 text-ai shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-purple-800 dark:text-purple-200">
                                        PMX Specification — {SPEC_ID}.pmx
                                    </p>
                                    <p className="text-[10px] text-purple-700 dark:text-purple-300 mt-0.5">
                                        Mercy Health Phase 2 — {CATALOG_ITEMS_TOTAL} items with full source traceability
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <SourceBadge label="SPEC VERIFIED" color="green" />
                                    <SourceBadge label="SOURCE LINKED" color="purple" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table — always visible during processing and revealed */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        {/* Header + Accumulated filter chips */}
                        <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-bold text-foreground">Vendor Quote — {MANUFACTURER}</span>
                                    <span className="text-[8px] font-mono text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 flex items-center gap-1">
                                        <DocumentTextIcon className="h-2.5 w-2.5" /> Healthcare Office
                                    </span>
                                </div>
                                <span className="text-[9px] text-muted-foreground">
                                    {pkgPhase === 'revealed' ? `${SPEC_ID}.pmx` : `${CATALOG_ITEMS_TOTAL} items`}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {/* Previous tabs from d1.1/d1.2 — dimmed badges */}
                                {([
                                    { label: 'All', count: ALL_CATALOG_ITEMS.length },
                                    { label: 'Mapped', count: MAPPED_ITEMS_COUNT },
                                    { label: 'Reviewed', count: NEEDS_REVIEW_ITEMS.length },
                                ]).map(f => (
                                    <span key={f.label}
                                        className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-muted text-muted-foreground border border-border opacity-40"
                                    >
                                        {f.label} ({f.count})
                                    </span>
                                ))}
                                {/* Separator */}
                                <span className="text-muted-foreground/40 text-[9px]">|</span>
                                {/* Active tab */}
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                                    pkgPhase === 'processing'
                                        ? 'bg-muted text-muted-foreground border border-border opacity-60'
                                        : 'bg-ai text-white'
                                }`}>
                                    Source Traceability ({CATALOG_ITEMS_TOTAL})
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="text-muted-foreground border-b border-border bg-muted/30">
                                        <th className="w-6 py-1.5 px-1" />
                                        <th className="text-left py-1.5 px-2 font-medium">Source Co</th>
                                        <th className="text-right py-1.5 px-2 font-medium">Qty</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Part Number</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Part Description</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Option Code</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Option Desc</th>
                                        <th className="text-left py-1.5 px-1 font-medium">Tag</th>
                                        <th className="text-right py-1.5 px-2 font-medium">Unit $</th>
                                        <th className="text-center py-1.5 px-2 font-medium">Source</th>
                                        <th className="w-8 py-1.5 px-1" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {pkgPagedItems.map(item => {
                                        const isRealItem = item.line <= 7;
                                        const isExpanded = pkgPhase === 'revealed' && expandedCatalogItem === item.line;
                                        const sourceExcerpt = isRealItem ? SOURCE_EXCERPTS[item.line] : null;

                                        return (
                                            <React.Fragment key={`pkg-${item.line}`}>
                                                <tr
                                                    onClick={() => {
                                                        if (pkgPhase === 'processing') return;
                                                        setExpandedCatalogItem(isExpanded ? null : item.line);
                                                    }}
                                                    className={`border-b border-border/50 transition-colors ${
                                                        pkgPhase === 'processing'
                                                            ? 'opacity-60 cursor-default'
                                                            : 'cursor-pointer hover:bg-muted/30'
                                                    }`}
                                                >
                                                    <td className="py-1.5 px-1 text-center">
                                                        {pkgPhase === 'processing'
                                                            ? <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />
                                                            : isExpanded
                                                                ? <ChevronUpIcon className="h-3 w-3 text-muted-foreground" />
                                                                : <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />}
                                                    </td>
                                                    <td className="py-1.5 px-2 font-mono text-foreground">{item.sourceCo}</td>
                                                    <td className="py-1.5 px-2 text-right text-foreground">{item.qty}</td>
                                                    <td className="py-1.5 px-2 font-mono font-bold text-foreground">{item.partNumber}</td>
                                                    <td className="py-1.5 px-2 text-foreground max-w-[140px] truncate">{item.partDescription}</td>
                                                    <td className="py-1.5 px-2 font-mono text-foreground text-[9px] max-w-[100px] truncate">{item.optionCode ?? <span className="text-muted-foreground">—</span>}</td>
                                                    <td className="py-1.5 px-2 text-[9px] max-w-[120px] truncate text-foreground">{item.optionDescription}</td>
                                                    <td className="py-1.5 px-1 text-muted-foreground font-mono text-[9px]">{item.tag}</td>
                                                    <td className="py-1.5 px-2 text-right font-medium text-foreground">${item.unitPrice.toLocaleString()}</td>
                                                    <td className="py-1.5 px-2 text-center">
                                                        <span className="flex items-center justify-center gap-1 flex-wrap">
                                                            <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">VENDOR PDF</span>
                                                            {isRealItem && item.status === 'ai-suggested' && (
                                                                <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">AI</span>
                                                            )}
                                                            {isRealItem && item.status === 'expert-hub' && (
                                                                <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">EXPERT HUB</span>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="py-1.5 px-1 text-center">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditModalItem(item); }}
                                                            className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                                                            title="Edit item">
                                                            <PencilSquareIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {/* Expanded panel — source traceability detail */}
                                                {isExpanded && (
                                                    <tr className="border-b border-border/50">
                                                        <td colSpan={11} className="p-0">
                                                            <div className="px-4 py-3 bg-muted/20 dark:bg-muted/10 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {/* Left: SPEC Pricing Grid */}
                                                                    <div className="space-y-2">
                                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">SPEC Pricing Detail</span>
                                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] p-2.5 rounded-lg bg-card border border-border">
                                                                            <div className="text-muted-foreground">Unit Price Ext <span className="font-mono font-bold text-foreground">${item.unitPriceExt.toLocaleString()}</span></div>
                                                                            <div className="text-muted-foreground">% Customer <span className="font-mono text-foreground">{item.pctCustomer.toFixed(5)}</span></div>
                                                                            <div className="text-muted-foreground">Unit Customer <span className="font-mono text-foreground">${item.unitCustomer.toLocaleString()}</span></div>
                                                                            <div className="text-muted-foreground">Extended Cust <span className="font-mono text-foreground">${item.extendedCust.toLocaleString()}</span></div>
                                                                            <div className="text-muted-foreground">Unit Dealer <span className="font-mono text-foreground">{item.unitDealer.toFixed(2)}</span></div>
                                                                            <div className="text-muted-foreground">% Dealer <span className="font-mono text-foreground">{item.pctDealer.toFixed(5)}</span></div>
                                                                            <div className="text-muted-foreground">Extended Dealer <span className="font-mono text-foreground">{item.extendedDealer.toFixed(2)}</span></div>
                                                                            <div className="text-muted-foreground">Margin $ <span className="font-mono font-bold text-foreground">${item.marginDollar.toLocaleString()}</span></div>
                                                                            <div className="col-span-2 text-muted-foreground">% Margin <span className="font-mono font-bold text-green-600 dark:text-green-400">{item.pctMargin.toFixed(5)}</span></div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Right: Source Chain */}
                                                                    <div className="space-y-2">
                                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Source Chain — {MANUFACTURER}</span>
                                                                        {sourceExcerpt ? (
                                                                            <pre className="text-[9px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono p-2.5 rounded-lg bg-card border border-border">{sourceExcerpt}</pre>
                                                                        ) : (
                                                                            <div className="p-2.5 rounded-lg bg-card border border-border text-[10px] text-muted-foreground">
                                                                                Auto-mapped from vendor quote
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-1.5 mt-1">
                                                                            <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">VENDOR PDF</span>
                                                                            {isRealItem && item.status === 'ai-suggested' && (
                                                                                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">AI SUGGESTED</span>
                                                                            )}
                                                                            {isRealItem && item.status === 'expert-hub' && (
                                                                                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">EXPERT HUB</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Footer with pagination */}
                        <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] text-muted-foreground">{MAPPED_ITEMS_COUNT} Auto-Mapped</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-brand-400" />
                                    <span className="text-[10px] text-muted-foreground">{AI_SUGGESTED_ITEMS.length} AI Suggested</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[10px] text-muted-foreground">{EXPERT_HUB_ITEMS.length} Expert Hub</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-foreground">Total: ${PROJECT_TOTAL.toLocaleString()}</span>
                                {pkgTotalPages > 1 && (
                                    <div className="flex items-center gap-2 border-l border-border pl-3">
                                        <button
                                            onClick={() => { setPkgPage(p => Math.max(0, p - 1)); setExpandedCatalogItem(null); }}
                                            disabled={pkgPage === 0}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeftIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            Page {pkgPage + 1} of {pkgTotalPages}
                                        </span>
                                        <button
                                            onClick={() => { setPkgPage(p => Math.min(pkgTotalPages - 1, p + 1)); setExpandedCatalogItem(null); }}
                                            disabled={pkgPage >= pkgTotalPages - 1}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Revealed — Send PMX + Sync */}
                    {pkgPhase === 'revealed' && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            {/* Compact spec summary */}
                            <div className="rounded-xl border border-border overflow-hidden bg-card">
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { n: MAPPED_ITEMS_COUNT, label: 'Auto-Mapped', color: 'text-green-600 dark:text-green-400' },
                                            { n: AI_SUGGESTED_ITEMS.length, label: 'AI Suggested', color: 'text-brand-600 dark:text-brand-400' },
                                            { n: EXPERT_HUB_ITEMS.length, label: 'Expert Resolved', color: 'text-blue-600 dark:text-blue-400' },
                                            { n: `$${UPCHARGE_TOTAL.toLocaleString()}`, label: 'Upcharges', color: 'text-amber-600 dark:text-amber-400' },
                                        ].map(s => (
                                            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border">
                                                <div className={`text-base font-bold ${s.color}`}>{s.n}</div>
                                                <div className="text-[9px] text-muted-foreground">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-[10px] pt-2 border-t border-border">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Spec ID:</span><span className="font-mono font-bold text-foreground">{SPEC_ID}.pmx</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Designer:</span><span className="text-foreground">Designer Alden</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Manufacturer:</span><span className="text-foreground">{MANUFACTURER}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Project:</span><span className="text-foreground">Mercy Health Phase 2</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Items:</span><span className="font-bold text-foreground">{CATALOG_ITEMS_TOTAL}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Total:</span><span className="font-bold text-foreground">${PROJECT_TOTAL.toLocaleString()}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA: Send PMX to SC */}
                            {!specSent && (
                                <div className="relative">
                                    <button onClick={() => setShowSendPopover(!showSendPopover)}
                                        className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                                        <PaperAirplaneIcon className="h-4 w-4" />
                                        Send PMX to Sales Coordinator
                                    </button>
                                    {showSendPopover && (
                                        <div className="absolute bottom-full mb-2 right-0 w-72 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                            <div className="px-4 py-2.5 border-b border-border bg-muted/50">
                                                <p className="text-xs font-bold text-foreground">Send PMX Specification to...</p>
                                                <p className="text-[9px] text-muted-foreground">Select team member for pricing handoff</p>
                                            </div>
                                            <div className="p-2 space-y-0.5">
                                                {[
                                                    { name: 'Sales Coordinator Marks', role: 'Sales Coordinator', initials: 'RM', isSC: true },
                                                    { name: 'James Mitchell', role: 'Account Executive', initials: 'JM', isSC: false },
                                                    { name: 'Mike Torres', role: 'Operations Lead', initials: 'MT', isSC: false },
                                                ].map(user => (
                                                    <button key={user.name}
                                                        onClick={() => {
                                                            if (user.isSC) {
                                                                setShowSendPopover(false);
                                                                setSpecSent(true);
                                                                setSendToast(true);
                                                                setTimeout(pauseAware(() => setSendToast(false)), 3000);
                                                                setTimeout(pauseAware(() => setCatalogSyncPhase('syncing')), 2000);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                            user.isSC ? 'hover:bg-brand-100 dark:hover:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5' : 'hover:bg-muted/50'
                                                        }`}>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                            user.isSC ? 'bg-brand-300 text-zinc-900' : 'bg-muted text-muted-foreground'
                                                        }`}>{user.initials}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-foreground">{user.name}</p>
                                                            <p className="text-[9px] text-muted-foreground">{user.role}</p>
                                                        </div>
                                                        {user.isSC && <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-300 text-zinc-900 font-bold shrink-0">SC</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Catalog Sync Animation — post-send */}
                            {specSent && catalogSyncPhase === 'syncing' && (
                                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 via-brand-50 to-blue-50 dark:from-purple-500/10 dark:via-brand-500/5 dark:to-blue-500/10 border-2 border-purple-300 dark:border-purple-500/40 shadow-lg shadow-purple-200/30 dark:shadow-purple-500/10 animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-ai/20">
                                                <ArrowPathIcon className="h-5 w-5 text-ai dark:text-purple-400 animate-spin" />
                                            </div>
                                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-ai rounded-full animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Synchronizing Catalog Data</p>
                                            <p className="text-[10px] text-muted-foreground">Updating project catalog with non-CET manufacturer data</p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="space-y-2">
                                        <div className="h-2.5 rounded-full bg-purple-100 dark:bg-ai/20 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-brand-400 to-purple-500 transition-all duration-300 ease-out"
                                                style={{ width: `${catalogSyncProgress}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-medium text-ai dark:text-purple-400">
                                                {catalogSyncProgress < 30 && `Importing ${MANUFACTURER} product catalog...`}
                                                {catalogSyncProgress >= 30 && catalogSyncProgress < 60 && `Mapping ${CATALOG_ITEMS_TOTAL} items to CET format...`}
                                                {catalogSyncProgress >= 60 && catalogSyncProgress < 85 && 'Binding pricing, options & source traceability...'}
                                                {catalogSyncProgress >= 85 && 'Finalizing catalog synchronization...'}
                                            </p>
                                            <span className="text-[10px] font-bold text-ai dark:text-purple-400">{catalogSyncProgress}%</span>
                                        </div>
                                    </div>

                                    {/* Sync details */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${catalogSyncProgress >= 20 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                            <p className="text-[9px] text-muted-foreground">Products</p>
                                            <p className="text-xs font-bold text-foreground">{catalogSyncProgress >= 20 ? `${CATALOG_ITEMS_TOTAL} synced` : 'Pending...'}</p>
                                        </div>
                                        <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${catalogSyncProgress >= 50 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                            <p className="text-[9px] text-muted-foreground">PMX Records</p>
                                            <p className="text-xs font-bold text-foreground">{catalogSyncProgress >= 50 ? `${CATALOG_ITEMS_TOTAL} assembled` : 'Pending...'}</p>
                                        </div>
                                        <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${catalogSyncProgress >= 70 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                            <p className="text-[9px] text-muted-foreground">Pricing</p>
                                            <p className="text-xs font-bold text-foreground">{catalogSyncProgress >= 70 ? 'Verified' : 'Pending...'}</p>
                                        </div>
                                        <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${catalogSyncProgress >= 90 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                            <p className="text-[9px] text-muted-foreground">Traceability</p>
                                            <p className="text-xs font-bold text-foreground">{catalogSyncProgress >= 90 ? 'Complete' : 'Pending...'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sync Complete — success + SC pending */}
                            {specSent && catalogSyncPhase === 'done' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                                    {/* Success banner */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-2 border-green-400 dark:border-green-500/40 shadow-lg shadow-green-200/30 dark:shadow-green-500/10 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/20 shrink-0">
                                                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-green-800 dark:text-green-300">Catalog Synchronized Successfully</p>
                                                <p className="text-[11px] text-muted-foreground mt-1">
                                                    <span className="font-semibold text-foreground">{MANUFACTURER}</span> product data has been added to the project catalog.
                                                    All {CATALOG_ITEMS_TOTAL} items are now available in CET with verified options and full source traceability.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 ml-12">
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-500/20 text-green-800 dark:text-green-300 font-bold">CATALOG SYNCED</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 font-bold">PMX SENT</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold">GAP RESOLVED</span>
                                        </div>
                                    </div>

                                    {/* SC Review pending */}
                                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-300 dark:border-amber-500/30 flex items-center gap-3 animate-in fade-in duration-300" style={{ animationDelay: '400ms' }}>
                                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 shrink-0">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Pending SC Review</p>
                                            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70">
                                                Sales Coordinator Marks (SC) will validate upcharges, apply discounts, and generate priced SIF.
                                            </p>
                                        </div>
                                        <ArrowRightIcon className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 animate-pulse" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Edit Item Modal */}
            {editModalItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setEditModalItem(null)}>
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-border bg-muted/50 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-500/10">
                                <PencilSquareIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Edit Item — Line {editModalItem.line}</p>
                                <p className="text-[10px] text-muted-foreground">{editModalItem.partNumber} · {editModalItem.partDescription}</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { label: 'Part Number', value: editModalItem.partNumber, mono: true },
                                    { label: 'Source Co', value: editModalItem.sourceCo, mono: true },
                                    { label: 'Part Description', value: editModalItem.partDescription, mono: false },
                                    { label: 'Tag', value: editModalItem.tag, mono: true },
                                    { label: 'Option Code', value: editModalItem.optionCode ?? '—', mono: true },
                                    { label: 'Qty', value: String(editModalItem.qty), mono: true },
                                    { label: 'Option Description', value: editModalItem.optionDescription, mono: false },
                                    { label: 'Unit Price', value: `$${editModalItem.unitPrice.toLocaleString()}`, mono: true },
                                ] as { label: string; value: string; mono: boolean }[]).map(field => (
                                    <div key={field.label} className={field.label === 'Part Description' || field.label === 'Option Description' ? 'col-span-2' : ''}>
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1 block">{field.label}</label>
                                        <input
                                            type="text"
                                            defaultValue={field.value}
                                            className={`w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 transition-colors ${field.mono ? 'font-mono' : ''}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            {editModalItem.optionBreakdown && editModalItem.optionBreakdown.length > 0 && (
                                <div>
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Option Breakdown</label>
                                    <div className="space-y-1.5">
                                        {editModalItem.optionBreakdown.map((ob, oi) => (
                                            <div key={oi} className="flex items-center gap-2">
                                                <input type="text" defaultValue={ob.code}
                                                    className="w-20 px-2 py-1.5 rounded-lg bg-muted/30 border border-border text-[10px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                                                <span className="text-muted-foreground text-[10px]">→</span>
                                                <input type="text" defaultValue={ob.description}
                                                    className="flex-1 px-2 py-1.5 rounded-lg bg-muted/30 border border-border text-[10px] text-foreground focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center gap-2">
                            <button onClick={() => setEditModalItem(null)}
                                className="flex-1 py-2 rounded-lg bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[11px] font-bold transition-colors">
                                Save Changes
                            </button>
                            <button onClick={() => setEditModalItem(null)}
                                className="px-4 py-2 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[11px] font-medium transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DuplerScReview — d1.4: SC Price Validation, d1.5: Priced SIF Generation (Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════


export function DuplerScReview({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { currentStep, nextStep, isPaused } = useDemo();
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => { if (!isPausedRef.current) { clearInterval(poll); fn(); } }, 200);
        };
    }, []);

    const [phase, setPhase] = useState<ScReviewPhase>('idle');
    const [discountsApplied, setDiscountsApplied] = useState<Record<string, 'ai' | 'adjusted' | 'escalated' | 'manager-approved'>>({});
    const [genProgress, setGenProgress] = useState(0);
    const [exported, setExported] = useState(false);
    const [viewSourceLine, setViewSourceLine] = useState<number | null>(null);
    const [adjustingTier, setAdjustingTier] = useState<string | null>(null);
    const [adjustedRates, setAdjustedRates] = useState<Record<string, number>>({});
    const [discountNotes, setDiscountNotes] = useState<Record<string, string>>({});
    const [showApprovalPopover, setShowApprovalPopover] = useState<string | null>(null);
    const [approvalNote, setApprovalNote] = useState('');
    const [approvalPriority, setApprovalPriority] = useState<'normal' | 'urgent'>('normal');
    const [scPage, setScPage] = useState(0);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);
    const [downloadToast, setDownloadToast] = useState(false);
    const [showSifPreview, setShowSifPreview] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [archived, setArchived] = useState(false);
    const [scSifPhase, setScSifPhase] = useState<'idle' | 'converting' | 'ready'>('idle');
    const [scSifProgress, setScSifProgress] = useState(0);
    const [scSendToast, setScSendToast] = useState(false);
    const [showApproveSendPopover, setShowApproveSendPopover] = useState(false);
    const [approveSendRecipients, setApproveSendRecipients] = useState<string[]>(['designer', 'client']);
    const [specApproved, setSpecApproved] = useState(false);
    const [scSyncPhase, setScSyncPhase] = useState<'idle' | 'syncing' | 'done'>('idle');
    const [scSyncProgress, setScSyncProgress] = useState(0);
    const [upchargesAcked, setUpchargesAcked] = useState<Record<number, boolean>>({});

    const allUpchargesAcked = Object.keys(upchargesAcked).length >= UPCHARGE_ITEMS.length;
    const allDiscountsApplied = Object.keys(discountsApplied).length >= DISCOUNT_TIERS.length &&
        !Object.values(discountsApplied).includes('escalated');
    const scTotalPages = Math.ceil(ALL_SC_ITEMS.length / ITEMS_PER_PAGE);
    const scPagedItems = ALL_SC_ITEMS.slice(scPage * ITEMS_PER_PAGE, (scPage + 1) * ITEMS_PER_PAGE);

    useEffect(() => {
        if (currentStep.id === 'd1.4') {
            setPhase('idle');
            setDiscountsApplied({});
            setUpchargesAcked({});
            setGenProgress(0);
            setAdjustingTier(null);
            setAdjustedRates({});
            setDiscountNotes({});
            setShowApprovalPopover(null);
            setApprovalNote('');
            setApprovalPriority('normal');
            setScPage(0);
            setViewSourceLine(null);
            const t = setTimeout(pauseAware(() => setPhase('notification')), 1500);
            return () => clearTimeout(t);
        }
        if (currentStep.id === 'd1.5') {
            setScSifPhase('idle');
            setScSifProgress(0);
            setScSyncPhase('idle');
            setScSyncProgress(0);
            setScSendToast(false);
            setShowApproveSendPopover(false);
            setApproveSendRecipients(['designer', 'client']);
            setSpecApproved(false);
        }
    }, [currentStep.id]);

    // Manager auto-approval effect (simulates async approval after 2.5s)
    useEffect(() => {
        const escalatedTiers = Object.entries(discountsApplied)
            .filter(([, v]) => v === 'escalated')
            .map(([k]) => k);
        if (escalatedTiers.length === 0) return;
        const timers = escalatedTiers.map(tierId =>
            setTimeout(pauseAware(() => {
                setDiscountsApplied(p => ({ ...p, [tierId]: 'manager-approved' }));
            }), 2500)
        );
        return () => timers.forEach(clearTimeout);
    }, [discountsApplied]);

    // Generating phase
    useEffect(() => {
        if (phase !== 'generating') return;
        setGenProgress(0);
        const duration = 3000;
        const steps = 30;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(pauseAware(() => setGenProgress(Math.min(100, Math.round((i / steps) * 100)))), (duration / steps) * i));
        }
        timers.push(setTimeout(pauseAware(() => setPhase('revealed')), duration + 800));
        return () => timers.forEach(clearTimeout);
    }, [phase]);

    // SIF conversion effect (d1.5 — priced spec → SIF)
    useEffect(() => {
        if (scSifPhase !== 'converting') return;
        setScSifProgress(0);
        const duration = 1500;
        const steps = 15;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(
                pauseAware(() => setScSifProgress(Math.min(100, Math.round((i / steps) * 100)))),
                (duration / steps) * i
            ));
        }
        timers.push(setTimeout(pauseAware(() => setScSifPhase('ready')), duration + 400));
        return () => timers.forEach(clearTimeout);
    }, [scSifPhase]);

    // SC sync effect (d1.5 — sync before approve/send)
    useEffect(() => {
        if (scSyncPhase !== 'syncing') return;
        setScSyncProgress(0);
        const duration = 2000;
        const steps = 18;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(
                pauseAware(() => setScSyncProgress(Math.min(100, Math.round((i / steps) * 100)))),
                (duration / steps) * i
            ));
        }
        timers.push(setTimeout(pauseAware(() => setScSyncPhase('done')), duration + 400));
        return () => timers.forEach(clearTimeout);
    }, [scSyncPhase]);

    if (currentStep.id !== 'd1.4' && currentStep.id !== 'd1.5') return null;

    const isD14 = currentStep.id === 'd1.4';
    const isD15 = currentStep.id === 'd1.5';

    const getEffectiveRate = (dt: typeof DISCOUNT_TIERS[0]) => adjustedRates[dt.id] ?? dt.rate;
    const discountedTotal = DISCOUNT_TIERS.reduce((sum, dt) => sum + dt.listTotal * (1 - getEffectiveRate(dt) / 100), 0);

    const sourceBadge = (source: 'auto' | 'ai-suggested' | 'expert-hub') => {
        if (source === 'auto') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">MFR CATALOG</span>;
        if (source === 'ai-suggested') return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">AI SUGGESTED</span>;
        return <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">EXPERT HUB</span>;
    };

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {/* d1.4: Notification — PMX received from Designer */}
            {isD14 && phase === 'notification' && (
                <button onClick={() => setPhase('sc-review')} className="w-full text-left group">
                    <div className="p-5 bg-brand-50 dark:bg-brand-500/10 border-l-4 border-brand-400 ring-1 ring-brand-200 dark:ring-brand-500/20 rounded-r-xl">
                        <div className="flex items-start gap-3">
                            {/* Sender avatar */}
                            <div className="relative shrink-0">
                                <img src={DESIGNER_PHOTO} alt="Designer Alden" className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-300 dark:ring-brand-500/40" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center ring-2 ring-background">
                                    <PaperAirplaneIcon className="h-2.5 w-2.5 text-zinc-900" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">PMX Specification Ready for Pricing</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold animate-pulse">Just now</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="font-bold text-foreground">Designer Alden</span> (Designer) sent {SPEC_ID}.pmx — {CATALOG_ITEMS_TOTAL} items, ${PROJECT_TOTAL.toLocaleString()}. Vendor-verified, source-linked.
                                </p>

                                <div className="flex items-center gap-2 flex-wrap mt-3 mb-2">
                                    <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 flex items-center gap-1 ring-2 ring-green-300 dark:ring-green-500/30 shadow-sm shadow-green-200 dark:shadow-green-500/10">
                                        <CheckCircleIcon className="h-3 w-3" /> VALIDATED SPEC
                                    </span>
                                    <span className="text-muted-foreground text-[10px]">→</span>
                                    <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
                                        <ShieldCheckIcon className="h-3 w-3" /> STRATA PRICING
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold border border-green-200 dark:border-green-500/20">DESIGNER VALIDATED</span>
                                </div>

                                <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1 group-hover:underline">Click to review <ArrowRightIcon className="h-3 w-3" /></p>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* d1.4: SC Review — upcharges + discounts */}
            {isD14 && phase === 'sc-review' && (
                <div className="animate-in fade-in duration-500">
                    <div className="p-4 bg-purple-50 dark:bg-ai/5 border-b border-purple-200 dark:border-purple-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={DESIGNER_PHOTO} alt="Designer Alden" className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-300 dark:ring-purple-500/40" />
                            <div>
                                <span className="text-xs font-bold text-purple-800 dark:text-purple-200">{SPEC_ID}.pmx — awaiting pricing</span>
                                <p className="text-[10px] text-ai dark:text-purple-400">From <span className="font-bold">Designer Alden</span> (Designer) · {CATALOG_ITEMS_TOTAL} items · ${PROJECT_TOTAL.toLocaleString()}</p>
                            </div>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-200 dark:bg-ai/20 text-purple-700 dark:text-purple-400 font-bold">PMX</span>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Visual Connection Bar */}
                        <div className="flex flex-col gap-3 p-3 rounded-xl bg-card border border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 flex items-center gap-1 ring-2 ring-green-300 dark:ring-green-500/30 shadow-sm shadow-green-200 dark:shadow-green-500/10">
                                    <CheckCircleIcon className="h-3 w-3" /> VALIDATED SPEC
                                </span>
                                <span className="text-muted-foreground text-[10px]">→</span>
                                <span className="text-[8px] font-bold px-2 py-1 rounded-md bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
                                    <ShieldCheckIcon className="h-3 w-3" /> STRATA PRICING
                                </span>
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 font-semibold">SC PRICING</span>
                            </div>
                        </div>

                        {/* Spec metadata — aligned with d1.4 summary style */}
                        <div className="rounded-xl border border-border overflow-hidden bg-card">
                            <div className="px-4 py-2.5 border-b border-border bg-muted/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="h-4 w-4 text-ai" />
                                    <span className="text-xs font-bold text-foreground">{SPEC_ID}.pmx</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">VALIDATED</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">Received from Designer Alden (Designer)</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { n: MAPPED_ITEMS_COUNT, label: 'Auto-Mapped', color: 'text-green-600 dark:text-green-400' },
                                        { n: AI_SUGGESTED_ITEMS.length, label: 'AI Suggested', color: 'text-brand-600 dark:text-brand-400' },
                                        { n: EXPERT_HUB_ITEMS.length, label: 'Expert Resolved', color: 'text-blue-600 dark:text-blue-400' },
                                        { n: `$${UPCHARGE_TOTAL.toLocaleString()}`, label: 'Upcharges', color: 'text-amber-600 dark:text-amber-400' },
                                    ].map(s => (
                                        <div key={s.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border">
                                            <div className={`text-base font-bold ${s.color}`}>{s.n}</div>
                                            <div className="text-[9px] text-muted-foreground">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-[10px] pt-2 border-t border-border">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Spec ID:</span><span className="font-mono font-bold text-foreground">{SPEC_ID}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Project:</span><span className="text-foreground">Mercy Health Phase 2</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">List Total:</span><span className="font-bold text-foreground">${PROJECT_TOTAL.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Items:</span><span className="font-bold text-foreground">{CATALOG_ITEMS_TOTAL}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Designer:</span><span className="text-foreground">Designer Alden</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Manufacturer:</span><span className="text-foreground">{MANUFACTURER}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Items table with source badges + pagination */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                <span className="text-[10px] font-bold text-foreground">PMX Line Items — {CATALOG_ITEMS_TOTAL} total <span className="font-normal text-muted-foreground">({TOTAL_ITEMS} reviewed, {CATALOG_ITEMS_TOTAL - TOTAL_ITEMS} auto-mapped)</span></span>
                                <div className="flex gap-1.5">
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">MFR CATALOG</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">AI SUGGESTED</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">EXPERT HUB</span>
                                </div>
                            </div>
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="text-muted-foreground border-b border-border bg-muted/30">
                                        <th className="text-left py-1.5 px-3 font-medium">#</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Product</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Part #</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Options</th>
                                        <th className="text-right py-1.5 px-2 font-medium">Qty</th>
                                        <th className="text-right py-1.5 px-2 font-medium">List $</th>
                                        <th className="text-center py-1.5 px-2 font-medium">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scPagedItems.map(item => (
                                        <tr key={item.line} className={`border-b border-border/50 ${item.flagged ? 'bg-blue-50/30 dark:bg-blue-500/[0.03]' : ''}`}>
                                            <td className="py-1.5 px-3 text-muted-foreground">{item.line}</td>
                                            <td className="py-1.5 px-2 text-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    {item.product}
                                                    {item.flagged && (
                                                        <span className="group relative">
                                                            <CheckCircleIcon className="h-3 w-3 text-green-500 shrink-0" />
                                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-medium z-20 shadow-lg max-w-xs">
                                                                {item.flagNote || 'Expert confirmed'}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {item.flagged && (
                                                        <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 shrink-0">EXPERT CONFIRMED</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-2 font-mono text-foreground text-[9px]">{item.partNumber}</td>
                                            <td className="py-1.5 px-2 text-foreground text-[9px] max-w-[140px] truncate" title={item.optionDesc}>{item.optionDesc}</td>
                                            <td className="py-1.5 px-2 text-right text-foreground">{item.qty}</td>
                                            <td className="py-1.5 px-2 text-right font-medium text-foreground">${item.listPrice.toLocaleString()}</td>
                                            <td className="py-1.5 px-2 text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    {sourceBadge(item.source)}
                                                    {(item.source === 'ai-suggested' || item.source === 'expert-hub') && SOURCE_EXCERPTS[item.line] && (
                                                        <button onClick={() => setViewSourceLine(item.line)} className="text-[8px] font-bold px-1 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors" title="View catalog source">
                                                            <MagnifyingGlassIcon className="h-2.5 w-2.5 inline" />
                                                        </button>
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination footer */}
                            <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-foreground">Total: ${PROJECT_TOTAL.toLocaleString()}</span>
                                {scTotalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setScPage(p => Math.max(0, p - 1))}
                                            disabled={scPage === 0}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeftIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            Page {scPage + 1} of {scTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setScPage(p => Math.min(scTotalPages - 1, p + 1))}
                                            disabled={scPage >= scTotalPages - 1}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcharge Detection — SC reviews cost adjustments */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-foreground">UpchargeDetector — Cost Adjustments Found</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">${UPCHARGE_TOTAL.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2">
                                {UPCHARGE_ITEMS.map(uc => {
                                    const acked = upchargesAcked[uc.itemLine];
                                    return (
                                        <div key={uc.id} className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                            acked ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5'
                                        }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold text-foreground">{uc.product}</span>
                                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">+${uc.total.toLocaleString()}</span>
                                            </div>
                                            <p className="text-[11px] text-foreground mb-1">{uc.finishOrOption}</p>
                                            <p className="text-[10px] text-muted-foreground mb-2">{uc.note}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground">{uc.qty} × ${uc.perUnit} = ${uc.total.toLocaleString()}</span>
                                                {acked ? (
                                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                                        <CheckCircleIcon className="h-3.5 w-3.5" /> Approved
                                                    </span>
                                                ) : (
                                                    <button onClick={() => setUpchargesAcked(p => ({ ...p, [uc.itemLine]: true }))}
                                                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors">
                                                        Approve Upcharge
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {allUpchargesAcked && (
                                <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 flex items-center gap-2">
                                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                                    <span className="text-[10px] font-bold text-green-700 dark:text-green-300">All upcharges reviewed — ${UPCHARGE_TOTAL.toLocaleString()} approved</span>
                                </div>
                            )}
                        </div>

                        {/* AI Discount Advisor Panel */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-foreground">DiscountAdvisor — Suggested Pricing</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">AI ASSISTED</span>
                            </div>
                            <div className="space-y-3">
                                {DISCOUNT_TIERS.map(dt => {
                                    const effectiveRate = getEffectiveRate(dt);
                                    const netTotal = Math.round(dt.listTotal * (1 - effectiveRate / 100));
                                    const isAdjusting = adjustingTier === dt.id;
                                    const applied = discountsApplied[dt.id];

                                    return (
                                    <div key={dt.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                        applied === 'ai' || applied === 'manager-approved' ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' :
                                        applied === 'adjusted' ? 'border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5' :
                                        applied === 'escalated' ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5' :
                                        'border-blue-200 dark:border-blue-500/20 bg-card'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-foreground">{dt.manufacturer}</span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">{dt.discountType}</span>
                                                {applied === 'adjusted' && <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">SC ADJUSTED</span>}
                                                {applied === 'escalated' && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-500/20 animate-pulse">PENDING APPROVAL</span>}
                                                {applied === 'manager-approved' && <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold border border-green-200 dark:border-green-500/20">MGR APPROVED</span>}
                                            </div>
                                            <span className={`text-lg font-bold ${applied === 'adjusted' ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {effectiveRate !== dt.rate ? <><span className="line-through text-muted-foreground text-sm mr-1">{dt.rate}%</span>{effectiveRate}%</> : `${dt.rate}%`}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-foreground mb-1">
                                            {dt.source}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mb-2">
                                            {dt.items} items · List <span className="font-bold text-foreground">${dt.listTotal.toLocaleString()}</span> → Net <span className="font-bold text-foreground">${netTotal.toLocaleString()}</span>
                                        </p>

                                        {/* AI Justification — highlighted */}
                                        {!applied && (
                                            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-3">
                                                <div className="flex items-start gap-2">
                                                    <AIAgentAvatar className="mt-0.5" />
                                                    <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                                                        <span className="font-bold">AI Justification:</span> {dt.aiJustification}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Adjust Rate Panel */}
                                        {isAdjusting && !applied && (
                                            <div className="p-3 mb-3 rounded-lg bg-card border border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-bold text-foreground w-20">Rate:</span>
                                                    <input type="range" min={0} max={60} step={1} value={adjustedRates[dt.id] ?? dt.rate}
                                                        onChange={e => setAdjustedRates(p => ({ ...p, [dt.id]: Number(e.target.value) }))}
                                                        className="flex-1 h-1.5 accent-indigo-500" />
                                                    <div className="flex items-center gap-1">
                                                        <input type="number" min={0} max={60} value={adjustedRates[dt.id] ?? dt.rate}
                                                            onChange={e => setAdjustedRates(p => ({ ...p, [dt.id]: Math.min(60, Math.max(0, Number(e.target.value))) }))}
                                                            className="w-14 px-2 py-1 text-[11px] rounded border border-border bg-card text-foreground text-center font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                                                        <span className="text-[11px] text-muted-foreground font-bold">%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>AI suggested: <span className="font-bold text-blue-600 dark:text-blue-400">{dt.rate}%</span></span>
                                                    <span>Net: <span className="font-bold text-foreground">${netTotal.toLocaleString()}</span> (savings ${Math.round(dt.listTotal * effectiveRate / 100).toLocaleString()})</span>
                                                </div>
                                                <div>
                                                    <input type="text" placeholder="Justification note (optional)..." value={discountNotes[dt.id] || ''}
                                                        onChange={e => setDiscountNotes(p => ({ ...p, [dt.id]: e.target.value }))}
                                                        className="w-full px-2.5 py-1.5 text-[11px] rounded border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { setDiscountsApplied(p => ({ ...p, [dt.id]: effectiveRate !== dt.rate ? 'adjusted' : 'ai' })); setAdjustingTier(null); }}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold transition-colors">
                                                        Apply {effectiveRate}%
                                                    </button>
                                                    <button onClick={() => { setAdjustingTier(null); setAdjustedRates(p => { const n = { ...p }; delete n[dt.id]; return n; }); }}
                                                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[11px] font-medium transition-colors">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!applied ? (
                                            !isAdjusting && (
                                                <div className="relative">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button onClick={() => setDiscountsApplied(p => ({ ...p, [dt.id]: 'ai' }))}
                                                            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-bold transition-colors">
                                                            Apply {dt.rate}% Discount
                                                        </button>
                                                        <button onClick={() => setAdjustingTier(dt.id)}
                                                            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[11px] font-medium transition-colors flex items-center gap-1">
                                                            <PencilSquareIcon className="h-3 w-3" /> Adjust Rate
                                                        </button>
                                                        <button onClick={() => {
                                                                if (showApprovalPopover === dt.id) {
                                                                    setShowApprovalPopover(null);
                                                                    setApprovalNote('');
                                                                } else {
                                                                    setShowApprovalPopover(dt.id);
                                                                    setApprovalNote(`Rate exceeds SC authority threshold. ${dt.discountType} requires Sales Manager sign-off per dealer policy.`);
                                                                }
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors flex items-center gap-1 ${
                                                                showApprovalPopover === dt.id
                                                                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-400/50'
                                                                    : 'border-amber-300 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                            }`}>
                                                            <ExclamationTriangleIcon className="h-3 w-3" /> Request Approval
                                                        </button>
                                                    </div>
                                                    {/* Approval Popover */}
                                                    {showApprovalPopover === dt.id && (
                                                        <div className="mt-3 bg-card border border-amber-200 dark:border-amber-500/30 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                                            <div className="px-4 py-2.5 border-b border-border bg-amber-50/50 dark:bg-amber-500/5">
                                                                <p className="text-xs font-bold text-foreground">Request Discount Approval</p>
                                                                <p className="text-[9px] text-muted-foreground">{dt.discountType} — {dt.rate}% on ${dt.listTotal.toLocaleString()}</p>
                                                            </div>
                                                            <div className="p-3 space-y-3">
                                                                {/* Manager */}
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Send to Manager</p>
                                                                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-300 dark:ring-amber-500/30">
                                                                        <img src={MANAGER_PHOTO} alt="Mike Torres" className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400 shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-bold text-foreground">Mike Torres</p>
                                                                            <p className="text-[9px] text-muted-foreground">Sales Manager — Workspace Solutions</p>
                                                                        </div>
                                                                        <CheckCircleIcon className="h-4 w-4 text-amber-500 shrink-0" />
                                                                    </div>
                                                                </div>
                                                                {/* Priority */}
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Priority</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <button onClick={() => setApprovalPriority('normal')}
                                                                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center transition-colors ${
                                                                                approvalPriority === 'normal' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                                            }`}>Normal</button>
                                                                        <button onClick={() => setApprovalPriority('urgent')}
                                                                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center transition-colors ${
                                                                                approvalPriority === 'urgent' ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                                            }`}>Urgent</button>
                                                                    </div>
                                                                </div>
                                                                {/* Note */}
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Justification Note</p>
                                                                    <textarea
                                                                        value={approvalNote}
                                                                        onChange={e => setApprovalNote(e.target.value)}
                                                                        placeholder="Justification for manager approval..."
                                                                        rows={2}
                                                                        className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="px-3 py-2 border-t border-border bg-muted/30 flex items-center gap-2">
                                                                <button onClick={() => {
                                                                    setShowApprovalPopover(null);
                                                                    setDiscountNotes(p => ({ ...p, [dt.id]: approvalNote }));
                                                                    setApprovalNote('');
                                                                    setApprovalPriority('normal');
                                                                    setDiscountsApplied(p => ({ ...p, [dt.id]: 'escalated' }));
                                                                }}
                                                                    className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                                                    <PaperAirplaneIcon className="h-3 w-3" /> Send Request
                                                                </button>
                                                                <button onClick={() => { setShowApprovalPopover(null); setApprovalNote(''); setApprovalPriority('normal'); }}
                                                                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[11px] font-medium transition-colors">
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ) : applied === 'escalated' ? (
                                            /* Pending approval — amber with pulse */
                                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 animate-in fade-in duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative shrink-0">
                                                        <img src={MANAGER_PHOTO} alt="Mike Torres" className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400" />
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center ring-2 ring-background">
                                                            <ArrowPathIcon className="h-2 w-2 text-white animate-spin" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200">Sent to Mike Torres (Sales Manager)</p>
                                                        <p className="text-[9px] text-amber-600 dark:text-amber-400">Awaiting approval...</p>
                                                    </div>
                                                    {approvalPriority === 'urgent' && (
                                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-500/20">URGENT</span>
                                                    )}
                                                </div>
                                                {discountNotes[dt.id] && (
                                                    <p className="text-[9px] text-amber-600 dark:text-amber-400 italic mt-1.5 pl-11">"{discountNotes[dt.id]}"</p>
                                                )}
                                            </div>
                                        ) : applied === 'manager-approved' ? (
                                            /* Manager approved — green with photo */
                                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 animate-in fade-in duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative shrink-0">
                                                        <img src={MANAGER_PHOTO} alt="Mike Torres" className="w-8 h-8 rounded-full object-cover ring-2 ring-green-400" />
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-background">
                                                            <CheckIcon className="h-2 w-2 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-green-800 dark:text-green-200">Approved by Mike Torres (Sales Manager)</p>
                                                        <p className="text-[9px] text-green-600 dark:text-green-400">Discount {effectiveRate}% authorized · Applied to spec</p>
                                                    </div>
                                                </div>
                                                {discountNotes[dt.id] && (
                                                    <p className="text-[9px] text-green-600 dark:text-green-400 italic mt-1.5 pl-11">"{discountNotes[dt.id]}"</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    <span className="font-bold">
                                                        {applied === 'ai' ? 'AI Discount Applied' :
                                                         `Custom Rate Applied (${effectiveRate}%)`}
                                                    </span>
                                                </div>
                                                {discountNotes[dt.id] && (
                                                    <p className="text-[9px] text-muted-foreground italic pl-6">"{discountNotes[dt.id]}"</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Running total */}
                        {allDiscountsApplied && (
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 animate-in fade-in duration-300 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-green-800 dark:text-green-200">Discounted Total</span>
                                    <span className="text-lg font-bold text-green-700 dark:text-green-300">${Math.round(discountedTotal).toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-green-600 dark:text-green-400">
                                    Savings: ${(PROJECT_TOTAL - Math.round(discountedTotal)).toLocaleString()} ({Math.round((1 - discountedTotal / PROJECT_TOTAL) * 100)}% average discount)
                                </p>
                                {/* Breakdown badges */}
                                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-green-200 dark:border-green-500/20">
                                    {Object.values(discountsApplied).filter(v => v === 'ai').length > 0 && (
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                            {Object.values(discountsApplied).filter(v => v === 'ai').length} AI APPLIED
                                        </span>
                                    )}
                                    {Object.values(discountsApplied).filter(v => v === 'adjusted').length > 0 && (
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                            {Object.values(discountsApplied).filter(v => v === 'adjusted').length} SC ADJUSTED
                                        </span>
                                    )}
                                    {Object.values(discountsApplied).filter(v => v === 'escalated').length > 0 && (
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                            {Object.values(discountsApplied).filter(v => v === 'escalated').length} PENDING APPROVAL
                                        </span>
                                    )}
                                    {Object.values(discountsApplied).filter(v => v === 'manager-approved').length > 0 && (
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                            {Object.values(discountsApplied).filter(v => v === 'manager-approved').length} MGR APPROVED
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CTA — Continue to SIF Generation (d1.5) */}
                        <button onClick={() => { if (allUpchargesAcked && allDiscountsApplied) nextStep(); }} disabled={!allUpchargesAcked || !allDiscountsApplied}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                allUpchargesAcked && allDiscountsApplied ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse' : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}>
                            <ArrowRightIcon className="h-4 w-4" />
                            {allUpchargesAcked && allDiscountsApplied
                                ? 'Continue to SIF Generation'
                                : !allUpchargesAcked
                                    ? `Review upcharges (${Object.keys(upchargesAcked).length}/${UPCHARGE_ITEMS.length})`
                                    : `Apply all discounts (${Object.values(discountsApplied).filter(Boolean).length}/${DISCOUNT_TIERS.length})`
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* d1.5: Priced SIF Generation & Distribution */}
            {isD15 && (
                <div className="p-5 space-y-4 animate-in fade-in duration-500">

                    {/* Priced Specification (removed — pricing shown in d1.4) */}
                    {/* ═══ SIF Conversion Flow ═══ */}

                    {/* Convert to Priced SIF CTA */}
                    {scSifPhase === 'idle' && (
                        <button onClick={() => setScSifPhase('converting')}
                            className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                            <DocumentTextIcon className="h-4 w-4" />
                            Convert to Priced SIF
                        </button>
                    )}

                    {/* Converting animation */}
                    {scSifPhase === 'converting' && (
                        <div className="p-3 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-foreground">Converting priced specification to SIF format...</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-ai transition-all duration-200 ease-linear" style={{ width: `${scSifProgress}%` }} />
                            </div>
                            <div className="mt-1.5 space-y-0.5 text-[10px]">
                                {scSifProgress >= 20 && (
                                    <p className="text-muted-foreground animate-in fade-in duration-200">Applying dealer pricing to {CATALOG_ITEMS_TOTAL} SIF line items...</p>
                                )}
                                {scSifProgress >= 50 && (
                                    <p className="text-muted-foreground animate-in fade-in duration-200">Embedding discount tiers & source traceability...</p>
                                )}
                                {scSifProgress >= 80 && (
                                    <p className="text-ai dark:text-purple-400 animate-in fade-in duration-200 font-medium">{SPEC_ID}_priced.sif — conversion complete</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Priced SIF Preview */}
                    {scSifPhase === 'ready' && (
                        <div className="rounded-xl border border-border overflow-hidden bg-card animate-in fade-in duration-500">
                            <div className="px-4 py-2.5 border-b border-border bg-muted/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="h-4 w-4 text-ai" />
                                    <span className="text-xs font-bold text-foreground">SIF Preview — {SPEC_ID}_priced.sif</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <SourceBadge label="VALIDATED" color="green" />
                                    <SourceBadge label="SC PRICED" color="purple" />
                                </div>
                            </div>
                            <div className="p-4 max-h-[320px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(var(--color-border))_transparent]">
                                <pre className="text-[9px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap p-3 rounded-lg bg-muted border border-border">{`; ═══════════════════════════════════════════════════════════════
; STRATA INTERCHANGE FORMAT (SIF) v2.4 — PRICED
; Generated: ${new Date().toISOString().split('T')[0]}  |  Engine: Strata SC Pricing v3.1
; ═══════════════════════════════════════════════════════════════

[HEADER]
SpecID          = ${SPEC_ID}
Version         = 2.0.0 (Priced)
Status          = SC_PRICED
Manufacturer    = ${MANUFACTURER}
CatalogRegion   = Healthcare Office
CatalogURL      = meridian-workspace.com/catalog/healthcare-office
Project         = Mercy Health Phase 2
ProjectPhase    = Furniture Procurement
Designer        = Designer Alden
DesignerRole    = Interior Designer
Dealer          = Workspace Solutions Inc.
DealerContact   = Sales Coordinator Marks (SC)
PricedBy        = Sales Coordinator Marks (SC)
PricingDate     = ${new Date().toISOString().split('T')[0]}
Items           = ${CATALOG_ITEMS_TOTAL}
TotalListPrice  = $${PROJECT_TOTAL.toLocaleString()}
Currency        = USD

[PRICING]
; Tier             | Rate  | Type                | Source
; ─────────────────┼───────┼─────────────────────┼──────────────────────────────
  Dealer Standard  | 38.0% | Dealer Agreement    | MWS Dealer Agreement #2026-MWS-D041
  Healthcare Pgm   | 12.0% | Vertical Incentive  | MWS Healthcare Incentive #HCI-2026
  Project Volume   |  5.0% | Volume Rebate       | MWS Volume Rebate ($25K+ orders)

ListTotal       = $${PROJECT_TOTAL.toLocaleString()}
NetDealer       = $14,256
NetCustomer     = $18,650
DealerMargin    = $4,394
MarginPct       = 23.6%

[VALIDATION]
CatalogVerified = TRUE
SourceLinked    = TRUE
PricingVerified = TRUE
AIItems         = 2
ExpertHubItems  = 2
AutoMapped      = ${MAPPED_ITEMS_COUNT}
UpchargeTotal   = $${UPCHARGE_TOTAL.toLocaleString()}
ConfidenceAvg   = 92.4%

[ITEMS]
; Line | Part#     | Description              | Qty | List$  | Net$   | Source       | Options
; ─────┼───────────┼──────────────────────────┼─────┼────────┼────────┼─────────────┼─────────────
  001  | BDL-48S   | Wand LED Lamp Freestd    |  6  | $383   | $195   | AUTO         | .SVR (Silver)
  002  | AXM-HBW   | Relate Std Mesh Hi-Bk    |  6  | $1,668 | $851   | AUTO         | .2/.0/.L/.CBK/LKM01/S(3)/.SX/29
  003  | PDK-3R    | PowerDock 3-Recep Mount  |  6  | $411   | $210   | EXPERT_HUB   | — (Pending)
  004  | FXA-SM    | Dynamic Sngl Monitor Arm |  6  | $360   | $184   | AI_SUGGESTED | — (Pending)
  005  | CTK-24W   | Cable Mgmt Kit 24W       |  6  | $95    | $48    | AI_SUGGESTED | — (Pending)
  006  | SBN-15E   | Hinge-Dr Bin 20H×10W     |  6  | $919   | $469   | EXPERT_HUB   | .M/—/—/—/.E/.BNL
  007  | PRL-72C   | Optimize 72W 4-Circuit   |  3  | $313   | $160   | AUTO         | P (Black)
  008  | WRK-60L   | WorkBench 60" Laminate   |  3  | $1,245 | $635   | AUTO         | STD/MLM
  009  | WRK-60L   | WorkBench 60" Laminate   |  6  | $1,245 | $635   | AUTO         | STD/MLM
  010  | WRK-60L   | WorkBench 60" Laminate   |  4  | $1,245 | $635   | AUTO         | STD/MLM
  011  | WRK-60L   | WorkBench 60" Laminate   |  6  | $1,245 | $635   | AUTO         | STD/MLM
  012  | WRK-60L   | WorkBench 60" Laminate   |  3  | $1,245 | $635   | AUTO         | STD/MLM
  013  | FLP-22H   | FilePro 2-Drawer Lat 22" |  6  | $487   | $249   | AUTO         | STD/.BK
  014  | FLP-22H   | FilePro 2-Drawer Lat 22" |  4  | $487   | $249   | AUTO         | STD/.BK
  015  | FLP-22H   | FilePro 2-Drawer Lat 22" |  6  | $487   | $249   | AUTO         | STD/.BK
  ...  | ...       | ...                      | ... | ...    | ...    | ...          | ...
  054  | MRR-48W   | MeridianRail 48W Pwr+Dat |  6  | $289   | $148   | AUTO         | .BK/120/2D

[DISCOUNT_TIERS]
; Tier             | Rate  | Source                                 | Items | Savings
; ─────────────────┼───────┼────────────────────────────────────────┼───────┼─────────
  Dealer Standard  | 38.0% | MWS Dealer Agreement #2026-MWS-D041   |  48   | $8,489
  Healthcare Pgm   | 12.0% | MWS Healthcare Incentive #HCI-2026    |  54   | $3,463
  Project Volume   |  5.0% | MWS Volume Rebate ($25K+ orders)      |  54   | $1,443

[UPCHARGES]
; ItemLine | Type         | Original | Adjusted | Delta   | Reason
; ─────────┼──────────────┼──────────┼──────────┼─────────┼──────────────────────────
  002      | GRD_UPGRADE  | $1,383   | $1,668   | +$285   | Grade 3 Moxie Flint textile
  006      | LOCK_UPGRADE | $724     | $919     | +$195   | Digilock E-lock + Brushed Nickel

[SOURCE_TRACE]
AI_SUGGESTED    = 2  (Lines: 004, 005)
EXPERT_HUB      = 2  (Lines: 003, 006)
AUTO_MAPPED     = ${MAPPED_ITEMS_COUNT} (Lines: 001, 002, 007-054)
CatalogSource   = meridian-workspace.com/catalog/healthcare-office
PricingEngine   = Strata SC Pricing v3.1
TraceVersion    = SIF-TRACE-v1.2
Checksum        = sha256:b7d3e1...f92a

; ═══════════════════════════════════════════════════════════════
; END OF FILE — ${SPEC_ID}_priced.sif
; ═══════════════════════════════════════════════════════════════`}</pre>
                            </div>
                        </div>
                    )}

                    {/* Approve & Sync CTA */}
                    {scSifPhase === 'ready' && scSyncPhase === 'idle' && !specApproved && (
                        <button onClick={() => setScSyncPhase('syncing')}
                            className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                            <ArrowPathIcon className="h-4 w-4" />
                            Approve & Synchronize
                        </button>
                    )}

                    {/* SC Sync Animation */}
                    {scSyncPhase === 'syncing' && (
                        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 via-brand-50 to-blue-50 dark:from-purple-500/10 dark:via-brand-500/5 dark:to-blue-500/10 border-2 border-purple-300 dark:border-purple-500/40 shadow-lg shadow-purple-200/30 dark:shadow-purple-500/10 animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-ai/20">
                                        <ArrowPathIcon className="h-5 w-5 text-ai dark:text-purple-400 animate-spin" />
                                    </div>
                                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-ai rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">Synchronizing Priced Specification</p>
                                    <p className="text-[10px] text-muted-foreground">Propagating SC pricing across all connected systems</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="h-2.5 rounded-full bg-purple-100 dark:bg-ai/20 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-brand-400 to-purple-500 transition-all duration-300 ease-out"
                                        style={{ width: `${scSyncProgress}%` }} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-medium text-ai dark:text-purple-400">
                                        {scSyncProgress < 25 && 'Validating priced SIF against catalog source...'}
                                        {scSyncProgress >= 25 && scSyncProgress < 50 && `Applying dealer discounts to ${CATALOG_ITEMS_TOTAL} line items...`}
                                        {scSyncProgress >= 50 && scSyncProgress < 75 && 'Syncing pricing to SPEC, CET & project catalog...'}
                                        {scSyncProgress >= 75 && 'Finalizing cross-system synchronization...'}
                                    </p>
                                    <span className="text-[10px] font-bold text-ai dark:text-purple-400">{scSyncProgress}%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${scSyncProgress >= 20 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                    <p className="text-[9px] text-muted-foreground">SPEC System</p>
                                    <p className="text-xs font-bold text-foreground">{scSyncProgress >= 20 ? 'Synced' : 'Pending...'}</p>
                                </div>
                                <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${scSyncProgress >= 45 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                    <p className="text-[9px] text-muted-foreground">CET Catalog</p>
                                    <p className="text-xs font-bold text-foreground">{scSyncProgress >= 45 ? 'Updated' : 'Pending...'}</p>
                                </div>
                                <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${scSyncProgress >= 65 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                    <p className="text-[9px] text-muted-foreground">Dealer Pricing</p>
                                    <p className="text-xs font-bold text-foreground">{scSyncProgress >= 65 ? 'Verified' : 'Pending...'}</p>
                                </div>
                                <div className={`px-3 py-2 rounded-lg border transition-all duration-300 ${scSyncProgress >= 85 ? 'bg-green-50 dark:bg-green-500/5 border-green-300 dark:border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                    <p className="text-[9px] text-muted-foreground">Traceability</p>
                                    <p className="text-xs font-bold text-foreground">{scSyncProgress >= 85 ? 'Complete' : 'Pending...'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sync Done — Success + Send CTA */}
                    {scSyncPhase === 'done' && !specApproved && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-2 border-green-400 dark:border-green-500/40 shadow-lg shadow-green-200/30 dark:shadow-green-500/10 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/20 shrink-0">
                                        <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-green-800 dark:text-green-300">All Systems Synchronized</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            Priced specification has been propagated to SPEC, CET, and project catalog.
                                            All {CATALOG_ITEMS_TOTAL} items are aligned with dealer pricing and full traceability.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 ml-12">
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-500/20 text-green-800 dark:text-green-300 font-bold">SYSTEMS SYNCED</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 font-bold">SC PRICED</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold">TRACEABILITY OK</span>
                                </div>
                            </div>

                            {/* Send to Recipients */}
                            <div className="relative">
                                <button onClick={() => setShowApproveSendPopover(!showApproveSendPopover)}
                                    className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                                    <PaperAirplaneIcon className="h-4 w-4" />
                                    Send to Team
                                </button>
                                {showApproveSendPopover && (
                                    <div className="absolute bottom-full mb-2 right-0 w-80 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                        <div className="px-4 py-2.5 border-b border-border bg-muted/50">
                                            <p className="text-xs font-bold text-foreground">Send Priced SIF</p>
                                            <p className="text-[9px] text-muted-foreground">Select recipients for {SPEC_ID}_priced.sif</p>
                                        </div>
                                        <div className="p-2 space-y-0.5">
                                            {[
                                                { id: 'designer', name: 'Designer Alden', subtitle: 'Designer — Interior Design', photo: DESIGNER_PHOTO },
                                                { id: 'client', name: 'Mercy Health', subtitle: 'Client — Procurement Dept.', initials: 'MH', photo: null },
                                                { id: 'ae', name: 'James Mitchell', subtitle: 'Account Executive', initials: 'JM', photo: null },
                                            ].map(r => {
                                                const selected = approveSendRecipients.includes(r.id);
                                                return (
                                                    <button key={r.id}
                                                        onClick={() => setApproveSendRecipients(prev => selected ? prev.filter(x => x !== r.id) : [...prev, r.id])}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                            selected ? 'bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30' : 'hover:bg-muted/50'
                                                        }`}>
                                                        {r.photo ? (
                                                            <img src={r.photo} alt={r.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-300 shrink-0" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{r.initials}</div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-foreground">{r.name}</p>
                                                            <p className="text-[9px] text-muted-foreground">{r.subtitle}</p>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                                            selected ? 'bg-brand-400 border-brand-400' : 'border-border'
                                                        }`}>
                                                            {selected && <CheckIcon className="h-2.5 w-2.5 text-zinc-900" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="px-3 py-2 border-t border-border bg-muted/30">
                                            <button
                                                onClick={() => {
                                                    if (approveSendRecipients.length > 0) {
                                                        setShowApproveSendPopover(false);
                                                        setSpecApproved(true);
                                                        setScSendToast(true);
                                                        setTimeout(pauseAware(() => setScSendToast(false)), 3000);
                                                        setTimeout(pauseAware(() => nextStep()), 2500);
                                                    }
                                                }}
                                                disabled={approveSendRecipients.length === 0}
                                                className={`w-full py-2 rounded-lg text-[11px] font-bold transition-colors ${
                                                    approveSendRecipients.length > 0 ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                }`}>
                                                Send to {approveSendRecipients.length} recipient{approveSendRecipients.length !== 1 ? 's' : ''}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Send Toast */}
                    {scSendToast && (
                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                            <p className="text-xs font-bold text-green-800 dark:text-green-200">
                                {SPEC_ID}_priced.sif approved & sent to Designer Alden, Mercy Health
                            </p>
                        </div>
                    )}

                    {/* Flow Complete */}
                    {specApproved && !scSendToast && (
                        <div className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2">
                            <CheckCircleIcon className="h-4 w-4" />
                            Flow 1 Complete — Priced SIF sent for approval
                        </div>
                    )}
                </div>
            )}

            {/* View Source Modal — Catalog Excerpt (d1.4 only) */}
            {isD14 && viewSourceLine !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] pt-20 pb-6 px-4 sm:px-6 animate-in fade-in duration-200" onClick={() => setViewSourceLine(null)}>
                    <div className="flex flex-col bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                        <div className="bg-muted p-3 border-b border-border font-mono text-xs flex justify-between items-center text-muted-foreground shrink-0">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-ai" />
                                <span className="truncate">catalog: {CATALOG_URL}</span>
                                <span className="text-[10px] ml-2 font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-ai/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 shrink-0">MFR CATALOG</span>
                            </div>
                            <button onClick={() => setViewSourceLine(null)} className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0 ml-2">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Item header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{SC_SPEC_ITEMS.find(i => i.line === viewSourceLine)?.product}</p>
                                    <p className="text-[10px] font-mono text-muted-foreground">{SC_SPEC_ITEMS.find(i => i.line === viewSourceLine)?.partNumber}</p>
                                </div>
                                {sourceBadge(SC_SPEC_ITEMS.find(i => i.line === viewSourceLine)?.source || 'auto')}
                            </div>

                            {/* Catalog excerpt */}
                            <div className="p-4 rounded-lg bg-muted dark:bg-zinc-800/50 border border-border font-mono text-[11px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                                {SOURCE_EXCERPTS[viewSourceLine] || 'Source excerpt not available'}
                            </div>

                            {/* Item details */}
                            <div className="grid grid-cols-3 gap-3 text-[10px]">
                                <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                    <div className="text-muted-foreground">Qty</div>
                                    <div className="font-bold text-foreground">{SC_SPEC_ITEMS.find(i => i.line === viewSourceLine)?.qty}</div>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                    <div className="text-muted-foreground">Unit Price</div>
                                    <div className="font-bold text-foreground">${(SC_SPEC_ITEMS.find(i => i.line === viewSourceLine)?.listPrice || 0).toLocaleString()}</div>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                    <div className="text-muted-foreground">Options</div>
                                    <div className="font-bold text-foreground text-[9px]">{SC_SPEC_ITEMS.find(i => i.line === viewSourceLine)?.optionDesc}</div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border p-3 bg-card flex items-center justify-between shrink-0">
                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium font-mono">
                                <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" /> Catalog Verified
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                Source: <strong className="text-ai dark:text-purple-400">{MANUFACTURER}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
