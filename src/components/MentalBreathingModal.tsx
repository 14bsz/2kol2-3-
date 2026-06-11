/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Wind, Heart, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';
import { MIND_COGNITIVE_CARDS } from '../data';

interface MentalBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sanityScore: number;
  soundEnabled: boolean;
  theme?: 'light' | 'dark';
}

export default function MentalBreathingModal({
  isOpen,
  onClose,
  sanityScore,
  soundEnabled,
  theme = 'light',
}: MentalBreathingModalProps) {
  const [countdown, setCountdown] = useState(3);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathTimer, setBreathTimer] = useState(0); // 0 to 100 for visual scaling
  const [fallacyCard, setFallacyCard] = useState(MIND_COGNITIVE_CARDS[0]);

  // Handle cognitive card randomization
  useEffect(() => {
    if (isOpen) {
      const idx = Math.floor(Math.random() * MIND_COGNITIVE_CARDS.length);
      setFallacyCard(MIND_COGNITIVE_CARDS[idx]);
      setCountdown(3);

      // Play continuous calming tone
      if (soundEnabled && typeof window !== 'undefined') {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            
            // Generate simple meditative harmonic pad
            const playWarmTone = (freq: number, start: number, duration: number, vol: number) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, start);
              
              gain.gain.setValueAtTime(0, start);
              gain.gain.linearRampToValueAtTime(vol, start + 0.3);
              gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
              
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(start);
              osc.stop(start + duration);
            };

            // Play a pentatonic soothing chord
            playWarmTone(196.00, ctx.currentTime, 3, 0.1); // G3
            playWarmTone(246.94, ctx.currentTime + 0.2, 3, 0.08); // B3
            playWarmTone(293.66, ctx.currentTime + 0.4, 3, 0.08); // D4
            playWarmTone(392.00, ctx.currentTime + 0.6, 2.5, 0.05); // G4
          }
        } catch (e) {
          console.warn('Audio feedback error:', e);
        }
      }
    }
  }, [isOpen]);

  // Handle absolute strict cooldown countdown
  useEffect(() => {
    if (!isOpen) return;
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  // Hand-craft a highly dynamic visual breathing animation loop
  useEffect(() => {
    if (!isOpen) return;

    let intervalId = setInterval(() => {
      setBreathTimer((prev) => {
        const next = (prev + 1.5) % 100;
        
        // Map 0-100 to Inhale (0-40), Hold (40-60), Exhale (60-100)
        if (next < 40) {
          setBreathPhase('inhale');
        } else if (next < 60) {
          setBreathPhase('hold');
        } else {
          setBreathPhase('exhale');
        }
        return next;
      });
    }, 45);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute visual circle scale according to phase
  let circleScale = 1.0;
  let breathCueText = '深吸一口气...';
  let cueColor = 'text-sky-500';

  if (breathPhase === 'inhale') {
    // scale from 1.0 to 1.4
    const ratio = (breathTimer / 40);
    circleScale = 1.0 + ratio * 0.4;
    breathCueText = '缓缓吸气 · 卡量只是数字';
    cueColor = 'text-emerald-600';
  } else if (breathPhase === 'hold') {
    circleScale = 1.4;
    breathCueText = '屏息屏气 · 让理智归位';
    cueColor = 'text-amber-600 font-medium';
  } else {
    // scale from 1.4 down to 1.0
    const ratio = ((breathTimer - 60) / 40);
    circleScale = 1.4 - ratio * 0.4;
    breathCueText = '慢慢呼气 · 沉没成本已是过去';
    cueColor = 'text-sky-500';
  }

  return (
    <div className={`absolute inset-0 z-50 flex flex-col p-6 select-none animate-fade-in overflow-y-auto scrollbar-thin transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950/98 text-zinc-100' : 'bg-white/98 text-gray-900'
    }`}>
      
      {/* Upper Alerts & Warning Bar */}
      <div className="w-full flex flex-col items-center text-center mt-3 shrink-0">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-3 animate-pulse shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-red-500 text-lg font-bold tracking-widest">
          【 情绪红色警报 · 强制冷静 】
        </h2>
        <p className={`text-xs mt-1 px-4 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>
          您的理智值得分极低 ({sanityScore}%)。
          根据行为经济学，您当前的决策大脑已进入“边缘系统劫持”阶段，请务必暂停一切合卡操作！
        </p>
      </div>

      {/* Breathing Ring and Visual Guide Centerpiece */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 min-h-[160px] shrink-0">
        
        {/* Pulsing Breathing Ring with glowing aura */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          
          {/* Outer Ambient Glow ring */}
          <div 
            className="absolute rounded-full border-2 border-dashed border-emerald-500/20 transition-all duration-300 pointer-events-none"
            style={{ 
              transform: `scale(${circleScale * 1.15})`,
              opacity: breathPhase === 'inhale' ? 0.8 : 0.4
            }}
          />

          {/* Core Breathing pulse sphere */}
          <div 
            className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600/20 to-sky-600/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-75"
            style={{ 
              transform: `scale(${circleScale})` 
            }}
          />

          <div className="z-10 flex flex-col items-center justify-center">
            {breathPhase === 'inhale' && <Wind className="w-7 h-7 text-emerald-500 animate-pulse" />}
            {breathPhase === 'hold' && <BrainCircuit className="w-7 h-7 text-amber-500" />}
            {breathPhase === 'exhale' && <Heart className="w-7 h-7 text-sky-500 animate-pulse" />}
          </div>
        </div>

        {/* Dynamic Instructional Text */}
        <div className={`mt-6 text-[13px] text-center font-semibold tracking-wide h-6 transition-all duration-300 ${cueColor}`}>
          {breathCueText}
        </div>
      </div>

      {/* Core Fallacy Mental Dissection Board (Bento style widget) */}
      <div className={`w-full border shadow-sm rounded-2xl p-4 mb-4 relative shrink-0 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>理智自醒 · 科学辟谣</span>
        </div>
        <h4 className={`font-semibold text-sm mb-1.5 flex items-center shrink-0 ${theme === 'dark' ? 'text-zinc-100' : 'text-gray-900'}`}>
          <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full mr-1.5 inline-block" />
          {fallacyCard.title}
        </h4>
        <div className="pt-1">
          <p className={`text-[11px] leading-relaxed whitespace-pre-line p-2.5 rounded-lg border font-mono transition-colors duration-300 ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-zinc-300' : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            {fallacyCard.content}
          </p>
        </div>
      </div>

      {/* Mandatory action lock bar */}
      <div className="w-full pb-3 shrink-0">
        <button
          id="btn-breathing-confirm"
          disabled={countdown > 0}
          onClick={onClose}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center transition-all duration-300 ${
            countdown > 0
              ? theme === 'dark' 
                ? 'bg-slate-900 text-zinc-500 border border-slate-800 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-[0.98] shadow-lg shadow-emerald-500/20 border border-emerald-400'
          }`}
        >
          {countdown > 0 ? (
            <span className="flex items-center space-x-2">
              <span>请深呼吸冷静中 ({countdown}s)...</span>
            </span>
          ) : (
            <span>我已阅读并完全恢复理智</span>
          )}
        </button>
      </div>

    </div>
  );
}
