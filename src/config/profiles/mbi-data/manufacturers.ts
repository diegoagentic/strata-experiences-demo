import type { Manufacturer } from './types';

export const MBI_MANUFACTURERS: Manufacturer[] = [
    { id: 'allsteel',      name: 'Allsteel',       isEDI: true,  compassValidated: true, color: '#FF6B35' },
    { id: 'hni',           name: 'HNI',            isEDI: true,  compassValidated: true },
    { id: 'gunlocke',      name: 'Gunlocke',       isEDI: true,  compassValidated: true },
    { id: 'hon',           name: 'HON',            isEDI: true,  compassValidated: true },
    { id: 'kimball',       name: 'Kimball',        isEDI: true },
    { id: 'steelcase',     name: 'CaseWorks',      isEDI: false, color: '#297C46' },
    { id: 'herman-miller', name: 'Apex Workspace', isEDI: false, color: '#CC3333' },
    { id: 'knoll',         name: 'Pinnacle',       isEDI: false },
    { id: 'humanscale',    name: 'ErgoTech',       isEDI: false },
    { id: 'hbf',           name: 'Pacific Fabrics', isEDI: false },
];

export const getManufacturer = (id: string): Manufacturer | undefined =>
    MBI_MANUFACTURERS.find(m => m.id === id);
