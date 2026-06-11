/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import { 
  Activity, 
  Sparkles, 
  Flame, 
  Trash2, 
  Copy, 
  ShieldAlert, 
  Heart, 
  Coins, 
  Compass, 
  BookOpen, 
  Scale, 
  Check, 
  Play, 
  RefreshCw,
  Download
} from 'lucide-react';
import { RecordEntry, SanityMetrics } from '../types';

interface SessionReportProps {
  records: RecordEntry[];
  initialCards: number;
  sanityMetrics: SanityMetrics;
  drawDownLimitPercent: number;
  setDrawDownLimitPercent: (val: number) => void;
  onDeleteRecord: (id: string) => void;
  onTriggerManualBreathing: () => void;
  soundEnabled: boolean;
  onResetSession: () => void;
  currentCards: number;
  theme?: 'light' | 'dark';
}

export default function SessionReport({
  records,
  initialCards,
  sanityMetrics,
  drawDownLimitPercent,
  setDrawDownLimitPercent,
  onDeleteRecord,
  onTriggerManualBreathing,
  soundEnabled,
  onResetSession,
  currentCards,
  theme = 'light',
}: SessionReportProps) {
  const [copied, setCopied] = useState(false);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {}
  };

  // 1. Calculate historical wealth values array for sparkline plotting
  const wealthTrend = useMemo(() => {
    const trend: number[] = [initialCards];
    let curr = initialCards;
    for (let i = 0; i < records.length; i++) {
      curr += records[i].netChange;
      trend.push(curr);
    }
    return trend;
  }, [records, initialCards]);

  // 2. High order analytics stats
  const stats = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return {
        total,
        wins: 0,
        losses: 0,
        actualRate: 0,
        expectedRateAvg: 0,
        luckMeter: '平稳 ⚖️',
        luckFeedback: '概率完全守恒中，当前未有任何极端好坏运偏离。',
        netCumulative: 0,
        maxWinStreak: 0,
        maxLossStreak: 0,
        currentStreakType: 'none',
        currentStreakCount: 0,
      };
    }

    const wins = records.filter(r => r.success).length;
    const losses = total - wins;
    const actualRate = (wins / total) * 100;
    const expectedRateAvg = records.reduce((sum, r) => sum + r.successRate, 0) / total;

    // Luck state evaluation with strict formula calculations
    let luckMeter = '概率守恒 ⚖️';
    let luckFeedback = '当前实际成功率与官方预估大体符合。属于正常波动；';
    const gap = actualRate - expectedRateAvg;

    if (gap >= 15) {
      luckMeter = '五星锦鲤附身 ✨';
      luckFeedback = '天命眷顾！您的实测率高出了标称概率，欧气全开！建议见好就收，避免回吐。';
    } else if (gap > 5) {
      luckMeter = '喜气盈盈 🌟';
      luckFeedback = '气运中上，目前胜比高于数学均值。脑波完全处于上峰。';
    } else if (gap <= -15) {
      luckMeter = '非酋本酋 💀';
      luckFeedback = '垫子在狂叫！极高频次的爆卡已构成事实连败，不要硬抗概率，马上休息！';
    } else if (gap < -5) {
      luckMeter = '阴云密布 🌧️';
      luckFeedback = '运势略黑。官方概率未曾兑现，决策额叶易陷由于焦躁带来的报复性连爆。';
    }

    const netCumulative = records.reduce((sum, r) => sum + r.netChange, 0);

    // Streaks
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    for (let i = 0; i < records.length; i++) {
      if (records[i].success) {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      }
    }

    let currentStreakType: 'win' | 'loss' | 'none' = 'none';
    let currentStreakCount = 0;
    if (records.length > 0) {
      const lastIsWin = records[records.length - 1].success;
      currentStreakType = lastIsWin ? 'win' : 'loss';
      for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].success === lastIsWin) {
          currentStreakCount++;
        } else {
          break;
        }
      }
    }

    return {
      total,
      wins,
      losses,
      actualRate,
      expectedRateAvg,
      luckMeter,
      luckFeedback,
      netCumulative,
      maxWinStreak,
      maxLossStreak,
      currentStreakType,
      currentStreakCount,
    };
  }, [records]);

  // 3. Custom beautiful robust SVG path for Sparkline
  const sparklineSVG = useMemo(() => {
    if (wealthTrend.length < 2) return null;

    const width = 340;
    const height = 75;
    const paddingY = 8;
    const minVal = Math.min(...wealthTrend);
    const maxVal = Math.max(...wealthTrend);
    const valueRange = maxVal - minVal || 1;

    const points = wealthTrend.map((v, idx) => {
      const x = (idx / (wealthTrend.length - 1)) * width;
      const y = height - paddingY - ((v - minVal) / valueRange) * (height - 2 * paddingY);
      return { x, y };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return {
      width,
      height,
      linePath,
      areaPath,
      minVal,
      maxVal,
      isUp: wealthTrend[wealthTrend.length - 1] >= wealthTrend[0],
    };
  }, [wealthTrend]);

  // 4. Deterministic text report generator for easy copying
  const reportText = useMemo(() => {
    const timeNow = new Date().toLocaleString('zh-CN', { hour12: false });
    const netTxt = stats.netCumulative >= 0 ? `盈利 +${stats.netCumulative}张` : `回撤 ${stats.netCumulative}张`;
    const drawPercent = sanityMetrics.maxDrawdownPercent.toFixed(1);

    return `=== NBA2KOL2 合卡理智操盘报告 ===
■ 报告生成: ${timeNow}
■ 本轮初始: ${initialCards} 张标准底卡
■ 当前资本: ${currentCards} 张 (净盈亏: ${netTxt})
■ 最大回撤: ${drawPercent}% (保护上限: ${drawDownLimitPercent}%)
■ 合卡次数: ${stats.total} 次 (成功: ${stats.wins} 次 | 失败: ${stats.losses} 次)
■ 概率对比: 实测胜率 ${stats.actualRate.toFixed(1)}% (官方期望均值: ${stats.expectedRateAvg.toFixed(1)}%)
■ 运气评估: ${stats.luckMeter}
■ 极端连击: 最高 ${stats.maxWinStreak} 连红 / 最高 ${stats.maxLossStreak} 连黑
■ 理智评级: ${sanityMetrics.score}分 - ${sanityMetrics.status.toUpperCase()}
■ 操盘鉴定: ${sanityMetrics.advice}
■ 自救意见: 合卡切记概率守恒，理性回吐止损。留得底卡在，不怕没星升！
=================================`;
  }, [records, initialCards, currentCards, stats, sanityMetrics, drawDownLimitPercent]);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerateImage = async () => {
    playClickSound();
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `理智操盘报告_${new Date().getTime()}.png`;
      link.click();
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to generate image with html2canvas, trying html-to-image fallback', error);
      try {
        const dataUrl = await htmlToImage.toPng(reportRef.current, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff'
        });
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `理智操盘报告_${new Date().getTime()}.png`;
        link.click();
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Failed fallback', fallbackError);
        alert('生成图片失败，请稍后重试');
      }
    }
  };



  // Human diagnosis details depending on consecutive loss and drawdown values
  const cognitiveDiagnosis = useMemo(() => {
    if (stats.total === 0) {
      return {
        biasName: '虚空以待 ⏱️',
        biasDes: '账簿内暂未包含记账，多做几次合卡即可为你剖析操盘心理学错觉。',
      };
    }

    if (sanityMetrics.status === 'breached' || sanityMetrics.maxDrawdownPercent >= drawDownLimitPercent) {
      return {
        biasName: '『防线击穿 · 正发生暴走赌徒倾斜』',
        biasDes: '您的硬性净资产缩水已经击穿您个人设定的红线。认知心理学显示当前额叶前皮层完全失去理智主导权，继续合卡将发生“彻底清仓”式的暴怒强化！请立即离开设备。',
      };
    }

    const currentLossStreak = stats.currentStreakType === 'loss' ? stats.currentStreakCount : 0;
    if (currentLossStreak >= 3) {
      return {
        biasName: '『垫子自欺欺人错觉』',
        biasDes: '您当前陷入了经典的“垫子谬误”。即幻想“我已经爆了这么多次，下一次合主卡必然会成了吧”。事实上，每一次合卡都是纯粹的独立事件！垫子爆几百发也完全无法提高下一发的数学成功概率。',
      };
    }

    if (stats.currentStreakType === 'win' && stats.currentStreakCount >= 3) {
      return {
        biasName: '『高傲必败幸存者偏差』',
        biasDes: '连续成功让您的大脑分泌了过量的多巴胺，产生了“我今天手气无敌、合什么成什么”的高傲幻觉。请注意：这纯粹是期望正常的波峰，此时如果盲目上头进行高额极简突破，必定会发生巨大反噬！',
      };
    }

    if (stats.currentStreakType === 'win' && stats.currentStreakCount > 0) {
      return {
        biasName: '『连败终结 · 理智回归中』',
        biasDes: '恭喜！您成功终结了连黑，当前的强化已经回到正向收益区间，前期的“垫子催眠”已被事实打破。请保持当前科学配比方案，不要因单次成功便盲目加大主卡筹码。',
      };
    }

    if (stats.total > 10 && stats.actualRate < stats.expectedRateAvg) {
      return {
        biasName: '『热手回归 / 趋均值回归法则』',
        biasDes: '实测胜率低于官方标称，属于概率的正常左侧波折。保持平和情绪，不要通过仓促追加大额大底去拼概率，根据大数定律，胜率将在未来长期缓慢拉回到期望中轴线上。',
      };
    }

    return {
      biasName: '『温和平理智状态』',
      biasDes: '操作中规中矩，账簿盈亏波动健康。基本实现了科学底卡换算，请守住当前的防御滑坡线，理智操盘。',
    };
  }, [stats, sanityMetrics, drawDownLimitPercent]);

  return (
    <div className={`flex-1 overflow-y-auto scrollbar-thin px-4 py-3 pb-6 flex flex-col space-y-4 font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-zinc-100' : 'text-gray-900 bg-gray-50'
    }`}>
      
      {/* SECTION 1: Active Sparkline Trend Graph */}
      <div className={`border rounded-2xl p-4 shadow-sm shrink-0 overflow-hidden relative transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center selection:bg-transparent ${
            theme === 'dark' ? 'text-zinc-100' : 'text-gray-900'
          }`}>
            <Activity className="w-3.5 h-3.5 text-emerald-500 mr-2 animate-pulse" />
            本场资本回撤&波动趋势 (Wealth Curve)
          </span>
          <span className={`text-[9.5px] font-mono ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            初始 {initialCards}张 → 当前 {currentCards}张
          </span>
        </div>

        {sparklineSVG ? (
          <div className={`relative mt-1 mb-1 p-2 rounded-xl border transition-colors ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <svg 
              viewBox={`0 0 ${sparklineSVG.width} ${sparklineSVG.height}`} 
              className="w-full h-18 pointer-events-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chart-area-emerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chart-area-rose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Central base indicator line */}
              <line x1="0" y1="37" x2="340" y2="37" stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} strokeWidth="1" strokeDasharray="4 4" />

              {/* Area */}
              <path
                d={sparklineSVG.areaPath}
                fill={sparklineSVG.isUp ? 'url(#chart-area-emerald)' : 'url(#chart-area-rose)'}
              />

              {/* Stroke */}
              <path
                d={sparklineSVG.linePath}
                fill="none"
                stroke={sparklineSVG.isUp ? '#10b981' : '#ef4444'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* End tracker dot */}
              <circle
                cx={340}
                cy={sparklineSVG.linePath.split(' ').slice(-2).map(Number)[1] || 37}
                r="3.5"
                fill={sparklineSVG.isUp ? '#34d399' : '#f87171'}
                className="animate-ping"
              />
            </svg>

            <div className={`flex justify-between text-[8px] font-mono mt-1 px-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
              <span>底卡波谷: {sparklineSVG.minVal} 张</span>
              <span>资产峰会: {sparklineSVG.maxVal} 张</span>
            </div>
          </div>
        ) : (
          <div className={`py-6 text-center text-[10.5px] border border-dashed rounded-xl my-1 transition-colors ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-zinc-500 bg-slate-950/30' : 'text-gray-500 bg-gray-50 border-gray-300'
          }`}>
            暂无波动走势。请开始记录首张合卡，系统将自动描绘大底卡盈亏回归线。
          </div>
        )}
      </div>

      {/* SECTION 2: Empirical Analysis Grid */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        
        {/* Empirical Probability VS Expected Probability */}
        <div className={`border rounded-2xl p-3 flex flex-col justify-between shadow-sm transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
        }`}>
          <div className={`flex items-center space-x-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold">实测胜率 vs 官方胜率</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1">
              <span className={`text-xl font-black font-mono ${
                stats.actualRate >= stats.expectedRateAvg 
                  ? 'text-emerald-500' 
                  : theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'
              }`}>
                {stats.actualRate.toFixed(1)}%
              </span>
              <span className={`text-[9px] ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                / {stats.expectedRateAvg.toFixed(1)}%
              </span>
            </div>
            <div className={`text-[9px] mt-0.5 truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
              偏离值: {(stats.actualRate - stats.expectedRateAvg).toFixed(1)}%
            </div>
          </div>
          <span className={`text-[9px] font-bold truncate border p-1 rounded-lg text-center ${
            theme === 'dark' 
              ? 'text-zinc-300 bg-slate-950 border-slate-800' 
              : 'text-gray-700 bg-gray-105 bg-gray-100 border-gray-200'
          }`}>
            气运评定: <span className="text-amber-500 font-extrabold">{stats.luckMeter}</span>
          </span>
        </div>

        {/* Victory/Loss Streak widget */}
        <div className={`border rounded-2xl p-3 flex flex-col justify-between shadow-sm transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
        }`}>
          <div className={`flex items-center space-x-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-bold">本轮合卡战绩纪录</span>
          </div>
          <div className="my-1.5">
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
              <div className={`p-1.5 rounded text-center transition-colors ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <span className={`text-[8.5px] block ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>最高连红</span>
                <span className="text-emerald-500 font-bold text-xs">{stats.maxWinStreak} 连</span>
              </div>
              <div className={`p-1.5 rounded text-center transition-colors ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <span className={`text-[8.5px] block ${theme === 'dark' ? 'text-zinc-400 text-zinc-500' : 'text-gray-500'}`}>最高连黑</span>
                <span className="text-red-500 font-bold text-xs">{stats.maxLossStreak} 连</span>
              </div>
            </div>
          </div>
          <div className={`text-[9.5px] p-0.5 rounded font-bold text-center ${
            stats.currentStreakType === 'win' 
              ? 'text-emerald-700 bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40' 
              : stats.currentStreakType === 'loss' 
              ? theme === 'dark'
                ? 'text-rose-400 bg-rose-950/20 border border-rose-900/40 animate-pulse font-extrabold'
                : 'text-red-700 bg-red-100 border border-red-200 animate-pulse' 
              : theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'
          }`}>
            {stats.currentStreakType === 'win' ? `🔥 连红中 +${stats.currentStreakCount}` : stats.currentStreakType === 'loss' ? `💀 连黑中 -${stats.currentStreakCount}` : '无排队'}
          </div>
        </div>

      </div>

      {/* SECTION 3: Main Diagnostic Sheet and One-click Copy */}
      <div className={`border rounded-2xl p-4 flex flex-col space-y-3 relative shadow-sm transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-black flex items-center tracking-wider px-2.5 py-1 rounded-lg border shadow-inner transition-colors duration-300 ${
            theme === 'dark' 
              ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/45' 
              : 'text-emerald-600 bg-emerald-50 border-emerald-200/60'
          }`}>
            <BookOpen className="w-4 h-4 mr-2" />
            操盘诊断白皮书
          </span>

          <button
            id="btn-copy-report"
            onClick={handleGenerateImage}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all active:scale-[0.97] cursor-pointer ${
              copied 
                ? 'bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 text-emerald-700 border border-emerald-300 dark:border-emerald-900' 
                : theme === 'dark'
                  ? 'bg-slate-950 text-zinc-300 hover:bg-slate-800 border border-slate-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>生成成功</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>生成报告图</span>
              </>
            )}
          </button>
        </div>

        {/* Elegant Visual Presentation of the Report (instead of plain text block) */}
        <div 
          ref={reportRef} 
          className={`border rounded-xl overflow-hidden divide-y flex flex-col shadow-sm transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-slate-950 border-slate-800 divide-slate-800' 
              : 'bg-white border-gray-200 divide-gray-100'
          }`}
        >
          <div className={`px-3 py-2 flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-slate-900/30' : ''}`}>
             <span className={`flex items-center ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
               <Activity className="w-3 h-3 mr-1.5" />
               当前资本余额
             </span>
             <span className={`font-mono font-black ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>
               {currentCards} 张 <span className={stats.netCumulative >= 0 ? "text-emerald-500" : "text-rose-500 font-semibold"}>({stats.netCumulative >= 0 ? '+' : ''}{stats.netCumulative})</span>
             </span>
          </div>

          <div className={`px-3 py-2 flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-slate-950/40' : 'bg-gray-50'}`}>
             <span className={`flex items-center ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
               <Scale className="w-3 h-3 mr-1.5" />
               整体偏离实测胜率
             </span>
             <span className={`font-mono font-bold ${stats.actualRate >= stats.expectedRateAvg ? 'text-emerald-500' : theme === 'dark' ? 'text-zinc-300' : 'text-gray-800'}`}>
               {stats.actualRate.toFixed(1)}% <span className="text-gray-400 dark:text-zinc-500 font-normal text-[10px]">官方期望{stats.expectedRateAvg.toFixed(1)}%</span>
             </span>
          </div>

          <div className={`px-3 py-2 flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-slate-900/30' : ''}`}>
             <span className={`flex items-center ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
               <Flame className="w-3 h-3 mr-1.5" />
               波谷回撤警戒监控
             </span>
             <span className={`font-mono ${sanityMetrics.maxDrawdownPercent >= drawDownLimitPercent ? 'text-rose-500 font-black animate-pulse' : theme === 'dark' ? 'text-zinc-300 font-bold' : 'text-gray-700'}`}>{sanityMetrics.maxDrawdownPercent.toFixed(1)}% <span className="text-gray-400 dark:text-zinc-500 font-normal text-[10px]">阈值 {drawDownLimitPercent}%</span></span>
          </div>

          <div className={`px-3 py-2 flex items-center justify-between text-[11px] ${theme === 'dark' ? 'bg-slate-950/40' : 'bg-gray-50'}`}>
             <span className={theme === 'dark' ? 'text-zinc-400 font-medium' : 'text-gray-500'}>极端峰值连转</span>
             <span className={`font-mono font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-600'}`}><span className="text-emerald-500">最高连红<span className="font-black text-[13px] mx-0.5">{stats.maxWinStreak}</span>发</span> <span className="mx-1 text-gray-500">|</span> <span className="text-rose-500">最高连黑<span className="font-black text-[13px] mx-0.5">{stats.maxLossStreak}</span>发</span></span>
          </div>

          <div className={`px-3 py-2.5 text-[11px] leading-relaxed font-normal ${theme === 'dark' ? 'bg-slate-905 bg-slate-900/30 text-zinc-300' : 'bg-white text-gray-750'}`}>
             <span className={`font-extrabold flex items-center mb-1 text-[10.5px] ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-800'}`}>
                <ShieldAlert className="w-3 h-3 mr-1.5 text-amber-500" />
                理智系统鉴定意见 ({stats.luckMeter})
             </span>
             {sanityMetrics.advice}
          </div>
        </div>

        {/* Cognitive Bias Section */}
        <div className={`border p-3 rounded-xl flex items-start space-x-2.5 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'
        }`}>
          <Compass className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-sm text-emerald-500 font-bold">{cognitiveDiagnosis.biasName}</span>
            <span className={`text-xs leading-relaxed mt-1 font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>{cognitiveDiagnosis.biasDes}</span>
          </div>
        </div>

        {/* Cognitive Fallacy Breaker Trigger & Calming Rescue button */}
        <div className="pt-1 flex items-center justify-between">
          <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>理智指数得分: {sanityMetrics.score}/100</span>
          <button
            id="btn-manual-breathing-report"
            onClick={onTriggerManualBreathing}
            className={`text-xs font-semibold flex items-center p-1.5 px-3 rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer ${
              theme === 'dark' 
                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 hover:bg-emerald-900/20' 
                : 'text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-red-500 mr-1.5 animate-pulse" />
            深呼吸物理自救 (3s)
          </button>
        </div>
      </div>

      {/* SECTION 4: Defensive Redlines (Sliding safety limit) */}
      <div className={`border rounded-2xl p-4 shadow-sm shrink-0 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <label className={`text-xs font-semibold flex items-center cursor-pointer ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            理智回撤硬防御警戒线 (%)
          </label>
          <span className="text-xs text-amber-500 font-mono font-bold">
            {drawDownLimitPercent}% 跌幅
          </span>
        </div>
        <p className={`text-[9.5px] mb-3 leading-normal transition-colors ${theme === 'dark' ? 'text-zinc-400 font-normal' : 'text-gray-500'}`}>
          行为心理止损设防：当底卡波动幅度回撤超过此红线时，主面板将强制封印合卡3秒，自动拦截暴走。
        </p>

        {/* Standard high tactility Slider */}
        <div className="flex items-center space-x-3">
          <span className={`text-[9.5px] font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>10%</span>
          <input
            id="drawdown-limit-slider"
            type="range"
            min={10}
            max={80}
            step={5}
            value={drawDownLimitPercent}
            onChange={(e) => {
              playClickSound();
              setDrawDownLimitPercent(parseInt(e.target.value));
            }}
            className={`flex-1 accent-emerald-500 h-1.5 rounded-lg cursor-pointer appearance-none ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
            }`}
          />
          <span className={`text-[9.5px] font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>80%</span>
        </div>
      </div>

      {/* SECTION 5: Real-time Chronological Ledger Items list with Individual Rollbacks */}
      <div className="flex-1 flex flex-col space-y-2">
        <label className={`text-[10px] uppercase tracking-wider font-bold flex items-center shrink-0 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
          <BookOpen className="w-3.5 h-3.5 mr-1.5 text-gray-450" />
          全息账目明细流水及防错回滚 ({records.length})
        </label>

        {records.length === 0 ? (
          <div className={`flex-1 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 min-h-[180px] transition-colors ${
            theme === 'dark' ? 'bg-slate-900/30 border-slate-800 text-zinc-500' : 'border-gray-300 bg-gray-50 text-gray-500'
          }`}>
            <p className="text-[10px]">
              暂无合卡流水。在上一页登记的每一发升星或爆卡数据将完整呈现在此处。
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-2 pr-1">
            {records.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className={`border rounded-xl p-3 flex items-center justify-between transition-all relative shadow-sm ${
                  theme === 'dark' 
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-xl ${
                  entry.success ? 'bg-emerald-500' : 'bg-red-500'
                }`} />

                <div className="pl-2.5 flex-1 flex flex-col min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-zinc-200' : 'text-gray-900'}`}>
                      {entry.title}
                    </span>
                    <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                      {entry.formulaName}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono mt-0.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-gray-500'}`}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · 官方几率 {entry.successRate}%
                  </span>
                </div>

                <div className="flex items-center space-x-3 shrink-0 ml-2">
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono ${
                      entry.success ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {entry.success ? '+' : ''}{entry.netChange} 张
                    </span>
                    <span className={`text-[8.5px] block font-mono ${theme === 'dark' ? 'text-zinc-550 text-zinc-550 text-zinc-500' : 'text-gray-500'}`}>
                      得分: {entry.sanityScoreAfter}%
                    </span>
                  </div>

                  <button
                    id={`delete-record-report-${entry.id}`}
                    onClick={() => {
                      if (confirm('确定要撤销并回滚本笔账目？这会关联影响大底卡余额及胜率计算的值。')) {
                        playClickSound();
                        onDeleteRecord(entry.id);
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition-all active:scale-[0.93] ${
                      theme === 'dark' 
                        ? 'bg-slate-800 border-slate-700 text-zinc-400 hover:text-red-400 hover:bg-slate-750' 
                        : 'bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 border-gray-200'
                    }`}
                    title="回滚该条记账"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



    </div>
  );
}
