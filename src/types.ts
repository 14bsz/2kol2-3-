/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UpgradeRule {
  id: string;
  targetStar: number; // 2, 3, 4, 5, 6
  formulaName: string; // e.g. "3+2"
  displayName: string; // e.g. "3 突 + 2 突"
  successRate: number; // percentage (e.g. 48)
  targetBaseCards: number; // base cards inside main card (e.g. 4 for 3突)
  subCards: number; // base cards inside subtitle card/add-ons (e.g. 2 for 2突)
  failLoss: number; // subCards
  successGain: number; // targetBaseCards - subCards
}

export interface RecordEntry {
  id: string;
  timestamp: string; // ISO String
  ruleId: string;
  formulaName: string;
  targetStar: number;
  successRate: number;
  success: boolean;
  failLoss: number;
  successGain: number;
  netChange: number; // successGain if success, -failLoss if fail
  sanityScoreBefore: number;
  sanityScoreAfter: number;
  title: string; // descriptive title
}

export type SanityStatusType = 'excellent' | 'normal' | 'warn' | 'danger' | 'breached';

export interface SanityMetrics {
  score: number;
  status: SanityStatusType;
  advice: string;
  colorClass: string;
  recentFailStreak: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  maxDrawdown: number; // maximum cards lost from peak
  maxDrawdownPercent: number; // percentage drawdown
}
