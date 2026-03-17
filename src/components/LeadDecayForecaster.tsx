import { useState, useMemo } from 'react';
import { Lock, Info, Search, Shield, SlidersHorizontal, LineChart, ExternalLink } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';

/** Decay constant for 5-minute half-life: ln(2) / 5 ≈ 0.138629 */
const K = 0.138629;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function computeDecayCurve(
  closeRate: number,
  k: number,
  maxMinutes: number
): { minute: number; probability: number }[] {
  const data: { minute: number; probability: number }[] = [];
  for (let t = 0; t <= maxMinutes; t++) {
    const probability = closeRate * Math.exp(-k * t);
    data.push({ minute: t, probability: Math.round(probability * 100) / 100 });
  }
  return data;
}

export function LeadDecayForecaster() {
  const [dealValue, setDealValue] = useState(15000);
  const [closeRate, setCloseRate] = useState(25);
  const [cpl, setCpl] = useState(250);
  const [responseTime, setResponseTime] = useState(55);

  const { currentProbability, opportunityLost, costOfDelay } = useMemo(() => {
    const current = closeRate * Math.exp(-K * responseTime);
    const lost = dealValue * ((closeRate - current) / 100);
    const cost =
      lost + cpl * (1 - (closeRate > 0 ? current / closeRate : 0));
    return {
      currentProbability: Math.round(current * 100) / 100,
      opportunityLost: Math.round(lost * 100) / 100,
      costOfDelay: Math.round(cost * 100) / 100,
    };
  }, [dealValue, closeRate, cpl, responseTime]);

  const chartData = useMemo(
    () => computeDecayCurve(closeRate, K, 60),
    [closeRate]
  );

  const responseTimePoint = useMemo(() => {
    const prob = closeRate * Math.exp(-K * responseTime);
    return { minute: responseTime, probability: Math.round(prob * 100) / 100 };
  }, [responseTime, closeRate]);

  const probabilityDrop = closeRate - currentProbability;
  const dropPercent = closeRate > 0 ? ((probabilityDrop / closeRate) * 100).toFixed(1) : '0';
  const probabilityAt1Min = closeRate * Math.exp(-K * 1);

  return (
    <main className="py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
      {/* Action Hero Block */}
      <section className="text-center">
        <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          100% Private - Stored Only on Your Device.
        </p>
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight text-center">
          Forecast Your Lead Decay
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto text-center">
          Identify the exact moment your leads turn cold and protect your pipeline velocity.
        </p>
      </section>

      {/* Deal Parameters */}
      <section className="bg-[#161B22] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-[#F4C430]" />
          The Deal Parameters
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              Deal Value
              <Info className="w-4 h-4 text-gray-500" />
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-base">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={dealValue}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setDealValue(isNaN(v) ? 0 : v);
                }}
                className="w-full h-12 pl-8 pr-4 font-mono text-lg tabular-nums bg-[#0F1115] border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C430] focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              Close Rate (%)
              <Info className="w-4 h-4 text-gray-500" />
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={closeRate}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
                setCloseRate(isNaN(v) ? 0 : Math.min(100, v));
              }}
              className="w-full h-12 px-4 font-mono text-lg tabular-nums bg-[#0F1115] border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C430] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              Cost Per Lead
              <Info className="w-4 h-4 text-gray-500" />
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-base">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={cpl}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setCpl(isNaN(v) ? 0 : v);
                }}
                className="w-full h-12 pl-8 pr-4 font-mono text-lg tabular-nums bg-[#0F1115] border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C430] focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-white mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                Response Time
                <Info className="w-4 h-4 text-gray-500" />
              </span>
              <span className="font-mono tabular-nums text-white">{responseTime} min</span>
            </label>
            <input
              type="range"
              min={0}
              max={60}
              value={responseTime}
              onChange={(e) => setResponseTime(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#0F1115] accent-[#F4C430]"
            />
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161B22] border border-white/10 rounded-xl p-6">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">
            Qualification Probability
          </p>
          <p className="text-2xl font-mono tabular-nums font-bold text-white">
            {currentProbability}%
          </p>
          <p className="text-xs text-[#6B7280] mt-2">
            Likelihood this lead still converts at your current response time.
          </p>
        </div>
        <div className="bg-[#161B22] border border-[#F4C430] rounded-xl p-6">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">
            Cost of Delay
          </p>
          <p
            className="text-2xl font-mono tabular-nums font-bold"
            style={{ color: '#F4C430' }}
          >
            {formatCurrency(costOfDelay)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2">
            Expected value leakage + acquisition cost at this response time.
          </p>
        </div>
        <div className="bg-[#161B22] border border-white/10 rounded-xl p-6">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">
            Opportunity Lost
          </p>
          <p className="text-2xl font-semibold font-mono text-white tabular-nums">
            {formatCurrency(opportunityLost)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2">
            Expected revenue sacrificed vs responding in 1 minute.
          </p>
        </div>
      </section>

      {/* Qualification Cliff Chart */}
      <section className="bg-[#161B22] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-[#F4C430]" />
          The Qualification Cliff
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="qualificationCliff"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#3498DB" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3498DB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
              <XAxis
                dataKey="minute"
                stroke="#6B7280"
                tick={{ fill: '#9CA3AF' }}
                domain={[0, 60]}
                label={{
                  value: 'Minutes',
                  position: 'insideBottom',
                  offset: -5,
                  fill: '#9CA3AF',
                }}
              />
              <YAxis
                width={45}
                stroke="#6B7280"
                tick={{ fill: '#9CA3AF' }}
                domain={[0, closeRate * 1.1]}
                tickFormatter={(value) => `${Math.round(value)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #2B2B2B',
                  borderRadius: '6px',
                  color: '#E1E2E4',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                itemStyle={{ color: '#E1E2E4', fontWeight: 'bold', fontFamily: '"JetBrains Mono", monospace' }}
                labelStyle={{ fontFamily: '"JetBrains Mono", monospace' }}
                formatter={(value) => [
                  `${typeof value === 'number' ? value.toFixed(2) : '—'}%`,
                  'Win Probability',
                ]}
                labelFormatter={(label) => `${label} min`}
              />
              <ReferenceLine
                x={responseTime}
                stroke="#F4C430"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <ReferenceDot
                x={responseTimePoint.minute}
                y={responseTimePoint.probability}
                r={6}
                fill="#F4C430"
                stroke="#0F1115"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="probability"
                name="Win Probability"
                stroke="#3498DB"
                strokeWidth={2}
                fill="url(#qualificationCliff)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* System Architect Insights */}
      <section className="bg-[#161B22] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-[#F4C430]" />
          System Architect Insights
        </h2>
        <div className="space-y-4 text-[#9CA3AF] leading-relaxed">
          <p>
            At {responseTime} minutes, your qualification probability sits at{' '}
            <span className="text-white font-medium font-mono tabular-nums">{currentProbability}%</span>, down from{' '}
            <span className="text-white font-medium font-mono tabular-nums">{probabilityAt1Min.toFixed(2)}%</span> if you responded in 1 minute.
          </p>
          <p>
            That is a <span className="text-white font-medium font-mono tabular-nums">{dropPercent}%</span> drop in win probability per lead.
          </p>
          <p>
            On a per-lead basis, you're burning roughly{' '}
            <span className="text-white font-medium font-mono tabular-nums">{formatCurrency(opportunityLost)}</span> in expected revenue and taking on an incremental{' '}
            <span className="text-white font-medium font-mono tabular-nums">{formatCurrency(costOfDelay)}</span> in delay-driven value leakage compared with a 1-minute response.
          </p>
          <p>
            Scale that across just 100 inbound leads a month and you're staring at{' '}
            <span className="text-[#F4C430] font-medium font-mono tabular-nums">{formatCurrency(opportunityLost * 100)}</span> in silent pipeline erosion — purely due to response latency.
          </p>
          <p>
            The architecture verdict: shave minutes off your response time and the cliff turns back into a ramp. Treat speed-to-lead as a first-class SLO, not a convenience metric.
          </p>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-[#161B22] border border-white/10 rounded-xl p-6 flex justify-between items-center flex-col md:flex-row gap-4">
        <div>
          <h2 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#F4C430]" />
            Stop burning inbound leads
          </h2>
          <p className="text-gray-400 max-w-xl">
            You are paying a massive latency tax. Join the newsletter to unlock The Vault and get the 3-step Automated Routing Blueprint to drop your response time under 60 seconds.
          </p>
        </div>
        <a
          href="https://udallerprotocol.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-bold bg-[#F4C430] hover:bg-[#D4A017] text-[#0F1115] transition-colors w-full md:w-auto"
        >
          Get the Blueprint
          <ExternalLink className="h-5 w-5" />
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-white/5">
        <p className="text-xs text-gray-600 text-center max-w-4xl mx-auto leading-relaxed mb-6">
          This tool provides estimates based on standard industry patterns for informational purposes only. It is not a substitute for professional operational or financial counsel. Always review your own pipeline metrics and consult a qualified professional.
        </p>
        <p className="text-xs text-gray-500 text-center">
          This tool is part of the <a href="https://udaller.one" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-300 hover:text-[#F4C430] transition-colors">Udaller</a> ecosystem. Build your machine at <a href="https://udallerprotocol.com" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-300 hover:text-[#F4C430] transition-colors">The Udaller Protocol</a>.
        </p>
      </footer>
      </div>
    </main>
  );
}
