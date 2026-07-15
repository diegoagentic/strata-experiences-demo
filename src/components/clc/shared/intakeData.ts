// Mock data for Flow 3 — Project Intake & Site-Conditions Validation
//
// 10-question survey delivered to the customer (Fairport Public Library).
// IQ has partial data already · survey closes the gaps.

export interface IntakeQuestion {
    id: string
    label: string
    /** Short helper / placeholder hint */
    helper?: string
    /** The customer's answer (mock) */
    customerAnswer: string
    /** What IQ has on file before the survey */
    iqValue: string | null
    /** Comparison result between iqValue and customerAnswer */
    status: 'match' | 'mismatch' | 'iq-blank' | 'survey-blank'
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
    {
        id: 'q1', label: 'Site contact name',
        helper: 'Who should we contact day-of-install?',
        customerAnswer: 'Director of Library Services · Fairport Public Library',
        iqValue: 'Director of Library Services · Fairport Public Library',
        status: 'match',
    },
    {
        id: 'q2', label: 'Site contact mobile',
        customerAnswer: '+1 (585) 555-0188',
        iqValue: '+1 (585) 555-0188',
        status: 'match',
    },
    {
        id: 'q3', label: 'Delivery address',
        customerAnswer: '1 Fairport Village Landing · Fairport NY 14450',
        iqValue: '1 Fairport Village Landing · Fairport NY 14450',
        status: 'match',
    },
    {
        id: 'q4', label: 'Floor & suite',
        customerAnswer: 'Floor 1 · main library',
        iqValue: 'Floor 1',
        status: 'mismatch',
    },
    {
        id: 'q5', label: 'Freight elevator available',
        helper: 'Y/N + interior dimensions',
        customerAnswer: 'No · ground-floor delivery only · two double-door entries (72" × 84")',
        iqValue: null,
        status: 'iq-blank',
    },
    {
        id: 'q6', label: 'Loading dock',
        customerAnswer: 'No dock · street-level + concrete ramp · vans only',
        iqValue: null,
        status: 'iq-blank',
    },
    {
        id: 'q7', label: 'Building hours · after-hours surcharge',
        customerAnswer: 'M-F 8a-6p · Sat 10a-4p · no surcharge if scheduled within hours',
        iqValue: null,
        status: 'iq-blank',
    },
    {
        id: 'q8', label: 'Active renovation on floor at ready-date',
        helper: 'Will the install area be clear?',
        customerAnswer: 'No · all renovation work signs off May 30 · floor is ours from Jun 1',
        iqValue: 'TBD',
        status: 'mismatch',
    },
    {
        id: 'q9', label: 'Floor ready-date',
        customerAnswer: 'Jun 1, 2026',
        iqValue: 'Jun 1, 2026',
        status: 'match',
    },
    {
        id: 'q10', label: 'Special access · COI / security / badging',
        customerAnswer: 'COI required (general liability) · no security escort needed · sign in at front desk',
        iqValue: 'COI required',
        status: 'match',
    },
]

export const SURVEY_DELIVERY_PLATFORMS = {
    procore: {
        name: 'Procore',
        sourceLabel: 'Procore project channel',
        recipient: 'Fairport Public Library · Project #FPL-2026-LIB-001',
        responseRateLabel: '~92% historical (n=47)',
    },
    email: {
        name: 'Email',
        sourceLabel: 'CLC dispatcher mailbox',
        recipient: 'project lead · external email',
        responseRateLabel: '~28% historical (n=312)',
    },
}
