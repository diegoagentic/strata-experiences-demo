import ThreeWayMatchView, { type MatchLine } from '../components/widgets/ThreeWayMatchView';

const MOCK_LINES: MatchLine[] = [
  { lineItem: 'Herman Miller Aeron · Size B',      sku: 'HM-AER-B-BLK',  poValue: '$1,395.00', ackValue: '$1,395.00', invoiceValue: '$1,395.00', status: 'match' },
  { lineItem: 'Steelcase Series 1 · Task Chair',   sku: 'SC-S1-STD',     poValue: '$489.00',   ackValue: '$489.00',   invoiceValue: '$514.00',   status: 'mismatch', delta: '+$25.00 unit price' },
  { lineItem: 'Knoll Antenna Workspaces · 6-pack', sku: 'KN-AW6-WLNT',   poValue: '$8,240.00', ackValue: '$8,240.00', invoiceValue: '$4,120.00', status: 'partial',  delta: 'Received 3 of 6 units' },
  { lineItem: 'Humanscale Float · Standing Desk',  sku: 'HS-FLT-72',     poValue: '$2,180.00', ackValue: '$2,180.00', invoiceValue: '$2,180.00', status: 'match' },
];

export default function ThreeWayMatchBlock() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ThreeWayMatchView
        orderId="PO-2044-71"
        lines={MOCK_LINES}
      />
    </div>
  );
}
