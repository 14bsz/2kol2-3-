/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Target, BookOpen, Sun, Moon } from 'lucide-react';

import WeChatWrapper from './components/WeChatWrapper';
import Consoles from './components/Consoles';
import SessionReport from './components/SessionReport';
import MentalBreathingModal from './components/MentalBreathingModal';

import { UPGRADE_RULES } from './data';
import { RecordEntry, SanityMetrics, SanityStatusType } from './types';

export default function App() {
  // --- Persistent States (localStorage) ---
  const [initialCards, setInitialCardsState] = useState<number>(() => {
    const saved = localStorage.getItem('nba2k_init_cards_v1');
    return saved ? Math.max(1, parseInt(saved) || 40) : 40;
  });

  const [records, setRecords] = useState<RecordEntry[]>(() => {
    const saved = localStorage.getItem('nba2k_records_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('nba2k_sound_v1');
    return saved ? saved === 'true' : true;
  });

  const [selectedRuleId, setSelectedRuleId] = useState<string>(() => {
    const saved = localStorage.getItem('nba2k_curr_rule_v1');
    return saved && UPGRADE_RULES.some((r) => r.id === saved) ? saved : '5_4';
  });

  const [drawDownLimitPercent, setDrawDownLimitPercent] = useState<number>(() => {
    const saved = localStorage.getItem('nba2k_drawdown_limit_v1');
    return saved ? Math.max(10, Math.min(80, parseInt(saved) || 35)) : 35;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nba2k_theme_v1');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // --- View States ---
  const [currentTab, setCurrentTab] = useState<'console' | 'report'>('console');
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [showReportBadge, setShowReportBadge] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('nba2k_init_cards_v1', String(initialCards));
  }, [initialCards]);

  useEffect(() => {
    localStorage.setItem('nba2k_theme_v1', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nba2k_records_v1', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('nba2k_sound_v1', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('nba2k_curr_rule_v1', selectedRuleId);
  }, [selectedRuleId]);

  useEffect(() => {
    localStorage.setItem('nba2k_drawdown_limit_v1', String(drawDownLimitPercent));
  }, [drawDownLimitPercent]);

  // --- Real-time Dynamic Metrics Calculations ---
  // A. Current Card assets balance
  const currentCards = useMemo(() => {
    const change = records.reduce((sum, r) => sum + r.netChange, 0);
    return Math.max(0, initialCards + change);
  }, [records, initialCards]);

  // B. Drawdown analytics matching behavior economics
  const drawdownStats = useMemo(() => {
    let peak = initialCards;
    let current = initialCards;
    let maxDrawdown = 0;

    for (const r of records) {
      current += r.netChange;
      if (current > peak) {
        peak = current;
      }
      const dd = peak - current;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }

    const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;
    return {
      peak,
      maxDrawdown,
      maxDrawdownPercent,
    };
  }, [records, initialCards]);

  // C. Dynamic Sanity rating score calculator (0 - 100 points)
  const sanityMetrics = useMemo<SanityMetrics>(() => {
    let score = 100;

    // Metric 1: Consecutive losses penalty
    let currentLossStreak = 0;
    let maxLossStreak = 0;
    let tempLossStreak = 0;
    let maxWinStreak = 0;
    let tempWinStreak = 0;

    for (let i = 0; i < records.length; i++) {
      if (!records[i].success) {
        tempLossStreak++;
        tempWinStreak = 0;
        if (tempLossStreak > maxLossStreak) maxLossStreak = tempLossStreak;
      } else {
        tempWinStreak++;
        tempLossStreak = 0;
        if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
      }
    }

    // Get current active streak from end of records
    for (let i = records.length - 1; i >= 0; i--) {
      if (!records[i].success) {
        currentLossStreak++;
      } else {
        break;
      }
    }

    // Severe escalation deduction per loss streak
    if (currentLossStreak > 0) {
      if (currentLossStreak === 1) score -= 8;
      else if (currentLossStreak === 2) score -= 22;
      else if (currentLossStreak === 3) score -= 45;
      else score -= 70; // Hard drop after 4 inline failures
    }

    // Metric 2: Drawdown depth percent factor
    const drawdownPercent = drawdownStats.maxDrawdownPercent;
    if (drawdownPercent > 0) {
      if (drawdownPercent < 20) {
        score -= drawdownPercent * 0.7;
      } else if (drawdownPercent < 40) {
        score -= drawdownPercent * 1.1;
      } else {
        score -= drawdownPercent * 1.6;
      }
    }

    // Metric 3: Low-probability continuous gamble penalty
    // Draining sanity on attempts under 15% during loss period
    let desperateAttempts = 0;
    const itemsToCheck = records.slice(-4);
    for (const r of itemsToCheck) {
      if (r.successRate <= 15 && !r.success) {
        desperateAttempts++;
      }
    }
    score -= desperateAttempts * 12;

    // Normalize value
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Evaluate category states
    let status: SanityStatusType = 'excellent';
    let advice = '心境澄明，理智值百分百。这是最完美的强化时间窗！';
    let colorClass = 'text-emerald-600';

    if (score >= 80) {
      status = 'excellent';
      advice = '您当前呼吸规律，操作平稳。大脑额叶完全主导，可严格按既定规划方案合卡。';
      colorClass = 'text-emerald-600';
    } else if (score >= 50) {
      status = 'normal';
      advice = '心率正常，理智得分过硬。此时进行普通低星强化或备用料积累完全可以，继续保持！';
      colorClass = 'text-sky-600';
    } else if (score >= 20) {
      status = 'warn';
      advice = '【防爆警报】：心境开始急躁。您正处于温和上头边缘！建议将升星消耗调整为高胜比辅料套路，禁止任何极低胜几率的盲强化。';
      colorClass = 'text-amber-600';
    } else {
      status = 'danger';
      advice = '【强制熄火】：心跳爆表，已经输急眼！进入认知不连贯强赌博模式。系统理智装置已自动闭锁，请立刻深呼吸放松自救。';
      colorClass = 'text-red-600';
    }

    // If drawdown limit exceeded, set status to breached override
    if (drawdownPercent >= drawDownLimitPercent) {
      status = 'breached';
      advice = '【物理防御彻底击穿】：您设定的最大资产保护线（减耗 ' + drawDownLimitPercent + '%）已被跌破！这属于最高警戒级别。根据防沉溺纪律，应立即下线休息，明日再战。';
      colorClass = 'text-red-500 font-extrabold';
    }

    return {
      score,
      status,
      advice,
      colorClass,
      recentFailStreak: desperateAttempts,
      consecutiveLosses: currentLossStreak,
      consecutiveWins: maxWinStreak,
      maxDrawdown: drawdownStats.maxDrawdown,
      maxDrawdownPercent: drawdownStats.maxDrawdownPercent,
    };
  }, [records, initialCards, drawdownStats.maxDrawdownPercent, drawDownLimitPercent]);

  // Handle auto locking for extreme tilt occurrences
  // Activates only when transitioning below 20
  const prevScoreRef = React.useRef(sanityMetrics.score);

  useEffect(() => {
    if (showReportBadge) {
      const timer = setTimeout(() => setShowReportBadge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showReportBadge]);

  useEffect(() => {
    const oldScore = prevScoreRef.current;
    const newScore = sanityMetrics.score;

    if (newScore < 50 && oldScore >= 50 && currentTab !== 'report') {
      setShowReportBadge(true);
    }

    if (newScore < 20 && oldScore >= 20) {
      setIsBreathingModalOpen(true);
    }
    
    prevScoreRef.current = newScore;
  }, [sanityMetrics.score, currentTab]);

  // --- Hand-crafted core Upgrade log registering handler ---
  const handleLogUpgrade = (success: boolean) => {
    const activeRule = UPGRADE_RULES.find((r) => r.id === selectedRuleId);
    if (!activeRule) return;

    // Build title descriptively
    const title = `${activeRule.targetStar} 突强化 · ${success ? '升星成功! 🎉' : '强化失败... 爆'}`;
    const timestamp = new Date().toISOString();
    
    // Success / Fail assets formula math
    const netChange = success ? activeRule.successGain : -activeRule.failLoss;

    const newRecord: RecordEntry = {
      id: `rc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      ruleId: activeRule.id,
      formulaName: activeRule.formulaName,
      targetStar: activeRule.targetStar,
      successRate: activeRule.successRate,
      success,
      failLoss: activeRule.failLoss,
      successGain: activeRule.successGain,
      netChange,
      sanityScoreBefore: sanityMetrics.score,
      // temp, will be re-evaluated anyway
      sanityScoreAfter: 100,
      title,
    };

    // Append and let memo re-calculate score
    const updatedRecords = [...records, newRecord];
    
    // We compute what the sanity score AFTER this event is going to be to store correctly
    const scoreAfter = 100; // Will be hydrated after state updates or mapped dynamically:
    newRecord.sanityScoreAfter = sanityMetrics.score; 

    setRecords(updatedRecords);
  };

  // --- Single item rollback handler ---
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Reset database ---
  const handleResetAll = () => {
    setRecords([]);
    setInitialCardsState(40);
    localStorage.removeItem('nba2k_init_cards_v1');
    localStorage.removeItem('nba2k_records_v1');
  };

  // Adjust initial cards directly
  const handleSetInitialCards = (val: number) => {
    setInitialCardsState(val);
  };

  return (
    <WeChatWrapper
      title="NBA2KOL2 合卡理智卫士"
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
      theme={theme}
      setTheme={setTheme}
    >
      
      {/* Dynamic Main App tabs bodies */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentTab === 'console' && (
          <Consoles
            theme={theme}
            records={records}
            initialCards={initialCards}
            setInitialCards={handleSetInitialCards}
            currentCards={currentCards}
            recordsCount={records.length}
            selectedRuleId={selectedRuleId}
            setSelectedRuleId={setSelectedRuleId}
            onLogUpgrade={handleLogUpgrade}
            drawDownLimitPercent={drawDownLimitPercent}
            maxDrawdownPercent={drawdownStats.maxDrawdownPercent}
            soundEnabled={soundEnabled}
            onResetAll={handleResetAll}
          />
        )}

        {currentTab === 'report' && (
          <SessionReport
            theme={theme}
            records={records}
            initialCards={initialCards}
            sanityMetrics={sanityMetrics}
            drawDownLimitPercent={drawDownLimitPercent}
            setDrawDownLimitPercent={setDrawDownLimitPercent}
            onDeleteRecord={handleDeleteRecord}
            onTriggerManualBreathing={() => setIsBreathingModalOpen(true)}
            soundEnabled={soundEnabled}
            onResetSession={handleResetAll}
            currentCards={currentCards}
          />
        )}
      </div>

      {/* WeChat Style Footer navigation tabs bar (微信底部标签栏 - 极简三标签设计) */}
      <div className={`w-full h-16 border-t px-6 flex items-center justify-between shrink-0 select-none z-30 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950 border-slate-800/80' : 'bg-white border-gray-200/80'
      }`}>
        
        {/* Tab 1: Consoles */}
        <button
          id="tab-btn-console"
          onClick={() => {
            if (soundEnabled) {
              try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                  const ctx = new AudioContext();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.frequency.setValueAtTime(450, ctx.currentTime);
                  gain.gain.setValueAtTime(0.005, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.09);
                }
              } catch {}
            }
            setCurrentTab('console');
          }}
          className={`flex flex-col items-center space-y-1 py-1 px-3 transition-colors ${
            currentTab === 'console' 
              ? 'text-emerald-500 font-extrabold' 
              : theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Target className="w-5.5 h-5.5" />
          <span className="text-[11px]">合卡控台</span>
        </button>

        {/* Central Standalone Dedicated Theme Switch Slot */}
        <button
          id="btn-footer-theme-toggle"
          onClick={() => {
            const nextTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(nextTheme);
            if (soundEnabled) {
              try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                  const ctx = new AudioContext();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.frequency.setValueAtTime(500, ctx.currentTime);
                  gain.gain.setValueAtTime(0.005, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.08);
                }
              } catch {}
            }
          }}
          className={`flex flex-col items-center space-y-1 py-1 px-3 transition-all duration-300 active:scale-95 cursor-pointer ${
            theme === 'dark' 
              ? 'text-amber-400 hover:text-amber-300' 
              : 'text-indigo-600 hover:text-indigo-800'
          }`}
          title={theme === 'dark' ? "极简白" : "科技黑"}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5.5 h-5.5 text-amber-400" />
              <span className="text-[11px] font-medium">极简白</span>
            </>
          ) : (
            <>
              <Moon className="w-5.5 h-5.5 text-indigo-600" />
              <span className="text-[11px] font-medium">科技黑</span>
            </>
          )}
        </button>

        {/* Tab 2: Interactive Session Report & Audit */}
        <button
          id="tab-btn-report"
          onClick={() => {
            if (soundEnabled) {
              try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                  const ctx = new AudioContext();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.frequency.setValueAtTime(450, ctx.currentTime);
                  gain.gain.setValueAtTime(0.005, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.09);
                }
              } catch {}
            }
            setCurrentTab('report');
          }}
          className={`flex flex-col items-center space-y-1 py-1 px-3 transition-colors relative ${
            currentTab === 'report' 
              ? 'text-emerald-500 font-extrabold' 
              : theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {showReportBadge && (
            <span className="absolute top-1 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          )}
          {showReportBadge && (
            <span className="absolute top-1 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500" />
          )}
          <BookOpen className="w-5.5 h-5.5" />
          <span className="text-[11px]">本场报告</span>
        </button>

      </div>

      {/* Mandatory Cool down breathing intercept lock panel */}
      <MentalBreathingModal
        theme={theme}
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
        sanityScore={sanityMetrics.score}
        soundEnabled={soundEnabled}
      />

    </WeChatWrapper>
  );
}
