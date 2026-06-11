import {
  DEFAULT_DRAWDOWN_LIMIT,
  DEFAULT_INITIAL_CARDS,
  DEFAULT_SELECTED_RULE_ID,
  DEFAULT_SOUND_ENABLED,
  DEFAULT_THEME,
  MIND_COGNITIVE_CARDS,
  RecordEntry,
  SanityMetrics,
  STORAGE_KEYS,
  UPGRADE_RULES,
  UpgradeRule,
} from './guardian-data'
import { LUCIDE_ICON_MAP } from './guardian-icons'

export interface GuardianPersistentState {
  initialCards: number
  records: RecordEntry[]
  soundEnabled: boolean
  selectedRuleId: string
  drawDownLimitPercent: number
  theme: 'light' | 'dark'
  forceCalmAlertShown: boolean
}

export interface GuardianUiState {
  currentTab: 'console' | 'report'
  activeStarTab: number
  showReportBadge: boolean
  showStrategyHelp: boolean
  isExclusivePanelExpanded: boolean
  isBreathingModalOpen: boolean
  breathingCountdown: number
  breathingTimer: number
  breathingPhase: 'inhale' | 'hold' | 'exhale'
  breathingCardIndex: number
}

export interface GuardianDashboardView {
  selectedRule: UpgradeRule
  currentRules: UpgradeRule[]
  currentCards: number
  maxDrawdownPercent: number
  drawdownPeak: number
  mathExpectationFormatted: string
  isExpPositive: boolean
  expectationTone: 'positive' | 'neutral' | 'negative'
  expectationBadgeText: string
  expectationHintText: string
  expectationValueText: string
  recordsCount: number
  records24: Array<RecordItemView>
  records48: Array<RecordItemView>
  exclusive24: ExclusiveSummaryView
  exclusive48: ExclusiveSummaryView
  gridSlots: TrendGridSlot[]
  reportStats: ReportStatsView
  recordList: Array<RecordItemView>
  sanityMetrics: SanityMetrics
  cognitiveDiagnosis: {
    biasName: string
    biasDes: string
  }
  icons: Record<string, string>
  breathingCard: {
    title: string
    content: string
  }
  breathingCueText: string
  breathingCircleScale: number
  breathingCueTone: 'emerald' | 'amber' | 'sky'
  wealthTrend: number[]
  wealthMin: number
  wealthMax: number
  wealthIsUp: boolean
}

export interface ExclusiveSummaryView {
  total: number
  wins: number
  losses: number
  actualRateText: string
  netCards: number
  netCardsText: string
}

export interface RecordItemView extends RecordEntry {
  timeLabel: string
  statusText: string
  netChangeText: string
  sanityText: string
}

export interface TrendGridSlot {
  id: string
  isFilled: boolean
  success: boolean
  symbol: string
  targetStarLabel: string
  detailTitle: string
  detailText: string
}

export interface ReportStatsView {
  total: number
  wins: number
  losses: number
  actualRate: number
  actualRateText: string
  expectedRateAvg: number
  expectedRateText: string
  rateGapText: string
  luckMeter: string
  luckFeedback: string
  netCumulative: number
  netCumulativeText: string
  maxWinStreak: number
  maxLossStreak: number
  currentStreakType: 'win' | 'loss' | 'none'
  currentStreakCount: number
  currentStreakText: string
}

const BASE_ICON_ATTRS: Record<string, string> = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'CURRENT_COLOR',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function safeParseRecords(value: unknown): RecordEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item) => item && typeof item === 'object').map((item) => item as RecordEntry)
}

export function loadGuardianPersistentState(): GuardianPersistentState {
  const initialCards = clamp(Number(wx.getStorageSync(STORAGE_KEYS.initialCards)) || DEFAULT_INITIAL_CARDS, 1, 999999)
  const records = safeParseRecords(wx.getStorageSync(STORAGE_KEYS.records))
  const soundEnabledStorage = wx.getStorageSync(STORAGE_KEYS.soundEnabled)
  const selectedRuleIdStorage = String(wx.getStorageSync(STORAGE_KEYS.selectedRuleId) || DEFAULT_SELECTED_RULE_ID)
  const drawDownLimitPercent = clamp(Number(wx.getStorageSync(STORAGE_KEYS.drawDownLimitPercent)) || DEFAULT_DRAWDOWN_LIMIT, 10, 80)
  const themeStorage = wx.getStorageSync(STORAGE_KEYS.theme)
  const forceCalmAlertShownStorage = wx.getStorageSync(STORAGE_KEYS.forceCalmAlertShown)
  const selectedRule = UPGRADE_RULES.find((item) => item.id === selectedRuleIdStorage) || UPGRADE_RULES[0]

  return {
    initialCards,
    records,
    soundEnabled: soundEnabledStorage === '' ? DEFAULT_SOUND_ENABLED : String(soundEnabledStorage) !== 'false',
    selectedRuleId: selectedRule.id,
    drawDownLimitPercent,
    theme: themeStorage === 'dark' ? 'dark' : DEFAULT_THEME,
    forceCalmAlertShown: String(forceCalmAlertShownStorage) === 'true',
  }
}

export function persistGuardianPersistentState(state: GuardianPersistentState) {
  wx.setStorageSync(STORAGE_KEYS.initialCards, state.initialCards)
  wx.setStorageSync(STORAGE_KEYS.records, state.records)
  wx.setStorageSync(STORAGE_KEYS.soundEnabled, state.soundEnabled)
  wx.setStorageSync(STORAGE_KEYS.selectedRuleId, state.selectedRuleId)
  wx.setStorageSync(STORAGE_KEYS.drawDownLimitPercent, state.drawDownLimitPercent)
  wx.setStorageSync(STORAGE_KEYS.theme, state.theme)
  wx.setStorageSync(STORAGE_KEYS.forceCalmAlertShown, state.forceCalmAlertShown)
}

export function createDefaultUiState(selectedRuleId: string): GuardianUiState {
  const selectedRule = UPGRADE_RULES.find((item) => item.id === selectedRuleId) || UPGRADE_RULES[0]
  return {
    currentTab: 'console',
    activeStarTab: selectedRule.targetStar,
    showReportBadge: false,
    showStrategyHelp: false,
    isExclusivePanelExpanded: true,
    isBreathingModalOpen: false,
    breathingCountdown: 3,
    breathingTimer: 0,
    breathingPhase: 'inhale',
    breathingCardIndex: 0,
  }
}

export function findRuleById(ruleId: string) {
  return UPGRADE_RULES.find((item) => item.id === ruleId) || UPGRADE_RULES[0]
}

export function createRecord(rule: UpgradeRule, success: boolean, sanityScoreBefore: number): RecordEntry {
  const title = `${rule.targetStar} 突强化 · ${success ? '升星成功!' : '强化失败... 爆'}`
  const timestamp = new Date().toISOString()
  return {
    id: `rc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp,
    ruleId: rule.id,
    formulaName: rule.formulaName,
    targetStar: rule.targetStar,
    successRate: rule.successRate,
    success,
    failLoss: rule.failLoss,
    successGain: rule.successGain,
    netChange: success ? rule.successGain : -rule.failLoss,
    sanityScoreBefore,
    sanityScoreAfter: sanityScoreBefore,
    title,
  }
}

function getMathExpectation(rule: UpgradeRule) {
  return (rule.successRate / 100) * rule.successGain - (1 - rule.successRate / 100) * rule.failLoss
}

function getCurrentCards(initialCards: number, records: RecordEntry[]) {
  const change = records.reduce((sum, item) => sum + item.netChange, 0)
  return Math.max(0, initialCards + change)
}

function getDrawdownStats(initialCards: number, records: RecordEntry[]) {
  let peak = initialCards
  let current = initialCards
  let maxDrawdown = 0

  records.forEach((item) => {
    current += item.netChange
    if (current > peak) {
      peak = current
    }
    const drawdown = peak - current
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  })

  return {
    peak,
    maxDrawdown,
    maxDrawdownPercent: peak > 0 ? (maxDrawdown / peak) * 100 : 0,
  }
}

function getSanityMetrics(
  initialCards: number,
  records: RecordEntry[],
  drawDownLimitPercent: number,
): SanityMetrics {
  const drawdownStats = getDrawdownStats(initialCards, records)
  let score = 100
  let currentLossStreak = 0
  let maxWinStreak = 0
  let tempLossStreak = 0
  let tempWinStreak = 0

  records.forEach((item) => {
    if (!item.success) {
      tempLossStreak += 1
      tempWinStreak = 0
    } else {
      tempWinStreak += 1
      tempLossStreak = 0
      maxWinStreak = Math.max(maxWinStreak, tempWinStreak)
    }
  })

  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (!records[index].success) {
      currentLossStreak += 1
    } else {
      break
    }
  }

  if (currentLossStreak === 1) {
    score -= 8
  } else if (currentLossStreak === 2) {
    score -= 22
  } else if (currentLossStreak === 3) {
    score -= 45
  } else if (currentLossStreak >= 4) {
    score -= 70
  }

  if (drawdownStats.maxDrawdownPercent > 0) {
    if (drawdownStats.maxDrawdownPercent < 20) {
      score -= drawdownStats.maxDrawdownPercent * 0.7
    } else if (drawdownStats.maxDrawdownPercent < 40) {
      score -= drawdownStats.maxDrawdownPercent * 1.1
    } else {
      score -= drawdownStats.maxDrawdownPercent * 1.6
    }
  }

  const desperateAttempts = records.slice(-4).filter((item) => item.successRate <= 15 && !item.success).length
  score -= desperateAttempts * 12
  score = clamp(Math.round(score), 0, 100)

  let status: SanityMetrics['status'] = 'excellent'
  let advice = '心境澄明，理智值百分百。这是最完美的强化时间窗！'
  let colorClass = 'emerald'

  if (score >= 80) {
    status = 'excellent'
    advice = '您当前呼吸规律，操作平稳。大脑额叶完全主导，可严格按既定规划方案合卡。'
    colorClass = 'emerald'
  } else if (score >= 50) {
    status = 'normal'
    advice = '心率正常，理智得分过硬。此时进行普通低星强化或备用料积累完全可以，继续保持！'
    colorClass = 'sky'
  } else if (score >= 20) {
    status = 'warn'
    advice = '【防爆警报】：心境开始急躁。您正处于温和上头边缘！建议将升星消耗调整为高胜比辅料套路，禁止任何极低胜几率的盲强化。'
    colorClass = 'amber'
  } else {
    status = 'danger'
    advice = '【强制熄火】：心跳爆表，已经输急眼！进入认知不连贯强赌博模式。系统理智装置已自动闭锁，请立刻深呼吸放松自救。'
    colorClass = 'rose'
  }

  if (drawdownStats.maxDrawdownPercent >= drawDownLimitPercent) {
    status = 'breached'
    advice = `【物理防御彻底击穿】：您设定的最大资产保护线（减耗 ${drawDownLimitPercent}%）已被跌破！这属于最高警戒级别。根据防沉溺纪律，应立即下线休息，明日再战。`
    colorClass = 'red'
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
  }
}

function getExclusiveSummary(records: RecordEntry[], rate: number): ExclusiveSummaryView {
  const matched = records.filter((item) => item.successRate === rate)
  const total = matched.length
  const wins = matched.filter((item) => item.success).length
  const netCards = matched.reduce((sum, item) => sum + item.netChange, 0)
  const actualRate = total > 0 ? (wins / total) * 100 : 0
  return {
    total,
    wins,
    losses: total - wins,
    actualRateText: total > 0 ? `${actualRate.toFixed(1)}%` : '--',
    netCards,
    netCardsText: `${netCards > 0 ? '+' : ''}${netCards}`,
  }
}

function getReportStats(records: RecordEntry[]): ReportStatsView {
  const total = records.length
  if (total === 0) {
    return {
      total: 0,
      wins: 0,
      losses: 0,
      actualRate: 0,
      actualRateText: '0.0%',
      expectedRateAvg: 0,
      expectedRateText: '0.0%',
      rateGapText: '0.0%',
      luckMeter: '概率守恒',
      luckFeedback: '概率完全守恒中，当前未有任何极端好坏运偏离。',
      netCumulative: 0,
      netCumulativeText: '0',
      maxWinStreak: 0,
      maxLossStreak: 0,
      currentStreakType: 'none',
      currentStreakCount: 0,
      currentStreakText: '无排队',
    }
  }

  const wins = records.filter((item) => item.success).length
  const losses = total - wins
  const actualRate = (wins / total) * 100
  const expectedRateAvg = records.reduce((sum, item) => sum + item.successRate, 0) / total
  const gap = actualRate - expectedRateAvg
  let luckMeter = '概率守恒'
  let luckFeedback = '当前实际成功率与官方预估大体符合。属于正常波动。'

  if (gap >= 15) {
    luckMeter = '五星锦鲤附身'
    luckFeedback = '天命眷顾！您的实测率高出了标称概率，欧气全开。建议见好就收，避免回吐。'
  } else if (gap > 5) {
    luckMeter = '喜气盈盈'
    luckFeedback = '气运中上，目前胜比高于数学均值。脑波完全处于上峰。'
  } else if (gap <= -15) {
    luckMeter = '非酋本酋'
    luckFeedback = '垫子在狂叫！极高频次的爆卡已构成事实连败，不要硬抗概率，马上休息！'
  } else if (gap < -5) {
    luckMeter = '阴云密布'
    luckFeedback = '运势略黑。官方概率未曾兑现，焦躁容易带来报复性连爆。'
  }

  const netCumulative = records.reduce((sum, item) => sum + item.netChange, 0)
  let maxWinStreak = 0
  let maxLossStreak = 0
  let tempWin = 0
  let tempLoss = 0

  records.forEach((item) => {
    if (item.success) {
      tempWin += 1
      tempLoss = 0
      maxWinStreak = Math.max(maxWinStreak, tempWin)
    } else {
      tempLoss += 1
      tempWin = 0
      maxLossStreak = Math.max(maxLossStreak, tempLoss)
    }
  })

  let currentStreakType: 'win' | 'loss' | 'none' = 'none'
  let currentStreakCount = 0
  if (records.length > 0) {
    const lastIsWin = records[records.length - 1].success
    currentStreakType = lastIsWin ? 'win' : 'loss'
    for (let index = records.length - 1; index >= 0; index -= 1) {
      if (records[index].success === lastIsWin) {
        currentStreakCount += 1
      } else {
        break
      }
    }
  }

  const currentStreakText =
    currentStreakType === 'win'
      ? `连红中 +${currentStreakCount}`
      : currentStreakType === 'loss'
        ? `连黑中 -${currentStreakCount}`
        : '无排队'
  const rateGap = actualRate - expectedRateAvg

  return {
    total,
    wins,
    losses,
    actualRate,
    actualRateText: `${actualRate.toFixed(1)}%`,
    expectedRateAvg,
    expectedRateText: `${expectedRateAvg.toFixed(1)}%`,
    rateGapText: `${rateGap > 0 ? '+' : ''}${rateGap.toFixed(1)}%`,
    luckMeter,
    luckFeedback,
    netCumulative,
    netCumulativeText: `${netCumulative > 0 ? '+' : ''}${netCumulative}`,
    maxWinStreak,
    maxLossStreak,
    currentStreakType,
    currentStreakCount,
    currentStreakText,
  }
}

function buildRecordList(records: RecordEntry[]): Array<RecordItemView> {
  return records
    .slice()
    .reverse()
    .map((item) => ({
      ...item,
      timeLabel: formatTime(item.timestamp, true),
      statusText: item.success ? '成功' : '失败',
      netChangeText: `${item.netChange > 0 ? '+' : ''}${item.netChange}`,
      sanityText: `${item.sanityScoreAfter}%`,
    }))
}

function buildGridSlots(records: RecordEntry[]): TrendGridSlot[] {
  const reversed = records.slice().reverse()
  const result: TrendGridSlot[] = []
  for (let index = 0; index < 32; index += 1) {
    const item = reversed[index]
    if (item) {
      result.push({
        id: item.id,
        isFilled: true,
        success: item.success,
        symbol: item.success ? '✓' : '✗',
        targetStarLabel: `${item.targetStar}`,
        detailTitle: `${item.success ? '成功' : '失败'} · ${item.targetStar}突 (${item.formulaName})`,
        detailText: `${formatTime(item.timestamp, true)} · 官方几率 ${item.successRate}% · ${item.netChange > 0 ? `赚 +${item.netChange}` : `亏 ${item.netChange}`} 张`,
      })
    } else {
      result.push({
        id: `placeholder_${index}`,
        isFilled: false,
        success: false,
        symbol: '•',
        targetStarLabel: '',
        detailTitle: '',
        detailText: '',
      })
    }
  }
  return result
}

function buildWealthTrend(initialCards: number, records: RecordEntry[]) {
  const trend = [initialCards]
  let current = initialCards
  records.forEach((item) => {
    current += item.netChange
    trend.push(current)
  })
  return trend
}

function getExpectationDescriptor(selectedRule: UpgradeRule, currentRules: UpgradeRule[]) {
  const scopedRules = currentRules.length ? currentRules : [selectedRule]
  const currentExpectation = getMathExpectation(selectedRule)
  const expectationValues = scopedRules.map((rule) => getMathExpectation(rule))
  const maxExpectation = Math.max(...expectationValues)
  const minExpectation = Math.min(...expectationValues)
  const range = maxExpectation - minExpectation
  const deltaToBest = maxExpectation - currentExpectation
  const deltaToWorst = currentExpectation - minExpectation

  if (currentExpectation >= 0) {
    return {
      isExpPositive: true,
      expectationTone: 'positive' as const,
      expectationBadgeText: '期望为正',
      expectationHintText: '长期看收益占优，可以作为当前主推方案。',
      expectationValueText: `${currentExpectation > 0 ? '+' : ''}${currentExpectation.toFixed(2)} 张`,
    }
  }

  if (range < 0.08) {
    return {
      isExpPositive: false,
      expectationTone: 'neutral' as const,
      expectationBadgeText: '同档接近',
      expectationHintText: '当前星级各配方期望差距很小，更多看你的节奏控制。',
      expectationValueText: `${currentExpectation.toFixed(2)} 张`,
    }
  }

  if (deltaToBest <= 0.08) {
    return {
      isExpPositive: false,
      expectationTone: 'positive' as const,
      expectationBadgeText: '当前档最优',
      expectationHintText: '虽然仍是负期望，但已经是本档里损耗最低的配方。',
      expectationValueText: `${currentExpectation.toFixed(2)} 张`,
    }
  }

  if (deltaToWorst <= range * 0.35) {
    return {
      isExpPositive: false,
      expectationTone: 'negative' as const,
      expectationBadgeText: '高风险冲刺',
      expectationHintText: '这套更吃运气，长期损耗更高，建议谨慎上头。',
      expectationValueText: `${currentExpectation.toFixed(2)} 张`,
    }
  }

  return {
    isExpPositive: false,
    expectationTone: 'neutral' as const,
    expectationBadgeText: '均衡方案',
    expectationHintText: '期望处于中间区间，适合边打边观察走势。',
    expectationValueText: `${currentExpectation.toFixed(2)} 张`,
  }
}

function getCognitiveDiagnosis(
  reportStats: ReportStatsView,
  sanityMetrics: SanityMetrics,
  drawDownLimitPercent: number,
) {
  if (reportStats.total === 0) {
    return {
      biasName: '虚空以待',
      biasDes: '账簿内暂未包含记账，多做几次合卡即可为你剖析操盘心理学错觉。',
    }
  }

  if (sanityMetrics.status === 'breached' || sanityMetrics.maxDrawdownPercent >= drawDownLimitPercent) {
    return {
      biasName: '防线击穿 · 正发生暴走赌徒倾斜',
      biasDes: '您的硬性净资产缩水已经击穿个人红线。认知心理学显示当前额叶前皮层完全失去理智主导权，继续合卡将极易发生彻底清仓式的暴怒强化。',
    }
  }

  if (reportStats.currentStreakType === 'loss' && reportStats.currentStreakCount >= 3) {
    return {
      biasName: '垫子自欺欺人错觉',
      biasDes: '您当前陷入了经典的垫子谬误。前面的失败并不会提高下一次强化的客观成功率，请立即拉开距离，停止情绪性追单。',
    }
  }

  if (reportStats.currentStreakType === 'win' && reportStats.currentStreakCount >= 3) {
    return {
      biasName: '高傲必败幸存者偏差',
      biasDes: '连续成功会让人误以为今天手气无敌。请注意这通常只是正常波峰，不应成为放大仓位的理由。',
    }
  }

  if (reportStats.total > 10 && reportStats.actualRate < reportStats.expectedRateAvg) {
    return {
      biasName: '趋均值回归法则',
      biasDes: '实测胜率低于官方标称，属于概率的正常左侧波折。保持平和，不要通过仓促追加大额底卡去拼概率。',
    }
  }

  return {
    biasName: '温和平理智状态',
    biasDes: '操作中规中矩，账簿盈亏波动健康。请守住当前防御线，继续理智操盘。',
  }
}

function stringifyAttrs(attrs: Record<string, string>) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}

function buildSvgDataUri(iconName: keyof typeof LUCIDE_ICON_MAP, color: string) {
  const nodes = LUCIDE_ICON_MAP[iconName] ?? []
  const children = nodes
    .map(([tagName, attrs]) => {
      const nextAttrs: Record<string, string> = {}
      Object.keys(attrs).forEach((key) => {
        if (key !== 'key') {
          nextAttrs[key] = String((attrs as Record<string, string>)[key])
        }
      })
      return `<${tagName} ${stringifyAttrs(nextAttrs)}></${tagName}>`
    })
    .join('')

  const svg = `<svg ${stringifyAttrs(BASE_ICON_ATTRS).replace('CURRENT_COLOR', color)}>${children}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function buildThemeIcons(theme: 'light' | 'dark') {
  const neutral = theme === 'dark' ? '#d4d4d8' : '#111827'
  const muted = theme === 'dark' ? '#71717a' : '#6b7280'
  return {
    activity: buildSvgDataUri('activity', '#10b981'),
    arrowRightLeft: buildSvgDataUri('arrow-right-left', muted),
    bookOpen: buildSvgDataUri('book-open', '#10b981'),
    brainCircuit: buildSvgDataUri('brain-circuit', '#f59e0b'),
    chevronDown: buildSvgDataUri('chevron-down', muted),
    chevronUp: buildSvgDataUri('chevron-up', muted),
    coins: buildSvgDataUri('coins', '#f59e0b'),
    compass: buildSvgDataUri('compass', '#10b981'),
    download: buildSvgDataUri('download', neutral),
    flame: buildSvgDataUri('flame', '#ef4444'),
    heart: buildSvgDataUri('heart', '#ef4444'),
    helpCircle: buildSvgDataUri('help-circle', '#10b981'),
    history: buildSvgDataUri('history', '#10b981'),
    moon: buildSvgDataUri('moon', '#4f46e5'),
    percent: buildSvgDataUri('percent', '#10b981'),
    refreshCw: buildSvgDataUri('refresh-cw', muted),
    scale: buildSvgDataUri('scale', '#10b981'),
    shieldAlert: buildSvgDataUri('shield-alert', '#f59e0b'),
    sparkles: buildSvgDataUri('sparkles', '#f59e0b'),
    sun: buildSvgDataUri('sun', '#f59e0b'),
    target: buildSvgDataUri('target', '#10b981'),
    trash2: buildSvgDataUri('trash-2', muted),
    trendingDown: buildSvgDataUri('trending-down', '#10b981'),
    volume2: buildSvgDataUri('volume-2', '#10b981'),
    volumeX: buildSvgDataUri('volume-x', muted),
    wind: buildSvgDataUri('wind', '#10b981'),
  }
}

export function getBreathingVisual(uiState: GuardianUiState) {
  let circleScale = 1
  let breathingCueText = '深吸一口气...'
  let breathingCueTone: 'emerald' | 'amber' | 'sky' = 'sky'

  if (uiState.breathingPhase === 'inhale') {
    const ratio = uiState.breathingTimer / 40
    circleScale = 1 + ratio * 0.4
    breathingCueText = '缓缓吸气 · 卡量只是数字'
    breathingCueTone = 'emerald'
  } else if (uiState.breathingPhase === 'hold') {
    circleScale = 1.4
    breathingCueText = '屏息屏气 · 让理智归位'
    breathingCueTone = 'amber'
  } else {
    const ratio = (uiState.breathingTimer - 60) / 40
    circleScale = 1.4 - ratio * 0.4
    breathingCueText = '慢慢呼气 · 沉没成本已是过去'
    breathingCueTone = 'sky'
  }

  return {
    breathingCueText,
    breathingCueTone,
    breathingCircleScale: Number(circleScale.toFixed(3)),
  }
}

export function buildDashboardView(
  persistentState: GuardianPersistentState,
  uiState: GuardianUiState,
): GuardianDashboardView {
  const selectedRule = findRuleById(persistentState.selectedRuleId)
  const currentRules = UPGRADE_RULES.filter((item) => item.targetStar === uiState.activeStarTab)
  const currentCards = getCurrentCards(persistentState.initialCards, persistentState.records)
  const drawdownStats = getDrawdownStats(persistentState.initialCards, persistentState.records)
  const sanityMetrics = getSanityMetrics(
    persistentState.initialCards,
    persistentState.records,
    persistentState.drawDownLimitPercent,
  )
  const reportStats = getReportStats(persistentState.records)
  const mathExpectation = getMathExpectation(selectedRule)
  const expectationDescriptor = getExpectationDescriptor(selectedRule, currentRules)
  const breathingVisual = getBreathingVisual(uiState)
  const wealthTrend = buildWealthTrend(persistentState.initialCards, persistentState.records)

  return {
    selectedRule,
    currentRules,
    currentCards,
    maxDrawdownPercent: drawdownStats.maxDrawdownPercent,
    drawdownPeak: drawdownStats.peak,
    mathExpectationFormatted: mathExpectation.toFixed(3),
    isExpPositive: expectationDescriptor.isExpPositive,
    expectationTone: expectationDescriptor.expectationTone,
    expectationBadgeText: expectationDescriptor.expectationBadgeText,
    expectationHintText: expectationDescriptor.expectationHintText,
    expectationValueText: expectationDescriptor.expectationValueText,
    recordsCount: persistentState.records.length,
    records24: buildRecordList(persistentState.records.filter((item) => item.successRate === 24)),
    records48: buildRecordList(persistentState.records.filter((item) => item.successRate === 48)),
    exclusive24: getExclusiveSummary(persistentState.records, 24),
    exclusive48: getExclusiveSummary(persistentState.records, 48),
    gridSlots: buildGridSlots(persistentState.records),
    reportStats,
    recordList: buildRecordList(persistentState.records),
    sanityMetrics,
    cognitiveDiagnosis: getCognitiveDiagnosis(reportStats, sanityMetrics, persistentState.drawDownLimitPercent),
    icons: buildThemeIcons(persistentState.theme),
    breathingCard: MIND_COGNITIVE_CARDS[uiState.breathingCardIndex] || MIND_COGNITIVE_CARDS[0],
    breathingCueText: breathingVisual.breathingCueText,
    breathingCircleScale: breathingVisual.breathingCircleScale,
    breathingCueTone: breathingVisual.breathingCueTone,
    wealthTrend,
    wealthMin: Math.min(...wealthTrend),
    wealthMax: Math.max(...wealthTrend),
    wealthIsUp: wealthTrend[wealthTrend.length - 1] >= wealthTrend[0],
  }
}

export function formatTime(timestamp: string, withSeconds = false) {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`
}

export function getRandomBreathingCardIndex() {
  return Math.floor(Math.random() * MIND_COGNITIVE_CARDS.length)
}

export function playTapFeedback(enabled: boolean, type: 'light' | 'medium' | 'heavy' = 'light') {
  if (!enabled) return

  try {
    if (type === 'light') {
      // 轻触：导航切换、折叠展开、小按钮
      wx.vibrateShort({ type: 'light' })
    } else if (type === 'medium') {
      // 中等：成功合卡、确认操作
      wx.vibrateShort({ type: 'medium' })
    } else {
      // 重：失败合卡、警告
      wx.vibrateShort({ type: 'heavy' })
    }
  } catch (e) {
    // 部分设备/模拟器不支持，静默忽略
  }
}

export function getTrendCanvasPoints(trend: number[], width: number, height: number) {
  if (!trend.length) {
    return []
  }
  const paddingY = 14
  const minValue = Math.min(...trend)
  const maxValue = Math.max(...trend)
  const range = maxValue - minValue || 1
  return trend.map((value, index) => {
    const x = trend.length === 1 ? width / 2 : (index / (trend.length - 1)) * width
    const y = height - paddingY - ((value - minValue) / range) * (height - paddingY * 2)
    return { x, y }
  })
}
