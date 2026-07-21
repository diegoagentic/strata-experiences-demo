import OrderCreationForm, { type OrderFormData } from '../components/forms/OrderCreationForm';

// Mock pre-filled data · shared-block preview only. Shows a realistic
// downtown-HQ renovation order so viewers see every field populated
// instead of a blank form. `id` values on line items are stable strings
// (not random) so React keys don't churn on re-render.
const MOCK_ORDER: Partial<OrderFormData> = {
    customerId: 'CUST-001',
    poNumber: 'PO-2026-0142',
    projectRef: 'Downtown HQ Renovation · Phase 2',
    shippingAddress: '300 Market Street · Suite 900\nSan Francisco, CA 94103\nAttn: Site Supervisor · Floor 9',
    billingAddress: 'City Builders Inc.\n1200 Broadway · Suite 400\nOakland, CA 94612',
    requestedDate: '2026-08-15',
    items: [
        { id: 'ln-1', description: 'Executive Task Chair · ERG-5100 · black mesh', qty: 24, unitPrice: 685, total: 16440 },
        { id: 'ln-2', description: 'Sit-Stand Desk Pro · 60"×30" · walnut top',    qty: 24, unitPrice: 1220, total: 29280 },
        { id: 'ln-3', description: 'Acoustic Panel · 48"×24" · charcoal felt',      qty: 18, unitPrice: 145, total: 2610 },
        { id: 'ln-4', description: 'Freight — white-glove delivery + installation',  qty: 1,  unitPrice: 4800, total: 4800 },
    ],
    notes: 'Phased install across 2 weekends. Freight elevator reserved for Fri/Sat AM only. All packaging must be removed same-day per building policy.',
};

export default function OrderCreationBlock() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <OrderCreationForm
        initialData={MOCK_ORDER}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </div>
  );
}
