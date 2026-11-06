import React, { useState, useEffect } from 'react';
import {
  Flame,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { LivesIndicator } from './LivesIndicator';

interface TimelineDay {
  day: number;
  label: string;
  value: number; // e.g. completion quality / problems solved
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  detail: string;
}

export const CovenantCommandCenter: React.FC = () => {
  // Covenant State
  const [currentLives, setCurrentLives] = useState<number>(3);
  const [maxLives] = useState<number>(3);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [witnessDebt, setWitnessDebt] = useState<number>(0);
  const [stakePerMiss] = useState<number>(500);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(6); // default to latest day

  // Live Countdown to Midnight
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 4,
    minutes: 41,
    seconds: 20,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff > 0) {
        const total = Math.floor(diff / 1000);
        setCountdown({
          hours: Math.floor(total / 3600),
          minutes: Math.floor((total % 3600) / 60),
          seconds: total % 60,
        });
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 7-day trailing execution history window
  const initialDays: TimelineDay[] = [
    { day: 8, label: 'Oct 1', value: 2, status: 'SUCCESS', detail: '2 LeetCode problems verified' },
    { day: 9, label: 'Oct 2', value: 3, status: 'SUCCESS', detail: '3 LeetCode problems verified' },
    { day: 10, label: 'Oct 3', value: 2, status: 'SUCCESS', detail: '2 LeetCode problems verified' },
    { day: 11, label: 'Oct 4', value: 4, status: 'SUCCESS', detail: '4 LeetCode problems verified' },
    { day: 12, label: 'Oct 5', value: 2, status: 'SUCCESS', detail: '2 LeetCode problems verified' },
    { day: 13, label: 'Oct 6', value: 3, status: 'SUCCESS', detail: '3 LeetCode problems verified' },
    { day: 14, label: 'Today', value: 2, status: 'SUCCESS', detail: 'Target satisfied for today' },
  ];

  const [history, setHistory] = useState<TimelineDay[]>(initialDays);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Sparkline coordinates generation (SVG viewBox: 0 0 320 90)
  const svgWidth = 320;
  const svgHeight = 90;
  const paddingX = 20;
  const paddingY = 16;
  const stepX = (svgWidth - paddingX * 2) / (history.length - 1);

  // Map values to y (min value: 0, max value: 5)
  const getY = (val: number, status: string) => {
    if (status === 'FAILED') return svgHeight - paddingY; // bottom
    const clamped = Math.max(0, Math.min(5, val));
    return svgHeight - paddingY - (clamped / 5) * (svgHeight - paddingY * 2);
  };

  const points = history.map((item, idx) => ({
    x: paddingX + idx * stepX,
    y: getY(item.value, item.status),
    ...item,
  }));

  // Build SVG path string with smooth bezier curves
  const buildSmoothPath = () => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = buildSmoothPath();
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  // Simulation: Trigger Missed Cutoff
  const handleSimulateMiss = () => {
    if (currentLives > 0) {
      const nextLives = currentLives - 1;
      const nextDebt = witnessDebt + stakePerMiss;
      setCurrentLives(nextLives);
      setWitnessDebt(nextDebt);

      // Mutate today's status to FAILED in timeline
      setHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          day: 14,
          label: 'Today',
          value: 0,
          status: 'FAILED',
          detail: 'Missed 00:00 cutoff — 1 life lost',
        };
        return copy;
      });

      if (nextLives === 0) {
        setIsTerminated(true);
        setBannerNotice('⚠ Critical Breach: All 3 lives exhausted. Covenant irreversibly TERMINATED.');
      } else {
        setBannerNotice(`Cutoff Missed: 1 life deducted (${nextLives}/3 remaining). ₹${stakePerMiss} added to partner debt.`);
      }
    }
  };

  // Simulation: Restore
  const handleReset = () => {
    setCurrentLives(3);
    setWitnessDebt(0);
    setStreakDays(14);
    setIsTerminated(false);
    setHistory(initialDays);
    setHoveredIndex(6);
    setBannerNotice(null);
  };

  // Hovered day details (default to last day)
  const activeTooltip = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="w-full rounded-3xl bg-white/70 dark:bg-[#0c0d12]/70 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-all duration-200 overflow-hidden select-none">
      {/* Top Banner Notice (if triggered) */}
      {bannerNotice && (
        <div
          className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
            isTerminated
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-300'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="underline hover:no-underline cursor-pointer font-semibold"
          >
            Reset
          </button>
        </div>
      )}

      {/* Main Single Panoramic Card Row */}
      <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* ================= LEFT SECTION: IDENTITY & PRIMARY KPI ================= */}
        <div className="lg:col-span-4 flex items-center gap-4 sm:gap-5">
          {/* Squircle Brand / Discipline Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/[0.15] border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <Flame size={28} className="fill-indigo-500/20" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Daily Discipline
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-semibold border ${
                  isTerminated
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}
              >
                {isTerminated ? 'TERMINATED' : 'ACTIVE'}
              </span>
            </div>

            {/* Big Primary Metric */}
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white tabular-nums">
                {streakDays} Days
              </h2>
            </div>

            {/* Sub-telemetry: Trend + Vitality */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-medium">
                <TrendingUp size={11} />
                <span>100% adherence</span>
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <LivesIndicator currentLives={currentLives} maxLives={maxLives} size="sm" />
            </div>
          </div>
        </div>

        {/* ================= MIDDLE SECTION: INTERACTIVE EXECUTION SPARKLINE ================= */}
        <div className="lg:col-span-4 w-full flex flex-col items-center justify-center relative">
          <div className="w-full relative">
            {/* Floating Tooltip Bubble matching reference image style */}
            {activeTooltip && (
              <div
                className="absolute z-10 -top-8 transition-all duration-150 pointer-events-none transform -translate-x-1/2"
                style={{ left: `${(activeTooltip.x / svgWidth) * 100}%` }}
              >
                <div className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-[11px] font-mono font-semibold shadow-md whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>
                    {activeTooltip.label}: {activeTooltip.value > 0 ? `${activeTooltip.value} Solved` : 'Missed'}
                  </span>
                </div>
              </div>
            )}

            {/* SVG Sparkline Curve */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-20 sm:h-22 overflow-visible"
            >
              <defs>
                <linearGradient id="covenantGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isTerminated ? '#ef4444' : '#6366f1'}
                    stopOpacity="0.35"
                  />
                  <stop
                    offset="100%"
                    stopColor={isTerminated ? '#ef4444' : '#6366f1'}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path d={areaPath} fill="url(#covenantGradient)" />

              {/* Trajectory Stroke */}
              <path
                d={linePath}
                fill="none"
                stroke={isTerminated ? '#ef4444' : '#6366f1'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Datapoints */}
              {points.map((p, idx) => {
                const isHovered = hoveredIndex === idx;
                const isFailed = p.status === 'FAILED';

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  >
                    {/* Invisible hit target for smooth hover */}
                    <circle cx={p.x} cy={p.y} r="12" fill="transparent" />

                    {/* Outer ring on hover / active */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="6"
                        fill={isFailed ? '#ef4444' : '#6366f1'}
                        opacity="0.3"
                      />
                    )}

                    {/* Data dot */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 4 : 3}
                      fill={isFailed ? '#ef4444' : '#4f46e5'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Horizontal Timeline Labels */}
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500 pt-1 px-2">
              {history.map((h, i) => (
                <span
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  className={`cursor-pointer transition-colors ${
                    hoveredIndex === i
                      ? 'text-neutral-900 dark:text-white font-semibold'
                      : 'hover:text-neutral-600 dark:hover:text-neutral-300'
                  }`}
                >
                  {h.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION: ACCOUNTABILITY METRICS STACK ================= */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-s border-neutral-200 dark:border-white/[0.08] pt-4 lg:pt-0 lg:ps-6 space-y-2.5">
          {/* Row 1: Kept & Verified */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Verified Check-ins</span>
            </div>
            <div className="font-mono font-semibold text-neutral-900 dark:text-white tabular-nums">
              {history.filter((h) => h.status === 'SUCCESS').length} / 7 days{' '}
              <span className="text-neutral-400 font-normal">
                ({Math.round((history.filter((h) => h.status === 'SUCCESS').length / 7) * 100)}%)
              </span>
            </div>
          </div>

          {/* Row 2: Midnight Cutoff Countdown */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <Clock size={15} className="text-indigo-500 shrink-0" />
              <span>Cutoff Countdown</span>
            </div>
            <div className="font-mono font-semibold text-neutral-900 dark:text-white tabular-nums">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}{' '}
              <span className="text-neutral-400 font-normal">(00:00)</span>
            </div>
          </div>

          {/* Row 3: Witness Debt Collateral */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <Coins size={15} className="text-amber-500 shrink-0" />
              <span>Witness Debt Ledger</span>
            </div>
            <div
              className={`font-mono font-bold tabular-nums ${
                witnessDebt > 0 ? 'text-rose-500' : 'text-neutral-900 dark:text-white'
              }`}
            >
              ₹{witnessDebt.toLocaleString()}{' '}
              <span className="text-neutral-400 font-normal font-sans text-[11px]">
                (₹{stakePerMiss}/miss)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Control Strip (Contract OS) */}
      <div className="px-6 py-3.5 bg-neutral-50/70 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>
            Witness: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">@alex_peer</strong> · 
            Pact: <span className="text-neutral-800 dark:text-neutral-200 font-medium">Solve 2 LeetCode problems daily</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateMiss}
            disabled={isTerminated}
            className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-gradient-to-b from-rose-500/20 to-rose-600/10 hover:from-rose-500/30 hover:to-rose-600/20 text-rose-700 dark:text-rose-300 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertTriangle size={12} className="text-rose-500" />
            <span>Simulate Missed Cutoff</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
