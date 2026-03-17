import SovereignHeader from './components/SovereignHeader';
import { LeadDecayForecaster } from './components/LeadDecayForecaster';

function App() {
  return (
    <div className="min-h-screen bg-[#0F1115]">
      <SovereignHeader appName="Lead Decay" />
      <LeadDecayForecaster />
    </div>
  );
}

export default App
