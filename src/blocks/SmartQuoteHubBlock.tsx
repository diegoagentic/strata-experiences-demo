import SmartQuoteHub from '../components/widgets/SmartQuoteHub';
import { GenUIProvider } from '../context/GenUIContext';

export default function SmartQuoteHubBlock() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <GenUIProvider onNavigate={() => {}}>
        <SmartQuoteHub />
      </GenUIProvider>
    </div>
  );
}
