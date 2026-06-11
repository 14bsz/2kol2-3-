export interface UpgradeRule {
  id: string
  targetStar: number
  formulaName: string
  displayName: string
  successRate: number
  targetBaseCards: number
  subCards: number
  failLoss: number
  successGain: number
}

export interface RecordEntry {
  id: string
  timestamp: string
  ruleId: string
  formulaName: string
  targetStar: number
  successRate: number
  success: boolean
  failLoss: number
  successGain: number
  netChange: number
  sanityScoreBefore: number
  sanityScoreAfter: number
  title: string
}

export type SanityStatusType = 'excellent' | 'normal' | 'warn' | 'danger' | 'breached'

export interface SanityMetrics {
  score: number
  status: SanityStatusType
  advice: string
  colorClass: string
  recentFailStreak: number
  consecutiveWins: number
  consecutiveLosses: number
  maxDrawdown: number
  maxDrawdownPercent: number
}

export const STORAGE_KEYS = {
  initialCards: 'nba2k_init_cards_v1',
  records: 'nba2k_records_v1',
  soundEnabled: 'nba2k_sound_v1',
  selectedRuleId: 'nba2k_curr_rule_v1',
  drawDownLimitPercent: 'nba2k_drawdown_limit_v1',
  theme: 'nba2k_theme_v1',
  forceCalmAlertShown: 'nba2k_force_calm_alert_shown_v1',
} as const

export const DEFAULT_THEME = 'light'
export const DEFAULT_SELECTED_RULE_ID = '5_4'
export const DEFAULT_INITIAL_CARDS = 40
export const DEFAULT_DRAWDOWN_LIMIT = 35
export const DEFAULT_SOUND_ENABLED = true

export const UPGRADE_RULES: UpgradeRule[] = [
  { id: '2_1', targetStar: 2, formulaName: '1 突（1 张）', displayName: '1突 (本体) + 1突 (辅卡)', successRate: 48, targetBaseCards: 2, subCards: 1, failLoss: 1, successGain: 1 },
  { id: '3_1', targetStar: 3, formulaName: '1 突（1 张）', displayName: '2突 (本体) + 1突', successRate: 24, targetBaseCards: 4, subCards: 1, failLoss: 1, successGain: 3 },
  { id: '3_2', targetStar: 3, formulaName: '2 突（2 张）', displayName: '2突 (本体) + 2突', successRate: 48, targetBaseCards: 4, subCards: 2, failLoss: 2, successGain: 2 },
  { id: '3_2_2s', targetStar: 3, formulaName: '2 突 2 星（3 张）', displayName: '2突 (本体) + 2突2星', successRate: 72, targetBaseCards: 4, subCards: 3, failLoss: 3, successGain: 1 },
  { id: '4_1', targetStar: 4, formulaName: '1 突（1 张）', displayName: '3突 (本体) + 1突', successRate: 12, targetBaseCards: 8, subCards: 1, failLoss: 1, successGain: 7 },
  { id: '4_2', targetStar: 4, formulaName: '2 突（2 张）', displayName: '3突 (本体) + 2突', successRate: 24, targetBaseCards: 8, subCards: 2, failLoss: 2, successGain: 6 },
  { id: '4_2_2s', targetStar: 4, formulaName: '2 突 2 星（3 张）', displayName: '3突 (本体) + 2突2星', successRate: 36, targetBaseCards: 8, subCards: 3, failLoss: 3, successGain: 5 },
  { id: '4_3', targetStar: 4, formulaName: '3 突（4 张）', displayName: '3突 (本体) + 3突', successRate: 48, targetBaseCards: 8, subCards: 4, failLoss: 4, successGain: 4 },
  { id: '4_3_1s', targetStar: 4, formulaName: '3 突 1 星（5 张）', displayName: '3突 (本体) + 3突1星', successRate: 60, targetBaseCards: 8, subCards: 5, failLoss: 5, successGain: 3 },
  { id: '4_3_2s', targetStar: 4, formulaName: '3 突 2 星（6 张）', displayName: '3突 (本体) + 3突2星', successRate: 72, targetBaseCards: 8, subCards: 6, failLoss: 6, successGain: 2 },
  { id: '4_3_3s', targetStar: 4, formulaName: '3 突 3 星（7 张）', displayName: '3突 (本体) + 3突3星', successRate: 84, targetBaseCards: 8, subCards: 7, failLoss: 7, successGain: 1 },
  { id: '5_1', targetStar: 5, formulaName: '1 突（1 张）', displayName: '4突 (本体) + 1突', successRate: 6, targetBaseCards: 16, subCards: 1, failLoss: 1, successGain: 15 },
  { id: '5_2', targetStar: 5, formulaName: '2 突（2 张）', displayName: '4突 (本体) + 2突', successRate: 12, targetBaseCards: 16, subCards: 2, failLoss: 2, successGain: 14 },
  { id: '5_2_2s', targetStar: 5, formulaName: '2 突 2 星（3 张）', displayName: '4突 (本体) + 2突2星', successRate: 18, targetBaseCards: 16, subCards: 3, failLoss: 3, successGain: 13 },
  { id: '5_3', targetStar: 5, formulaName: '3 突（4 张）', displayName: '4突 (本体) + 3突', successRate: 24, targetBaseCards: 16, subCards: 4, failLoss: 4, successGain: 12 },
  { id: '5_3_1s', targetStar: 5, formulaName: '3 突 1 星（5 张）', displayName: '4突 (本体) + 3突1星', successRate: 30, targetBaseCards: 16, subCards: 5, failLoss: 5, successGain: 11 },
  { id: '5_3_2s', targetStar: 5, formulaName: '3 突 2 星（6 张）', displayName: '4突 (本体) + 3突2星', successRate: 36, targetBaseCards: 16, subCards: 6, failLoss: 6, successGain: 10 },
  { id: '5_3_3s', targetStar: 5, formulaName: '3 突 3 星（7 张）', displayName: '4突 (本体) + 3突3星', successRate: 42, targetBaseCards: 16, subCards: 7, failLoss: 7, successGain: 9 },
  { id: '5_4', targetStar: 5, formulaName: '4 突（8 张）', displayName: '4突 (本体) + 4突', successRate: 48, targetBaseCards: 16, subCards: 8, failLoss: 8, successGain: 8 },
  { id: '5_4_p1', targetStar: 5, formulaName: '4 突带 1 张（9 张）', displayName: '4突 (本体) + 4突带1张', successRate: 54, targetBaseCards: 16, subCards: 9, failLoss: 9, successGain: 7 },
  { id: '5_4_1s', targetStar: 5, formulaName: '4 突 1 星（10 张）', displayName: '4突 (本体) + 4突1星', successRate: 60, targetBaseCards: 16, subCards: 10, failLoss: 10, successGain: 6 },
  { id: '5_4_1s_p1', targetStar: 5, formulaName: '4 突 1 星带 1 张（11 张）', displayName: '4突 (本体) + 4突1星带1张', successRate: 66, targetBaseCards: 16, subCards: 11, failLoss: 11, successGain: 5 },
  { id: '5_4_2s', targetStar: 5, formulaName: '4 突 2 星（12 张）', displayName: '4突 (本体) + 4突2星', successRate: 72, targetBaseCards: 16, subCards: 12, failLoss: 12, successGain: 4 },
  { id: '5_4_2s_p1', targetStar: 5, formulaName: '4 突 2 星带 1 张（13 张）', displayName: '4突 (本体) + 4突2星带1张', successRate: 78, targetBaseCards: 16, subCards: 13, failLoss: 13, successGain: 3 },
  { id: '5_4_3s', targetStar: 5, formulaName: '4 突 3 星（14 张）', displayName: '4突 (本体) + 4突3星', successRate: 84, targetBaseCards: 16, subCards: 14, failLoss: 14, successGain: 2 },
  { id: '6_1', targetStar: 6, formulaName: '1 突（1 张）', displayName: '5突 (本体) + 1突', successRate: 3, targetBaseCards: 32, subCards: 1, failLoss: 1, successGain: 31 },
  { id: '6_2', targetStar: 6, formulaName: '2 突（2 张）', displayName: '5突 (本体) + 2突', successRate: 6, targetBaseCards: 32, subCards: 2, failLoss: 2, successGain: 30 },
  { id: '6_2_2s', targetStar: 6, formulaName: '2 突 2 星（3 张）', displayName: '5突 (本体) + 2突2星', successRate: 9, targetBaseCards: 32, subCards: 3, failLoss: 3, successGain: 29 },
  { id: '6_3', targetStar: 6, formulaName: '3 突（4 张）', displayName: '5突 (本体) + 3突', successRate: 12, targetBaseCards: 32, subCards: 4, failLoss: 4, successGain: 28 },
  { id: '6_3_1s', targetStar: 6, formulaName: '3 突 1 星（5 张）', displayName: '5突 (本体) + 3突1星', successRate: 15, targetBaseCards: 32, subCards: 5, failLoss: 5, successGain: 27 },
  { id: '6_3_2s', targetStar: 6, formulaName: '3 突 2 星（6 张）', displayName: '5突 (本体) + 3突2星', successRate: 18, targetBaseCards: 32, subCards: 6, failLoss: 6, successGain: 26 },
  { id: '6_3_3s', targetStar: 6, formulaName: '3 突 3 星（7 张）', displayName: '5突 (本体) + 3突3星', successRate: 21, targetBaseCards: 32, subCards: 7, failLoss: 7, successGain: 25 },
  { id: '6_4', targetStar: 6, formulaName: '4 突（8 张）', displayName: '5突 (本体) + 4突', successRate: 24, targetBaseCards: 32, subCards: 8, failLoss: 8, successGain: 24 },
  { id: '6_4_p1', targetStar: 6, formulaName: '4 突带 1 张（9 张）', displayName: '5突 (本体) + 4突带1张', successRate: 27, targetBaseCards: 32, subCards: 9, failLoss: 9, successGain: 23 },
  { id: '6_4_1s', targetStar: 6, formulaName: '4 突 1 星（10 张）', displayName: '5突 (本体) + 4突1星', successRate: 30, targetBaseCards: 32, subCards: 10, failLoss: 10, successGain: 22 },
  { id: '6_4_1s_p1', targetStar: 6, formulaName: '4 突 1 星带 1 张（11 张）', displayName: '5突 (本体) + 4突1星带1张', successRate: 33, targetBaseCards: 32, subCards: 11, failLoss: 11, successGain: 21 },
  { id: '6_4_2s', targetStar: 6, formulaName: '4 突 2 星（12 张）', displayName: '5突 (本体) + 4突2星', successRate: 36, targetBaseCards: 32, subCards: 12, failLoss: 12, successGain: 20 },
  { id: '6_4_2s_p1', targetStar: 6, formulaName: '4 突 2 星带 1 张（13 张）', displayName: '5突 (本体) + 4突2星带1张', successRate: 39, targetBaseCards: 32, subCards: 13, failLoss: 13, successGain: 19 },
  { id: '6_4_3s', targetStar: 6, formulaName: '4 突 3 星（14 张）', displayName: '5突 (本体) + 4突3星', successRate: 42, targetBaseCards: 32, subCards: 14, failLoss: 14, successGain: 18 },
  { id: '6_4_3s_p1', targetStar: 6, formulaName: '4 突 3 星带 1 张（15 张）', displayName: '5突 (本体) + 4突3星带1张', successRate: 45, targetBaseCards: 32, subCards: 15, failLoss: 15, successGain: 17 },
  { id: '6_5', targetStar: 6, formulaName: '5 突（16 张）', displayName: '5突 (本体) + 5突', successRate: 48, targetBaseCards: 32, subCards: 16, failLoss: 16, successGain: 16 },
  { id: '6_5_p1', targetStar: 6, formulaName: '5 突带 1 张（17 张）', displayName: '5突 (本体) + 5突带1张', successRate: 51, targetBaseCards: 32, subCards: 17, failLoss: 17, successGain: 15 },
  { id: '6_5_p2', targetStar: 6, formulaName: '5 突带 2 张（18 张）', displayName: '5突 (本体) + 5突带2张', successRate: 54, targetBaseCards: 32, subCards: 18, failLoss: 18, successGain: 14 },
  { id: '6_5_p3', targetStar: 6, formulaName: '5 突带 3 张（19 张）', displayName: '5突 (本体) + 5突带3张', successRate: 57, targetBaseCards: 32, subCards: 19, failLoss: 19, successGain: 13 },
  { id: '6_5_1s', targetStar: 6, formulaName: '5 突 1 星（20 张）', displayName: '5突 (本体) + 5突1星', successRate: 60, targetBaseCards: 32, subCards: 20, failLoss: 20, successGain: 12 },
  { id: '6_5_1s_p1', targetStar: 6, formulaName: '5 突 1 星带 1 张（21 张）', displayName: '5突 (本体) + 5突1星带1张', successRate: 63, targetBaseCards: 32, subCards: 21, failLoss: 21, successGain: 11 },
  { id: '6_5_1s_p2', targetStar: 6, formulaName: '5 突 1 星带 2 张（22 张）', displayName: '5突 (本体) + 5突1星带2张', successRate: 66, targetBaseCards: 32, subCards: 22, failLoss: 22, successGain: 10 },
  { id: '6_5_1s_p3', targetStar: 6, formulaName: '5 突 1 星带 3 张（23 张）', displayName: '5突 (本体) + 5突1星带3张', successRate: 69, targetBaseCards: 32, subCards: 23, failLoss: 23, successGain: 9 },
  { id: '6_5_2s', targetStar: 6, formulaName: '5 突 2 星（24 张）', displayName: '5突 (本体) + 5突2星', successRate: 72, targetBaseCards: 32, subCards: 24, failLoss: 24, successGain: 8 },
  { id: '6_5_2s_p1', targetStar: 6, formulaName: '5 突 2 星带 1 张（25 张）', displayName: '5突 (本体) + 5突2星带1张', successRate: 75, targetBaseCards: 32, subCards: 25, failLoss: 25, successGain: 7 },
  { id: '6_5_2s_p2', targetStar: 6, formulaName: '5 突 2 星带 2 张（26 张）', displayName: '5突 (本体) + 5突2星带2张', successRate: 78, targetBaseCards: 32, subCards: 26, failLoss: 26, successGain: 6 },
  { id: '6_5_2s_p3', targetStar: 6, formulaName: '5 突 2 星带 3 张（27 张）', displayName: '5突 (本体) + 5突2星带3张', successRate: 81, targetBaseCards: 32, subCards: 27, failLoss: 27, successGain: 5 },
  { id: '6_5_3s', targetStar: 6, formulaName: '5 突 3 星（28 张）', displayName: '5突 (本体) + 5突3星', successRate: 84, targetBaseCards: 32, subCards: 28, failLoss: 28, successGain: 4 },
  { id: '6_5_3s_p1', targetStar: 6, formulaName: '5 突 3 星带 1 张（29 张）', displayName: '5突 (本体) + 5突3星带1张', successRate: 87, targetBaseCards: 32, subCards: 29, failLoss: 29, successGain: 3 },
  { id: '6_5_3s_p2', targetStar: 6, formulaName: '5 突 3 星带 2 张（30 张）', displayName: '5突 (本体) + 5突3星带2张', successRate: 90, targetBaseCards: 32, subCards: 30, failLoss: 30, successGain: 2 },
  { id: '6_5_3s_p3', targetStar: 6, formulaName: '5 突 3 星带 3 张（31 张）', displayName: '5突 (本体) + 5突3星带3张', successRate: 93, targetBaseCards: 32, subCards: 31, failLoss: 31, successGain: 1 },
]

export const MIND_COGNITIVE_CARDS = [
  {
    title: '「垫子/铺垫过载」认知幻觉',
    content: '玩家深信：「我前面连续爆掉了5次，按照概率，我的下一大卡这次肯定能成！」\n\n【科学解剖】：每一次独立的强化合卡在服务器端都属于离散随机事件，前面的失败无法提高下一局的客观中奖几率。垫子行为纯属心里寻求安慰与沉没成本自我催眠。',
  },
  {
    title: '「就差一次就回本」梭哈陷阱',
    content: '玩家深信：「今天已经亏损大半了，只要再拼一把大星，成了不仅能全部回本还能大赚！」\n\n【科学解剖】：当情绪进入绝望反弹时，决策耐受力极具下滑，玩家通常倾向于忽略概率和风险，强行选择低成功率甚至高折回亏损档位，导致最后的保险池也被荡涤一空。',
  },
  {
    title: '「这把系统在针对我」受害者怨气',
    content: '玩家在爆发连败后：「概率绝对被官方暗改了，这根本不是什么48%！我偏要干到底看它什么时候给我成！」\n\n【科学解剖】：局部大样本波动在小序列操作时完全有可能发生一波流极低极高偏离。理智的做法是暂时熔断，退出操盘期，远离由于偏执带来的无节制下注行为。',
  },
]
