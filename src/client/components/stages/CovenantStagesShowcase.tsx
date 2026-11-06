import React, { useState } from 'react';
import {
  FileEdit,
  Lock,
  GitBranch,
  Terminal as TerminalIcon,
  LayoutGrid,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Stage1Forge } from './Stage1Forge';
import { Stage2Vault } from './Stage2Vault';
import { Stage3Proof } from './Stage3Proof';
import { Stage4Daemon } from './Stage4Daemon';

export const CovenantStagesShowcase: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'focused' | 'grid'>('grid');

  const stageTabs = [
    { id: 0, label: '01 · Rule Forge', icon: FileEdit, name: 'Covenant Forge' },
    { id: 1, label: '02 · Witness Vault', icon: Lock, name: 'Witness Escrow' },
    { id: 2, label: '03 · Proof Engine', icon: GitBranch, name: 'Daily Proof' },
    { id: 3, label: '04 · Cutoff Daemon', icon: TerminalIcon, name: 'Midnight Daemon' },
  ];

  return (
    <div className="w-full space-y-6 select-none">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-neutral-100/70 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.06] backdrop-blur-md">
        {/* Stage Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          {stageTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = viewMode === 'focused' && activeStage === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveStage(tab.id);
                  setViewMode('focused');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-white/[0.12] text-neutral-900 dark:text-white font-semibold shadow-xs border border-neutral-300/80 dark:border-white/[0.12]'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon size={12} className={isSelected ? 'text-blue-500' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle (Grid vs Focused Single View) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-200/60 dark:bg-black/40 border border-neutral-300/50 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-white/[0.15] text-neutral-900 dark:text-white font-semibold shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Display all 4 stages in a side-by-side grid"
          >
            <LayoutGrid size={12} />
            <span>4-Stage Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('focused')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'focused'
                ? 'bg-white dark:bg-white/[0.15] text-neutral-900 dark:text-white font-semibold shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Focus on one stage at a time"
          >
            <Layers size={12} />
            <span>Focused View</span>
          </button>
        </div>
      </div>

      {/* Grid Mode: All 4 Stage Components Side-by-Side */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Stage1Forge />
          <Stage2Vault />
          <Stage3Proof />
          <Stage4Daemon />
        </div>
      )}

      {/* Focused Mode: Single Stage Deep-Dive */}
      {viewMode === 'focused' && (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
          {activeStage === 0 && <Stage1Forge />}
          {activeStage === 1 && <Stage2Vault />}
          {activeStage === 2 && <Stage3Proof />}
          {activeStage === 3 && <Stage4Daemon />}
        </div>
      )}
    </div>
  );
};
