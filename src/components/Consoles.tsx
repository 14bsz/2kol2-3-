/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Target, Trash2, ArrowRightLeft, TrendingDown, RefreshCw, AlertTriangle, Coins, Sparkles, Scale, Check, X, HelpCircle, ChevronDown, ChevronUp, Percent, History } from 'lucide-react';
import { UPGRADE_RULES } from '../data';
import { UpgradeRule, RecordEntry } from '../types';

interface ConsolesProps {
  records: RecordEntry[];
  initialCards: number;
  setInitialCards: (val: number) => void;
  currentCards: number;
  recordsCount: number;
  selectedRuleId: string;
  setSelectedRuleId: (id: string) => void;
  onLogUpgrade: (success: boolean) => void;
  drawDownLimitPercent: number;
  maxDrawdownPercent: number;
  soundEnabled: boolean;
  onResetAll: () => void;
  theme?: 'light' | 'dark';
}

export default function Consoles({
  records,
  initialCards,
  setInitialCards,
  currentCards,
  recordsCount,
  selectedRuleId,
  setSelectedRuleId,
  onLogUpgrade,
  drawDownLimitPercent,
  maxDrawdownPercent,
  soundEnabled,
  onResetAll,
  theme = 'light',
}: ConsolesProps) {
  // Read current selected rule details accurately from search
  const selectedRule = useMemo(() => {
    return UPGRADE_RULES.find((r) => r.id === selectedRuleId) || UPGRADE_RULES[0];
  }, [selectedRuleId]);

  const [activeStarTab, setActiveStarTab] = useState<number>(() => selectedRule.targetStar);
  const [showResetDlg, setShowResetDlg] = useState(false);
  const [showStrategyHelp, setShowStrategyHelp] = useState(false);
  const [isExclusivePanelExpanded, setIsExclusivePanelExpanded] = useState<boolean>(true); // Expanded by default to draw attention, user can collapse

  // Synchronize active star tab if the selected rule ID changes
  React.useEffect(() => {
    setActiveStarTab(selectedRule.targetStar);
  }, [selectedRule.targetStar]);

  // Filter for 24% and 48% rate records
  const records24 = useMemo(() => records.filter((r) => r.successRate === 24), [records]);
  const records48 = useMemo(() => records.filter((r) => r.successRate === 48), [records]);

  // Calculations for 24% group
  const total24 = records24.length;
  const wins24 = records24.filter((r) => r.success).length;
  const actualRate24 = total24 > 0 ? (wins24 / total24) * 100 : 0;
  const netCards24 = records24.reduce((sum, r) => sum + r.netChange, 0);

  // Calculations for 48% group
  const total48 = records48.length;
  const wins48 = records48.filter((r) => r.success).length;
  const actualRate48 = total48 > 0 ? (wins48 / total48) * 100 : 0;
  const netCards48 = records48.reduce((sum, r) => sum + r.netChange, 0);

  // Combined history of 24% and 48% attempts, newest first
  const combinedExclusiveRecords = useMemo(() => {
    return records
      .filter((r) => r.successRate === 24 || r.successRate === 48)
      .slice()
      .reverse();
  }, [records]);

  // Play synthetic feedback beeps
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {}
  };

  // Filter rules by currently active star tab (e.g., targetStar 2, 3, 4, 5, 6)
  const currentRules = useMemo(() => {
    return UPGRADE_RULES.filter((r) => r.targetStar === activeStarTab);
  }, [activeStarTab]);

  // Calculate Mathematical Expectation = (SuccessRate * SuccessGain) - ((100 - SuccessRate) * FailLoss)
  const successChance = selectedRule.successRate / 100;
  const failureChance = 1 - successChance;
  const mathExpectation = (successChance * selectedRule.successGain) - (failureChance * selectedRule.failLoss);
  const mathExpectationFormatted = mathExpectation.toFixed(3);
  const isExpPositive = mathExpectation >= 0;

  // Grid slots for the last 32 records (sorted newest first, left-to-right)
  const gridSlots = useMemo(() => {
    const slots: (RecordEntry | null)[] = [];
    const reversed = records.slice().reverse();
    for (let i = 0; i < 32; i++) {
      if (i < reversed.length) {
        slots.push(reversed[i]);
      } else {
        slots.push(null);
      }
    }
    return slots;
  }, [records]);

  // Change star tab safely and select the first matching formula rule automatically
  const handleStarTabChange = (star: number) => {
    playClickSound();
    setActiveStarTab(star);
    let matching: UpgradeRule | undefined;
    if (star === 3) {
      matching = UPGRADE_RULES.find((r) => r.targetStar === star && r.id === '3_2_2s');
    }
    if (!matching) {
      matching = UPGRADE_RULES.find((r) => r.targetStar === star);
    }
    if (matching) {
      setSelectedRuleId(matching.id);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto scrollbar-thin px-3.5 py-3 flex flex-col space-y-2.5 font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-zinc-100' : 'text-gray-900 bg-gray-50'
    }`}>
      
      {/* SECTION 1: Starting Assets Definition Box (起点配置) */}
      <div className={`border rounded-2xl p-3 shadow-sm shrink-0 relative overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center select-none ${
            theme === 'dark' ? 'text-zinc-100' : 'text-gray-900'
          }`}>
            <Coins className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            卡量账簿配置
          </span>
          <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            标准单卡：1突破
          </span>
        </div>

        {/* Real-time input panel */}
        <div className={`flex items-center space-x-2 p-2 rounded-xl border transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex-1 flex flex-col">
            <span className={`text-[9.5px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>初始持卡 (1标准底卡)</span>
            <input
              type="number"
              value={initialCards || ''}
              min={1}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 0);
                setInitialCards(val);
              }}
              className={`bg-transparent font-bold text-base outline-none w-full border-b border-transparent focus:border-emerald-500/50 transition-all font-mono py-0.5 ${
                theme === 'dark' ? 'text-zinc-100' : 'text-gray-900'
              }`}
            />
          </div>

          <div className={`w-px h-8 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'}`} />

          {/* Current calculated asset indicator */}
          <div className="flex-1 flex flex-col text-right pr-1">
            <span className={`text-[9.5px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>当前计算余额</span>
            <span className="font-extrabold text-base text-emerald-500 font-mono tracking-wide">
              {currentCards} 张
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Target Star Selector and Subcard dropdown Side-by-side */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div className={`border rounded-2xl p-2.5 flex flex-col space-y-1 shadow-sm transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
        }`}>
          <label className={`text-[10px] font-bold flex items-center ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            <Target className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            目标主卡星级
          </label>
          <div className={`grid grid-cols-5 gap-0.5 p-0.5 rounded-lg border shadow-inner transition-colors duration-300 ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-300'
          }`}>
            {[2, 3, 4, 5, 6].map((star) => (
              <button
                key={star}
                onClick={() => handleStarTabChange(star)}
                className={`py-1 rounded font-black text-xs transition-all relative ${
                  activeStarTab === star
                    ? 'bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow'
                    : theme === 'dark'
                      ? 'text-zinc-500 hover:text-zinc-200'
                      : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {star}
              </button>
            ))}
          </div>
        </div>

        <div className={`border rounded-2xl p-2.5 flex flex-col space-y-1 shadow-sm transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
        }`}>
          <label className={`text-[10px] font-bold ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            副卡消耗配方
          </label>
          <div className="relative">
            <select
              value={selectedRule?.id}
              onChange={(e) => {
                playClickSound();
                setSelectedRuleId(e.target.value);
              }}
              className={`w-full py-1.5 px-2.5 rounded-lg border font-bold text-xs outline-none cursor-pointer appearance-none truncate transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-zinc-200 hover:bg-slate-800' 
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              {currentRules.map((r) => (
                <option key={r.id} value={r.id} className={theme === 'dark' ? 'bg-slate-900 text-zinc-100' : 'bg-white text-gray-900'}>
                  {r.formulaName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-emerald-500">
              <ArrowRightLeft className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Compact Expected Earnings Prediction Forecast Panel */}
      <div className={`border rounded-2xl p-2.5 flex flex-col space-y-2 relative shadow-sm transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className={`flex items-center justify-between border-b pb-1.5 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
          <div className="flex space-x-3 items-center">
            <div className="flex flex-col">
              <span className={`text-[8.5px] leading-none ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>成功概率</span>
              <span className={`text-sm font-black mt-0.5 leading-none ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>
                {selectedRule?.successRate}%
              </span>
            </div>
            <div className={`w-px h-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'}`} />
            <div className="flex flex-col">
              <span className={`text-[8.5px] leading-none ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>数学期望净收益</span>
              <span className={`text-[11.5px] font-mono font-bold mt-0.5 leading-none ${
                isExpPositive 
                  ? 'text-emerald-500' 
                  : theme === 'dark' ? 'text-rose-450 text-rose-400' : 'text-red-500'
              }`}>
                {isExpPositive ? '+' : ''}{mathExpectationFormatted} 张/次
              </span>
            </div>
          </div>

          <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[8.5px] ${
            theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-300'
          }`}>
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <span className={`font-mono ${
              isExpPositive 
                ? 'text-emerald-500 font-bold' 
                : theme === 'dark' ? 'text-zinc-550 text-zinc-500' : 'text-gray-500'
            }`}>
              {isExpPositive ? '期望推荐' : '期望负 警告'}
            </span>
          </div>
        </div>

        {/* Live Predictor Box showing immediate impacts */}
        <div className="grid grid-cols-2 gap-2">
          {/* SUCCESS FORECAST */}
          <div className={`border rounded-lg p-1.5 flex justify-between items-center ${
            theme === 'dark' ? 'bg-emerald-950/20 border-emerald-950/60 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <span className="text-[10px] text-emerald-500 font-bold">成功：</span>
            <span className="text-[11px] font-bold font-mono text-emerald-500">
              赚 +{selectedRule?.successGain} 张
            </span>
          </div>

          {/* FAILURE EXPANSION */}
          <div className={`border rounded-lg p-1.5 flex justify-between items-center ${
            theme === 'dark' ? 'bg-rose-950/20 border-rose-900/30' : 'bg-red-50 border-red-200'
          }`}>
            <span className="text-[10px] text-rose-500 font-bold">失败：</span>
            <span className="text-[11px] font-bold font-mono text-rose-400 text-red-500">
              亏 -{selectedRule?.failLoss} 张
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Double tactile recording Buttons (成功/失败录入) - Raised to the middle for ultimate quick-touch accessibility */}
      <div className="grid grid-cols-2 gap-3 shrink-0 py-0.5">
        
        {/* FAILURE FEEDBACK TRIGGER */}
        <button
          id="btn-log-failure"
          onClick={() => {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (soundEnabled && AudioContext) {
              try {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
              } catch {}
            }
            onLogUpgrade(false);
          }}
          className="py-3 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 border border-red-400/20 text-white font-black text-lg shadow hover:from-red-500 hover:to-red-400 active:scale-[0.95] transition-all flex items-center justify-center select-none"
        >
          失败
        </button>

        {/* SUCCESS FEEDBACK TRIGGER */}
        <button
          id="btn-log-success"
          onClick={() => {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (soundEnabled && AudioContext) {
              try {
                const ctx = new AudioContext();
                
                const playBeep = (freq: number, start: number, dur: number) => {
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.frequency.setValueAtTime(freq, start);
                  gain.gain.setValueAtTime(0.06, start);
                  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start(start);
                  osc.stop(start + dur);
                };

                playBeep(523.25, ctx.currentTime, 0.12);
                playBeep(659.25, ctx.currentTime + 0.06, 0.12);
                playBeep(783.99, ctx.currentTime + 0.12, 0.16);
                playBeep(1046.50, ctx.currentTime + 0.18, 0.25);
              } catch {}
            }
            onLogUpgrade(true);
          }}
          className="py-3 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 border border-emerald-400/20 text-white font-black text-lg shadow hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.95] transition-all flex items-center justify-center select-none"
        >
          成功
        </button>

      </div>

      {/* SECTION 4.5: 24% 和 48% 专属观测台 (展开/收起) - Relocated here for instant visibility after clicking buttons */}
      <div className={`border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 shrink-0 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        {/* Accordion Header */}
        <button
          onClick={() => {
            playClickSound();
            setIsExclusivePanelExpanded(!isExclusivePanelExpanded);
          }}
          className={`w-full px-3.5 py-3 flex items-center justify-between font-bold text-xs select-none transition-colors duration-200 cursor-pointer ${
            theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Percent className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className={theme === 'dark' ? 'text-zinc-100 font-extrabold' : 'text-gray-900 font-extrabold'}>
              24% & 48% 专属胜率观测台
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-sans ${
              theme === 'dark' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-800'
            }`}>
              分类统计
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-normal text-gray-500">
              {isExclusivePanelExpanded ? "收起" : "展开"}
            </span>
            {isExclusivePanelExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Collapsible content (controlled via isExclusivePanelExpanded) */}
        {isExclusivePanelExpanded && (
          <div className={`p-3 border-t flex flex-col space-y-3 transition-colors ${
            theme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-gray-100 bg-gray-50/20'
          }`}>
            {/* Overview Stats side-by-side (24% vs 48%) */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* 24% Card */}
              <div className={`rounded-xl p-2.5 border transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-dashed border-gray-200 dark:border-slate-800/80">
                  <span className="text-[11px] font-extrabold text-emerald-500">24% 概率档位</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                    total24 > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-950 dark:text-zinc-500'
                  }`}>
                    实测: {total24 > 0 ? `${actualRate24.toFixed(1)}%` : '--'}
                  </span>
                </div>
                <div className="space-y-1 font-sans text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">样本记录</span>
                    <span className="font-mono font-bold">{total24} 次</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">成 / 败 占比</span>
                    <span className="font-mono">
                      <span className="text-emerald-500 font-bold">{wins24}✓</span>
                      <span className="text-gray-400 dark:text-zinc-550 mx-0.5">/</span>
                      <span className="text-rose-500 font-bold">{total24 - wins24}✗</span>
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 dark:border-slate-800/80">
                    <span className="text-gray-500 dark:text-zinc-400">累计损损益</span>
                    <span className={`font-mono font-extrabold ${
                      netCards24 > 0 ? 'text-emerald-500' : netCards24 < 0 ? 'text-rose-500' : 'text-gray-500'
                    }`}>
                      {netCards24 > 0 ? `+${netCards24}` : netCards24} 张
                    </span>
                  </div>
                </div>
              </div>

              {/* 48% Card */}
              <div className={`rounded-xl p-2.5 border transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-dashed border-gray-200 dark:border-slate-800/80">
                  <span className="text-[11px] font-extrabold text-indigo-500">48% 概率档位</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                    total48 > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-950 dark:text-zinc-500'
                  }`}>
                    实测: {total48 > 0 ? `${actualRate48.toFixed(1)}%` : '--'}
                  </span>
                </div>
                <div className="space-y-1 font-sans text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">样本记录</span>
                    <span className="font-mono font-bold">{total48} 次</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">成 / 败 占比</span>
                    <span className="font-mono">
                      <span className="text-emerald-500 font-bold">{wins48}✓</span>
                      <span className="text-gray-400 dark:text-zinc-550 mx-0.5">/</span>
                      <span className="text-rose-500 font-bold">{total48 - wins48}✗</span>
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 dark:border-slate-800/80">
                    <span className="text-gray-500 dark:text-zinc-400">累计损损益</span>
                    <span className={`font-mono font-extrabold ${
                      netCards48 > 0 ? 'text-emerald-500' : netCards48 < 0 ? 'text-rose-500' : 'text-gray-500'
                    }`}>
                      {netCards48 > 0 ? `+${netCards48}` : netCards48} 张
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Exclusive list title */}
            <div className="flex items-center justify-between pt-1 pb-0.5">
              <span className={`text-[10px] font-bold flex items-center ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
                <History className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                24% 与 48% 核心合并记录
              </span>
            </div>

            {/* Split separate logs list layout (24% and 48% side by side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 24% Left side */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-emerald-500">24% 档位专属历史 ({records24.length} 次)</span>
                </div>
                <div className={`max-h-[140px] overflow-y-auto scrollbar-thin rounded-xl border flex flex-col divide-y transition-colors ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 divide-slate-800' : 'bg-gray-50/50 border-gray-200 divide-gray-200/60'
                }`}>
                  {records24.length === 0 ? (
                    <div className="py-6 px-1.5 text-center select-none text-gray-500 dark:text-zinc-500 text-[9.5px] leading-relaxed">
                      暂无 24% 的合卡强化记录。
                    </div>
                  ) : (
                    records24.slice().reverse().map((r) => (
                      <div 
                        key={r.id} 
                        className="p-1.5 flex items-center justify-between text-[10px] font-sans hover:bg-black/5 dark:hover:bg-white/2 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-extrabold ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-800'}`}>
                            {r.targetStar}突 ({r.formulaName})
                          </span>
                          <span className="text-[8.5px] font-mono text-gray-400 dark:text-zinc-500">
                            {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-1 rounded font-bold text-[8.5px] ${
                            r.success
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}>
                            {r.success ? '成功' : '失败'}
                          </span>
                          <span className={`font-mono font-bold text-right text-[10px] ${
                            r.netChange > 0 ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {r.netChange > 0 ? `+${r.netChange}` : r.netChange}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 48% Right side */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-indigo-500">48% 档位专属历史 ({records48.length} 次)</span>
                </div>
                <div className={`max-h-[140px] overflow-y-auto scrollbar-thin rounded-xl border flex flex-col divide-y transition-colors ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 divide-slate-800' : 'bg-gray-50/50 border-gray-200 divide-gray-200/60'
                }`}>
                  {records48.length === 0 ? (
                    <div className="py-6 px-1.5 text-center select-none text-gray-500 dark:text-zinc-500 text-[9.5px] leading-relaxed">
                      暂无 48% 的合卡强化记录。
                    </div>
                  ) : (
                    records48.slice().reverse().map((r) => (
                      <div 
                        key={r.id} 
                        className="p-1.5 flex items-center justify-between text-[10px] font-sans hover:bg-black/5 dark:hover:bg-white/2 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-extrabold ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-800'}`}>
                            {r.targetStar}突 ({r.formulaName})
                          </span>
                          <span className="text-[8.5px] font-mono text-gray-400 dark:text-zinc-500">
                            {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-1 rounded font-bold text-[8.5px] ${
                            r.success
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}>
                            {r.success ? '成功' : '失败'}
                          </span>
                          <span className={`font-mono font-bold text-right text-[10px] ${
                            r.netChange > 0 ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {r.netChange > 0 ? `+${r.netChange}` : r.netChange}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* SECTION 5: 直观胜率分布走势 (挂载垫子观察) - Extremely clean row visual indicators */}
      <div className={`border rounded-2xl p-3 shadow-sm shrink-0 flex flex-col space-y-2 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold tracking-wider flex items-center select-none ${
            theme === 'dark' ? 'text-zinc-150 text-zinc-100' : 'text-gray-900'
          }`}>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500 mr-1.5 animate-pulse" />
            直观胜率分布走势 (挂载垫子观察)
          </span>
          <button 
            onClick={() => setShowStrategyHelp(!showStrategyHelp)}
            className={`text-[9.5px] font-medium px-2 py-0.5 rounded border active:scale-95 transition-all flex items-center space-x-1 ${
              theme === 'dark' 
                ? 'text-zinc-300 bg-slate-950 border-slate-800 hover:bg-slate-800' 
                : 'text-gray-600 bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span>诀窍</span>
            <HelpCircle className="w-3 h-3 text-emerald-500" />
          </button>
        </div>

        {/* The double row grid containing up to 32 items horizontally scrollable */}
        <div className={`p-2 rounded-xl border relative overflow-x-auto scrollbar-thin w-full transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col space-y-1.5 w-max">
            
            {/* Row 1: SUCCESS ROW */}
            <div className="flex items-center space-x-2 min-w-max">
              <span className={`w-9 text-[9px] font-extrabold shrink-0 text-center select-none py-0.5 rounded ${
                theme === 'dark' ? 'text-emerald-400 bg-emerald-950/35 border border-emerald-900/40' : 'text-emerald-600 bg-emerald-100'
              }`}>
                ✓
              </span>
              <div className="flex items-center space-x-1">
                {gridSlots.map((slot, idx) => {
                  if (slot && slot.success) {
                    return (
                      <div 
                        key={`success-slot-${idx}`} 
                        className={`relative group w-[26px] h-[26px] rounded flex items-center justify-center text-[10px] font-black transition-transform active:scale-95 cursor-pointer ${
                          theme === 'dark' 
                            ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-400 hover:border-emerald-500' 
                            : 'bg-emerald-100 border border-emerald-300 text-emerald-700 hover:border-emerald-400'
                        }`}
                      >
                        ✓{slot.targetStar}
                        
                        {/* Tooltip on hover */}
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block border text-[10px] p-2 rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none transition-colors ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-800'
                        }`}>
                          <p className="font-bold text-emerald-400">成功：{slot.targetStar}突 🌟</p>
                          <p className={`font-mono text-[9px] mt-0.5 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>收益：赚 +{slot.netChange} 张</p>
                          <p className="text-gray-400 font-mono text-[8px] mt-0.5">配方：{slot.formulaName}</p>
                          <p className="text-zinc-500 font-mono text-[8px]">{new Date(slot.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div 
                      key={`success-dot-${idx}`} 
                      className={`w-[26px] h-[26px] rounded flex items-center justify-center font-bold select-none text-[11px] border ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-900 text-zinc-700' : 'bg-gray-200 border-gray-300 text-gray-500'
                      }`}
                    >
                      •
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 2: FAILURE ROW */}
            <div className="flex items-center space-x-2 min-w-max">
              <span className={`w-9 text-[9px] font-extrabold shrink-0 text-center select-none py-0.5 rounded ${
                theme === 'dark' ? 'text-rose-450 bg-rose-950/30 border border-rose-900/30' : 'text-red-700 bg-red-100'
              }`}>
                ✗
              </span>
              <div className="flex items-center space-x-1">
                {gridSlots.map((slot, idx) => {
                  if (slot && !slot.success) {
                    return (
                      <div 
                        key={`fail-slot-${idx}`} 
                        className={`relative group w-[26px] h-[26px] rounded flex items-center justify-center text-[10px] font-black transition-transform active:scale-95 cursor-pointer ${
                          theme === 'dark' 
                            ? 'bg-rose-950/40 border border-rose-900/40 text-rose-400 hover:border-rose-500' 
                            : 'bg-red-105 bg-red-100 border border-red-300 text-red-600 hover:border-red-400'
                        }`}
                      >
                        ✗{slot.targetStar}
                        
                        {/* Tooltip on hover */}
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block border text-[10px] p-2 rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none transition-colors ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-zinc-100' : 'bg-white border-gray-200 text-gray-800'
                        }`}>
                          <p className="font-bold text-rose-400">失败：{slot.targetStar}突 💀</p>
                          <p className={`font-mono text-[9px] mt-0.5 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>损失：亏 {slot.netChange} 张</p>
                          <p className="text-gray-400 font-mono text-[8px] mt-0.5">配方：{slot.formulaName}</p>
                          <p className="text-zinc-500 font-mono text-[8px]">{new Date(slot.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div 
                      key={`fail-dot-${idx}`} 
                      className={`w-[26px] h-[26px] rounded flex items-center justify-center font-bold select-none text-[11px] border ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-900 text-zinc-700' : 'bg-gray-200 border-gray-300 text-gray-500'
                      }`}
                    >
                      •
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Collapsible Fodder Cushioning Strategy mini instructions */}
        {showStrategyHelp && (
          <div className={`text-[9.5px] leading-relaxed p-2.5 rounded-xl border flex flex-col space-y-1 select-none animate-fade-in transition-colors ${
            theme === 'dark' ? 'text-zinc-350 bg-slate-950 border-slate-800' : 'text-gray-600 bg-gray-50 border-gray-200'
          }`}>
            <div className={`flex items-center font-bold ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>
              <HelpCircle className="w-3" />
              <span>挂载垫子（Cushioning）实战诀窍：</span>
            </div>
            <p>
              ■ <strong>捕捉连黑爆点</strong>：下排 ✗ 猩红块多点连续亮起，表明正处于连败黑洞。建议连续失败 3-5 次后挂载主卡大盘方案，拼概率强势回归。
            </p>
            <p>
              ■ <strong>避免高危红区</strong>：上排 ✓ 翠绿块连续频繁亮起，说明胜率处于过度溢出红利。建议适度收盘或改用最便宜卡做主垫磨概率。
            </p>
          </div>
        )}
      </div>

      {/* SECTION 6: Safety Clean control reset bar */}
      <div className={`pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between border-t text-[10px] gap-2 shrink-0 ${
        theme === 'dark' ? 'border-slate-800 text-zinc-500' : 'border-gray-200 text-gray-500'
      }`}>
        <span className="font-medium">已记录历史: <strong className={`font-mono ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>{recordsCount}</strong> 次</span>
        
        <button
          id="trigger-reset-dialog-btn"
          onClick={() => {
            playClickSound();
            setShowResetDlg(true);
          }}
          className={`flex items-center transition-colors py-1 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer shadow-sm active:scale-95 ${
            theme === 'dark' 
              ? 'text-zinc-400 border-slate-800 bg-slate-900 hover:text-red-400 hover:border-red-900/60' 
              : 'text-gray-550 border-gray-300 bg-white hover:text-red-500 hover:border-red-500/30'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          清空账簿并重新开始
        </button>
      </div>

      {/* Absolute overlay for Reset Confirmation Dialog */}
      {showResetDlg && (
        <div className={`absolute inset-0 p-6 flex flex-col justify-center items-center text-center z-50 animate-fade-in select-none ${
          theme === 'dark' ? 'bg-slate-950/98 text-zinc-100' : 'bg-white/98'
        }`}>
          <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-5 animate-bounce shadow-sm ${
            theme === 'dark' ? 'bg-rose-950/20 border-rose-900/30 text-rose-400' : 'bg-red-50 border-red-200 text-red-500'
          }`}>
            <RefreshCw className="w-8 h-8" />
          </div>
          
          <h3 className={`text-base font-black tracking-wide mb-2.5 ${theme === 'dark' ? 'text-zinc-100' : 'text-gray-900'}`}>
            确定清空账簿并重新开始吗？
          </h3>
          
          <p className={`text-xs px-2 leading-relaxed mb-8 max-w-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}>
            这会清除您当前已录入的 <span className="text-red-500 font-bold">{recordsCount} 次</span> 强化合卡账簿历史、并将所有余额资产计算指标清零回滚，以便您开始**新一轮独立的操盘记录**。该清退操作无法撤销。
          </p>
          
          <div className="w-full max-w-xs flex flex-col space-y-3.5">
            <button
              id="confirm-reset-btn"
              onClick={() => {
                playClickSound();
                onResetAll();
                setShowResetDlg(false);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs shadow-md active:scale-[0.97] transition-all cursor-pointer"
            >
              确认清空并重新开始
            </button>
            <button
              id="cancel-reset-btn"
              onClick={() => {
                playClickSound();
                setShowResetDlg(false);
              }}
              className={`w-full py-3.5 rounded-xl border font-bold text-xs tracking-wide active:scale-[0.97] transition-all cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-zinc-300 hover:bg-slate-800' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              维持原样
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
