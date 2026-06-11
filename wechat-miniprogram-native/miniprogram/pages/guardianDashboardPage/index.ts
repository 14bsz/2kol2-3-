import {
  DEFAULT_DRAWDOWN_LIMIT,
  DEFAULT_INITIAL_CARDS,
  DEFAULT_SELECTED_RULE_ID,
  RecordEntry,
  SanityMetrics,
  UPGRADE_RULES,
} from '../../utils/guardian-data'
import {
  GuardianPersistentState,
  GuardianUiState,
  buildDashboardView,
  createDefaultUiState,
  createRecord,
  findRuleById,
  formatTime,
  getBreathingVisual,
  getRandomBreathingCardIndex,
  getTrendCanvasPoints,
  loadGuardianPersistentState,
  persistGuardianPersistentState,
  playTapFeedback,
} from '../../utils/guardian-runtime'

type Timer = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | undefined

type GuardianPageInstance = WechatMiniprogram.Page.Instance<any, any> & {
  _persistentState: GuardianPersistentState
  _uiState: GuardianUiState
  _badgeTimer?: Timer
  _breathingCountdownTimer?: Timer
  _breathingPulseTimer?: Timer
  syncView: () => void
  drawTrendCanvas: () => void
  drawReportCanvas: () => void
  clearAllTimers: () => void
  openBreathingMode: () => void
  setReportGenerated: () => void
  wrapCanvasText: (
    context: WechatMiniprogram.CanvasContext,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) => number
}

const EMPTY_SANITY: SanityMetrics = {
  score: 100,
  status: 'excellent',
  advice: '心境澄明，理智值百分百。这是最完美的强化时间窗！',
  colorClass: 'emerald',
  recentFailStreak: 0,
  consecutiveWins: 0,
  consecutiveLosses: 0,
  maxDrawdown: 0,
  maxDrawdownPercent: 0,
}

Page({
  data: {
    statusBarHeight: 0,
    menuButtonHeight: 0,
    headerPaddingTop: 0,
    headerHeight: 0,
    headerBarHeight: 0,
    headerRightSafe: 96,
    theme: 'light',
    soundEnabled: true,
    initialCards: DEFAULT_INITIAL_CARDS,
    initialCardsInput: String(DEFAULT_INITIAL_CARDS),
    records: [] as RecordEntry[],
    selectedRuleId: DEFAULT_SELECTED_RULE_ID,
    drawDownLimitPercent: DEFAULT_DRAWDOWN_LIMIT,
    currentTab: 'console',
    activeStarTab: 5,
    showReportBadge: false,
    showStrategyHelp: false,
    strategyTricks: [
      '3+1：321 炸一次，然后到成，再炸 42',
      '4+1：炸四次或者八次 41',
      '4+2：21 上 3，321 上 4，54 上 6',
      '421：垫子 41 炸四次，再炸 42，再炸一手 421（炸 321，炸两次 41）',
      '431：垫子炸 421 直接追',
      '521：41 炸四次，42 炸一次，421 炸一次',
      '53：炸个三次 53',
      '542：垫子炸 72% 直接追',
      '543：21 上 3，321 上 4，继续看垫子 2+1 上 3，然后追 543 炸 5+1',
      '5421：48% 炸三次以上直接追',
      '6321：616262163631632 直接追',
      '64：21 上 3，321 上 4，54 上 6 直接追',
      '21 上 3，321 上 4，43 上 5，54 上 6',
      '65：加一到 4，43 炸了直接追',
      '拆 7：炸四手 41，炸手 64 直接追（41 炸两次，42 炸两次，421 炸两次）',
    ],
    isExclusivePanelExpanded: true,
    isBreathingModalOpen: false,
    breathingCountdown: 3,
    breathingTimer: 0,
    breathingPhase: 'inhale',
    breathingCardIndex: 0,
    showResetDialog: false,
    reportGenerated: false,
    currentRulePickerIndex: 0,
    starOptions: [2, 3, 4, 5, 6],
    icons: {},
    selectedRule: findRuleById(DEFAULT_SELECTED_RULE_ID),
    currentRules: [],
    currentCards: DEFAULT_INITIAL_CARDS,
    maxDrawdownPercent: 0,
    drawdownPeak: DEFAULT_INITIAL_CARDS,
    mathExpectationFormatted: '0.000',
    isExpPositive: false,
    expectationTone: 'neutral',
    expectationBadgeText: '均衡方案',
    expectationHintText: '切换配方后会动态重算数学期望。',
    expectationValueText: '-0.00 张',
    recordsCount: 0,
    records24: [],
    records48: [],
    exclusive24: { total: 0, wins: 0, losses: 0, actualRateText: '--', netCards: 0, netCardsText: '0' },
    exclusive48: { total: 0, wins: 0, losses: 0, actualRateText: '--', netCards: 0, netCardsText: '0' },
    gridSlots: [],
    reportStats: {
      total: 0,
      wins: 0,
      losses: 0,
      actualRate: 0,
      actualRateText: '0.0%',
      expectedRateAvg: 0,
      expectedRateText: '0.0%',
      rateGapText: '0.0%',
      luckMeter: '概率守恒',
      luckFeedback: '',
      netCumulative: 0,
      netCumulativeText: '0',
      maxWinStreak: 0,
      maxLossStreak: 0,
      currentStreakType: 'none',
      currentStreakCount: 0,
      currentStreakText: '无排队',
    },
    recordList: [],
    sanityMetrics: EMPTY_SANITY,
    cognitiveDiagnosis: {
      biasName: '温和平理智状态',
      biasDes: '操作中规中矩，账簿盈亏波动健康。',
    },
    breathingCard: {
      title: '理智自醒',
      content: '深呼吸之后再做决定。',
    },
    breathingCueText: '深吸一口气...',
    breathingCircleScale: 1,
    breathingCueTone: 'sky',
    wealthTrend: [DEFAULT_INITIAL_CARDS],
    wealthMin: DEFAULT_INITIAL_CARDS,
    wealthMax: DEFAULT_INITIAL_CARDS,
    wealthIsUp: true,
    reportCanvasHeight: 1380,
    windowWidth: 375,
  },

  onLoad(this: GuardianPageInstance) {
    const systemInfo = wx.getSystemInfoSync()
    const menuButton = wx.getMenuButtonBoundingClientRect()

    const statusBarHeight = systemInfo.statusBarHeight || 0
    const menuButtonHeight = menuButton.height || 32
    const topGap = Math.max((menuButton.top || statusBarHeight) - statusBarHeight, 8)
    const headerBarHeight = menuButtonHeight + topGap * 2
    const headerHeight = statusBarHeight + headerBarHeight
    const windowWidth = systemInfo.windowWidth || systemInfo.screenWidth || 375
    const headerRightSafe = Math.max(windowWidth - menuButton.left + 12, 96)
    const headerPaddingTop = statusBarHeight

    this.setData({
      statusBarHeight,
      menuButtonHeight,
      headerPaddingTop,
      headerHeight,
      headerBarHeight,
      headerRightSafe,
      windowWidth,
    })

    this._persistentState = loadGuardianPersistentState()
    this._uiState = createDefaultUiState(this._persistentState.selectedRuleId)

    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline'],
    })

    this.syncView()
  },

  onShow(this: GuardianPageInstance) {
    if (this.data.currentTab === 'report') {
      setTimeout(() => this.drawTrendCanvas(), 40)
    }
  },

  onUnload(this: GuardianPageInstance) {
    this.clearAllTimers()
  },

  onShareAppMessage(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    return {
      title: 'NBA2KOL2 合卡理智卫士 - 科学合卡，拒绝上头',
      path: '/pages/guardianDashboardPage/index',
    }
  },

  onShareTimeline(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    return {
      title: 'NBA2KOL2 合卡理智卫士 - 科学合卡，拒绝上头',
      query: 'from=timeline',
    }
  },

  clearAllTimers(this: GuardianPageInstance) {
    if (this._badgeTimer) {
      clearTimeout(this._badgeTimer as ReturnType<typeof setTimeout>)
      this._badgeTimer = undefined
    }
    if (this._breathingCountdownTimer) {
      clearInterval(this._breathingCountdownTimer as ReturnType<typeof setInterval>)
      this._breathingCountdownTimer = undefined
    }
    if (this._breathingPulseTimer) {
      clearInterval(this._breathingPulseTimer as ReturnType<typeof setInterval>)
      this._breathingPulseTimer = undefined
    }
  },

  syncView(this: GuardianPageInstance) {
    persistGuardianPersistentState(this._persistentState)
    const dashboardView = buildDashboardView(this._persistentState, this._uiState)
    const currentRulePickerIndex = dashboardView.currentRules.findIndex(
      (item) => item.id === dashboardView.selectedRule.id,
    )

    this.setData(
      {
        theme: this._persistentState.theme,
        soundEnabled: this._persistentState.soundEnabled,
        initialCards: this._persistentState.initialCards,
        initialCardsInput: String(this._persistentState.initialCards),
        records: this._persistentState.records,
        selectedRuleId: this._persistentState.selectedRuleId,
        drawDownLimitPercent: this._persistentState.drawDownLimitPercent,
        currentTab: this._uiState.currentTab,
        activeStarTab: this._uiState.activeStarTab,
        showReportBadge: this._uiState.showReportBadge,
        showStrategyHelp: this._uiState.showStrategyHelp,
        isExclusivePanelExpanded: this._uiState.isExclusivePanelExpanded,
        isBreathingModalOpen: this._uiState.isBreathingModalOpen,
        breathingCountdown: this._uiState.breathingCountdown,
        breathingTimer: this._uiState.breathingTimer,
        breathingPhase: this._uiState.breathingPhase,
        breathingCardIndex: this._uiState.breathingCardIndex,
        currentRulePickerIndex: currentRulePickerIndex < 0 ? 0 : currentRulePickerIndex,
        ...dashboardView,
      },
      () => {
        if (this.data.currentTab === 'report') {
          this.drawTrendCanvas()
        }
      },
    )
  },

  setReportGenerated(this: GuardianPageInstance) {
    this.setData({ reportGenerated: true })
    setTimeout(() => {
      this.setData({ reportGenerated: false })
    }, 1800)
  },

  handleToggleSound(this: GuardianPageInstance) {
    const nextValue = !this._persistentState.soundEnabled
    this._persistentState.soundEnabled = nextValue
    if (nextValue) {
      playTapFeedback(true, 'light')
    }
    this.syncView()
  },

  handleToggleTheme(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this._persistentState.theme = this._persistentState.theme === 'dark' ? 'light' : 'dark'
    this.syncView()
  },

  handleSwitchTab(this: GuardianPageInstance, event: WechatMiniprogram.BaseEvent) {
    const tab = String(event.currentTarget.dataset.tab || 'console') as 'console' | 'report'
    if (tab === this._uiState.currentTab) {
      return
    }
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this._uiState.currentTab = tab
    if (tab === 'report') {
      this._uiState.showReportBadge = false
    }
    this.syncView()
  },

  handleStarTabTap(this: GuardianPageInstance, event: WechatMiniprogram.BaseEvent) {
    const star = Number(event.currentTarget.dataset.star || 5)
    this._uiState.activeStarTab = star
    const matchingRule = UPGRADE_RULES.find((item) => item.targetStar === star) || findRuleById(DEFAULT_SELECTED_RULE_ID)
    this._persistentState.selectedRuleId = matchingRule.id
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this.syncView()
  },

  handleRulePickerChange(this: GuardianPageInstance, event: WechatMiniprogram.CustomEvent<{ value: number }>) {
    const index = Number(event.detail.value || 0)
    const nextRule = this.data.currentRules[index]
    if (!nextRule) {
      return
    }
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this._persistentState.selectedRuleId = nextRule.id
    this.syncView()
  },

  handleInitialCardsInput(this: GuardianPageInstance, event: WechatMiniprogram.Input) {
    this.setData({ initialCardsInput: event.detail.value })
  },

  handleInitialCardsCommit(this: GuardianPageInstance) {
    const parsed = Number(this.data.initialCardsInput)
    const nextValue = Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : this._persistentState.initialCards
    this._persistentState.initialCards = nextValue
    this.syncView()
  },

  handleToggleExclusivePanel(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this._uiState.isExclusivePanelExpanded = !this._uiState.isExclusivePanelExpanded
    this.syncView()
  },

  handleToggleStrategyHelp(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this._uiState.showStrategyHelp = !this._uiState.showStrategyHelp
    this.syncView()
  },

  noop() {},

  handleTrendSlotTap(this: GuardianPageInstance, event: WechatMiniprogram.BaseEvent) {
    if (!event.currentTarget.dataset.filled) {
      return
    }
    wx.showModal({
      title: String(event.currentTarget.dataset.title || '记录详情'),
      content: String(event.currentTarget.dataset.detail || ''),
      showCancel: false,
      confirmText: '知道了',
    })
  },

  handleOpenResetDialog(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this.setData({ showResetDialog: true })
  },

  handleCloseResetDialog(this: GuardianPageInstance) {
    this.setData({ showResetDialog: false })
  },

  handleConfirmReset(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'medium')
    this._persistentState.records = []
    this._persistentState.initialCards = DEFAULT_INITIAL_CARDS
    this._persistentState.forceCalmAlertShown = false
    this._uiState.showReportBadge = false
    this.setData({ showResetDialog: false, reportGenerated: false })
    this.syncView()
  },

  handleDeleteRecord(this: GuardianPageInstance, event: WechatMiniprogram.BaseEvent) {
    const targetId = String(event.currentTarget.dataset.id || '')
    if (!targetId) {
      return
    }

    wx.showModal({
      title: '确定要撤销并回滚本笔账目？',
      content: '这会关联影响大底卡余额及胜率计算的值。',
      success: (result) => {
        if (!result.confirm) {
          return
        }
        playTapFeedback(this._persistentState.soundEnabled, 'light')
        this._persistentState.records = this._persistentState.records.filter((item) => item.id !== targetId)
        this.setData({ reportGenerated: false })
        this.syncView()
      },
    })
  },

  handleDrawDownLimitChange(this: GuardianPageInstance, event: WechatMiniprogram.CustomEvent<{ value: number }>) {
    this._persistentState.drawDownLimitPercent = Number(event.detail.value || DEFAULT_DRAWDOWN_LIMIT)
    playTapFeedback(this._persistentState.soundEnabled, 'light')
    this.syncView()
  },

  handleManualBreathing(this: GuardianPageInstance) {
    this.openBreathingMode()
  },

  openBreathingMode(this: GuardianPageInstance) {
    this.clearAllTimers()
    this._uiState.isBreathingModalOpen = true
    this._uiState.breathingCountdown = 3
    this._uiState.breathingTimer = 0
    this._uiState.breathingPhase = 'inhale'
    this._uiState.breathingCardIndex = getRandomBreathingCardIndex()
    playTapFeedback(this._persistentState.soundEnabled, 'medium')
    this.syncView()

    this._breathingCountdownTimer = setInterval(() => {
      if (this._uiState.breathingCountdown > 0) {
        this._uiState.breathingCountdown -= 1
        this.setData({ breathingCountdown: this._uiState.breathingCountdown })
      }
      if (this._uiState.breathingCountdown <= 0 && this._breathingCountdownTimer) {
        clearInterval(this._breathingCountdownTimer as ReturnType<typeof setInterval>)
        this._breathingCountdownTimer = undefined
      }
    }, 1000)

    this._breathingPulseTimer = setInterval(() => {
      const nextValue = (this._uiState.breathingTimer + 1.5) % 100
      this._uiState.breathingTimer = nextValue
      this._uiState.breathingPhase = nextValue < 40 ? 'inhale' : nextValue < 60 ? 'hold' : 'exhale'
      const breathingVisual = getBreathingVisual(this._uiState)
      this.setData({
        breathingTimer: this._uiState.breathingTimer,
        breathingPhase: this._uiState.breathingPhase,
        breathingCueText: breathingVisual.breathingCueText,
        breathingCircleScale: breathingVisual.breathingCircleScale,
        breathingCueTone: breathingVisual.breathingCueTone,
      })
    }, 45)
  },

  handleConfirmBreathing(this: GuardianPageInstance) {
    if (this._uiState.breathingCountdown > 0) {
      return
    }
    this.clearAllTimers()
    this._uiState.isBreathingModalOpen = false
    this.syncView()
  },

  handleLogUpgrade(this: GuardianPageInstance, event: WechatMiniprogram.BaseEvent) {
    const success = String(event.currentTarget.dataset.success) === 'true'
    const beforeScore = this.data.sanityMetrics.score
    const selectedRule = findRuleById(this._persistentState.selectedRuleId)
    const nextRecord = createRecord(selectedRule, success, beforeScore)
    const nextRecords = [...this._persistentState.records, nextRecord]
    const tempState: GuardianPersistentState = { ...this._persistentState, records: nextRecords }
    const nextView = buildDashboardView(tempState, this._uiState)
    nextRecord.sanityScoreAfter = nextView.sanityMetrics.score
    this._persistentState.records = nextRecords
    this.setData({ reportGenerated: false })

    playTapFeedback(this._persistentState.soundEnabled, success ? 'medium' : 'heavy')

    if (nextView.sanityMetrics.score < 50 && beforeScore >= 50 && this._uiState.currentTab !== 'report') {
      this._uiState.showReportBadge = true
      if (this._badgeTimer) {
        clearTimeout(this._badgeTimer as ReturnType<typeof setTimeout>)
      }
      this._badgeTimer = setTimeout(() => {
        this._uiState.showReportBadge = false
        this.setData({ showReportBadge: false })
      }, 5000)
    }

    if (
      nextView.sanityMetrics.score < 20 &&
      beforeScore >= 20 &&
      !this._persistentState.forceCalmAlertShown
    ) {
      this._persistentState.forceCalmAlertShown = true
      this.openBreathingMode()
      return
    }

    this.syncView()
  },

  drawTrendCanvas(this: GuardianPageInstance) {
    const trend = this.data.wealthTrend as number[]
    if (!trend || trend.length === 0) {
      return
    }
    const width = 340
    const height = 75
    const points = getTrendCanvasPoints(trend, width, height)
    if (!points.length) {
      return
    }

    const isDark = this.data.theme === 'dark'
    const lineColor = this.data.wealthIsUp ? '#10b981' : '#ef4444'
    const fillColor = this.data.wealthIsUp ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'
    const axisColor = isDark ? '#334155' : '#e5e7eb'
    const dotColor = this.data.wealthIsUp ? '#34d399' : '#f87171'
    const context = wx.createCanvasContext('guardianTrendCanvas', this)

    context.clearRect(0, 0, width, height)
    context.setStrokeStyle(axisColor)
    context.setLineWidth(1)
    context.beginPath()
    context.moveTo(0, height / 2)
    context.lineTo(width, height / 2)
    context.stroke()

    context.setFillStyle(fillColor)
    context.beginPath()
    context.moveTo(points[0].x, points[0].y)
    points.forEach((point) => context.lineTo(point.x, point.y))
    context.lineTo(width, height)
    context.lineTo(0, height)
    context.closePath()
    context.fill()

    context.setStrokeStyle(lineColor)
    context.setLineWidth(3)
    context.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y)
      } else {
        context.lineTo(point.x, point.y)
      }
    })
    context.stroke()

    const lastPoint = points[points.length - 1]
    context.setFillStyle(dotColor)
    context.beginPath()
    context.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2)
    context.fill()
    context.draw()
  },

  wrapCanvasText(
    this: GuardianPageInstance,
    context: WechatMiniprogram.CanvasContext,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) {
    let currentLine = ''
    let currentY = y
    const chars = text.split('')
    chars.forEach((char, index) => {
      const nextLine = `${currentLine}${char}`
      if (context.measureText(nextLine).width > maxWidth && currentLine) {
        context.fillText(currentLine, x, currentY)
        currentLine = char
        currentY += lineHeight
      } else {
        currentLine = nextLine
      }
      if (index === chars.length - 1 && currentLine) {
        context.fillText(currentLine, x, currentY)
      }
    })
    return currentY
  },

  drawReportCanvas(this: GuardianPageInstance) {
    // 画布坐标 = 屏幕物理宽度（px），CSS 尺寸也是 screenW × cssHeight
    // canvasToTempFilePath 用 destWidth = W*2 导出 2x 高清图
    const screenW = this.data.windowWidth as number || 375
    const W = screenW
    const PAD = Math.round(W * 0.056)   // ~21px on 375
    const INNER_W = W - PAD * 2

    const isDark = this.data.theme === 'dark'
    const BG          = isDark ? '#0f172a' : '#f8fafc'
    const CARD_BG     = isDark ? '#111827' : '#ffffff'
    const BORDER      = isDark ? '#1e293b' : '#e2e8f0'
    const T_MAIN      = isDark ? '#f1f5f9' : '#0f172a'
    const T_SUB       = isDark ? '#94a3b8' : '#64748b'
    const GREEN       = '#10b981'
    const RED         = '#ef4444'
    const AMBER       = '#f59e0b'
    const EMERALD_DIM = isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.12)'
    const RED_DIM     = 'rgba(239,68,68,0.18)'

    // ── 字体/间距常量（基于 375px 宽）
    const S = W / 375   // 缩放系数
    const fs = (n: number) => Math.round(n * S)   // scaled font size
    const sp = (n: number) => Math.round(n * S)   // scaled spacing/position

    const records = (this.data.recordList as any[])
    const recordCount = records.length
    const LEDGER_ROWS = Math.min(recordCount, 8)
    const LEDGER_ROW_H = sp(48)
    const BASE_H = sp(720)
    const totalHeight = BASE_H + LEDGER_ROWS * LEDGER_ROW_H + sp(40)

    const context = wx.createCanvasContext('guardianReportCanvas', this)

    // ── 圆角矩形辅助
    const fillRR = (x: number, y: number, w: number, h: number, r: number, fill: string) => {
      context.setFillStyle(fill)
      context.beginPath()
      context.moveTo(x + r, y)
      context.lineTo(x + w - r, y)
      context.arcTo(x + w, y, x + w, y + r, r)
      context.lineTo(x + w, y + h - r)
      context.arcTo(x + w, y + h, x + w - r, y + h, r)
      context.lineTo(x + r, y + h)
      context.arcTo(x, y + h, x, y + h - r, r)
      context.lineTo(x, y + r)
      context.arcTo(x, y, x + r, y, r)
      context.closePath()
      context.fill()
    }
    const strokeRR = (x: number, y: number, w: number, h: number, r: number, stroke: string, lw = 1) => {
      context.setStrokeStyle(stroke)
      context.setLineWidth(lw)
      context.beginPath()
      context.moveTo(x + r, y)
      context.lineTo(x + w - r, y)
      context.arcTo(x + w, y, x + w, y + r, r)
      context.lineTo(x + w, y + h - r)
      context.arcTo(x + w, y + h, x + w - r, y + h, r)
      context.lineTo(x + r, y + h)
      context.arcTo(x, y + h, x, y + h - r, r)
      context.lineTo(x, y + r)
      context.arcTo(x, y, x + r, y, r)
      context.closePath()
      context.stroke()
    }

    // ── 背景
    context.setFillStyle(BG)
    context.fillRect(0, 0, W, totalHeight)

    // ══ SECTION 0：顶部标题栏 ══
    const HDR_Y = sp(14)
    const HDR_H = sp(52)
    fillRR(PAD, HDR_Y, INNER_W, HDR_H, sp(8), CARD_BG)
    strokeRR(PAD, HDR_Y, INNER_W, HDR_H, sp(8), BORDER)
    context.setFillStyle(GREEN)
    context.setFontSize(fs(13))
    context.fillText('NBA2KOL2 合卡理智卫士 · 操盘报告', PAD + sp(10), HDR_Y + sp(22))
    context.setFillStyle(T_SUB)
    context.setFontSize(fs(9))
    context.fillText(
      `生成时间: ${formatTime(new Date().toISOString(), true)}  ·  初始${this.data.initialCards}张 → 当前${this.data.currentCards}张`,
      PAD + sp(10), HDR_Y + sp(40)
    )

    // ══ SECTION 1：Sparkline 折线图 ══
    const CY = HDR_Y + HDR_H + sp(8)
    const CH = sp(94)
    fillRR(PAD, CY, INNER_W, CH, sp(8), CARD_BG)
    strokeRR(PAD, CY, INNER_W, CH, sp(8), BORDER)
    context.setFillStyle(T_MAIN)
    context.setFontSize(fs(10))
    context.fillText('本场资本回撤 & 波动趋势 (Wealth Curve)', PAD + sp(10), CY + sp(18))

    const trend = this.data.wealthTrend as number[]
    if (trend && trend.length >= 2) {
      const PX = PAD + sp(8)
      const PY = CY + sp(26)
      const PW = INNER_W - sp(16)
      const PH = sp(50)
      const PV = sp(5)
      const minV = Math.min(...trend)
      const maxV = Math.max(...trend)
      const vRange = maxV - minV || 1
      const isUp = trend[trend.length - 1] >= trend[0]
      const pts = trend.map((v, i) => ({
        x: PX + (i / (trend.length - 1)) * PW,
        y: PY + PH - PV - ((v - minV) / vRange) * (PH - PV * 2),
      }))
      // 中轴线
      context.setStrokeStyle(isDark ? '#334155' : '#e2e8f0')
      context.setLineWidth(1)
      context.beginPath()
      context.moveTo(PX, PY + PH / 2)
      context.lineTo(PX + PW, PY + PH / 2)
      context.stroke()
      // 面积
      context.setFillStyle(isUp ? EMERALD_DIM : RED_DIM)
      context.beginPath()
      context.moveTo(pts[0].x, pts[0].y)
      pts.forEach(p => context.lineTo(p.x, p.y))
      context.lineTo(PX + PW, PY + PH)
      context.lineTo(PX, PY + PH)
      context.closePath()
      context.fill()
      // 折线
      context.setStrokeStyle(isUp ? GREEN : RED)
      context.setLineWidth(sp(2))
      context.beginPath()
      pts.forEach((p, i) => i === 0 ? context.moveTo(p.x, p.y) : context.lineTo(p.x, p.y))
      context.stroke()
      // 末端点
      const last = pts[pts.length - 1]
      context.setFillStyle(isUp ? '#34d399' : '#f87171')
      context.beginPath()
      context.arc(last.x, last.y, sp(3), 0, Math.PI * 2)
      context.fill()
      // 标注
      context.setFillStyle(T_SUB)
      context.setFontSize(fs(8))
      context.fillText(`波谷: ${this.data.wealthMin}张`, PX, PY + PH + sp(13))
      context.setTextAlign('right')
      context.fillText(`峰值: ${this.data.wealthMax}张`, PX + PW, PY + PH + sp(13))
      context.setTextAlign('left')
    } else {
      context.setFillStyle(T_SUB)
      context.setFontSize(fs(9))
      context.fillText('暂无走势，记录合卡后自动描绘。', PAD + sp(10), CY + CH / 2 + sp(5))
    }

    // ══ SECTION 2：双列统计卡片 ══
    const SY = CY + CH + sp(8)
    const SH = sp(84)
    const HW = Math.floor((INNER_W - sp(6)) / 2)

    // 左卡
    fillRR(PAD, SY, HW, SH, sp(8), CARD_BG)
    strokeRR(PAD, SY, HW, SH, sp(8), BORDER)
    context.setFillStyle(T_SUB)
    context.setFontSize(fs(9))
    context.fillText('实测胜率 vs 官方胜率', PAD + sp(8), SY + sp(16))
    const actualRate = this.data.reportStats.actualRate
    const expectedRate = this.data.reportStats.expectedRateAvg
    context.setFillStyle(actualRate >= expectedRate ? GREEN : (isDark ? '#d1d5db' : '#374151'))
    context.setFontSize(fs(19))
    context.fillText(this.data.reportStats.actualRateText, PAD + sp(8), SY + sp(44))
    context.setFillStyle(T_SUB)
    context.setFontSize(fs(9))
    context.fillText(`/ ${this.data.reportStats.expectedRateText}  偏离: ${this.data.reportStats.rateGapText}`, PAD + sp(8), SY + sp(57))
    fillRR(PAD + sp(6), SY + sp(63), HW - sp(12), sp(16), sp(4), isDark ? '#1e293b' : '#f1f5f9')
    context.setFillStyle(AMBER)
    context.setFontSize(fs(8))
    context.fillText(`气运: ${this.data.reportStats.luckMeter}`, PAD + sp(10), SY + sp(73))

    // 右卡
    const RX = PAD + HW + sp(6)
    fillRR(RX, SY, HW, SH, sp(8), CARD_BG)
    strokeRR(RX, SY, HW, SH, sp(8), BORDER)
    context.setFillStyle(T_SUB)
    context.setFontSize(fs(9))
    context.fillText('本轮战绩纪录', RX + sp(8), SY + sp(16))
    const MW = Math.floor((HW - sp(24)) / 2)
    fillRR(RX + sp(8), SY + sp(22), MW, sp(36), sp(4), isDark ? '#0b1220' : '#f8fafc')
    context.setFillStyle(T_SUB); context.setFontSize(fs(8))
    context.fillText('最高连红', RX + sp(10), SY + sp(33))
    context.setFillStyle(GREEN); context.setFontSize(fs(13))
    context.fillText(`${this.data.reportStats.maxWinStreak}连`, RX + sp(10), SY + sp(52))
    fillRR(RX + sp(8) + MW + sp(4), SY + sp(22), MW, sp(36), sp(4), isDark ? '#0b1220' : '#f8fafc')
    context.setFillStyle(T_SUB); context.setFontSize(fs(8))
    context.fillText('最高连黑', RX + sp(12) + MW + sp(4), SY + sp(33))
    context.setFillStyle(RED); context.setFontSize(fs(13))
    context.fillText(`${this.data.reportStats.maxLossStreak}连`, RX + sp(12) + MW + sp(4), SY + sp(52))
    const streakType = this.data.reportStats.currentStreakType
    const sBg = streakType === 'win' ? (isDark ? 'rgba(16,185,129,0.2)' : '#d1fae5')
              : streakType === 'loss' ? (isDark ? 'rgba(239,68,68,0.2)' : '#fee2e2')
              : (isDark ? '#1e293b' : '#f1f5f9')
    fillRR(RX + sp(6), SY + sp(63), HW - sp(12), sp(16), sp(4), sBg)
    context.setFillStyle(streakType === 'win' ? GREEN : streakType === 'loss' ? RED : T_SUB)
    context.setFontSize(fs(8))
    context.fillText(this.data.reportStats.currentStreakText, RX + sp(10), SY + sp(73))

    // ══ SECTION 3：操盘诊断白皮书 ══
    const WY = SY + SH + sp(8)
    const WRH = sp(28)   // 每行高度
    const WROWS = 5
    const WH = WRH * WROWS + sp(8)   // 5行 + 顶部标题空间
    fillRR(PAD, WY, INNER_W, WH, sp(8), CARD_BG)
    strokeRR(PAD, WY, INNER_W, WH, sp(8), BORDER)
    context.setFillStyle(GREEN)
    context.setFontSize(fs(10))
    context.fillText('操盘诊断白皮书', PAD + sp(8), WY + sp(16))

    const drawRow = (label: string, val: string, valColor: string, y: number, alt = false) => {
      if (alt) {
        context.setFillStyle(isDark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.025)')
        context.fillRect(PAD, y, INNER_W, WRH)
      }
      context.setFillStyle(T_SUB); context.setFontSize(fs(9))
      context.fillText(label, PAD + sp(8), y + sp(18))
      context.setFillStyle(valColor); context.setFontSize(fs(9))
      context.setTextAlign('right')
      context.fillText(val, PAD + INNER_W - sp(8), y + sp(18))
      context.setTextAlign('left')
      context.setStrokeStyle(BORDER); context.setLineWidth(1)
      context.beginPath()
      context.moveTo(PAD, y + WRH); context.lineTo(PAD + INNER_W, y + WRH)
      context.stroke()
    }

    const netCum = Number(this.data.reportStats.netCumulative)
    const dPct = Number(this.data.sanityMetrics.maxDrawdownPercent)
    const lPct = Number(this.data.drawDownLimitPercent)
    const R0 = WY + sp(8)
    drawRow('当前资本余额', `${this.data.currentCards}张 (${this.data.reportStats.netCumulativeText})`, netCum >= 0 ? GREEN : RED, R0)
    drawRow('整体偏离实测胜率', `${this.data.reportStats.actualRateText} / 官方${this.data.reportStats.expectedRateText}`, actualRate >= expectedRate ? GREEN : T_MAIN, R0 + WRH, true)
    drawRow('波谷回撤警戒', `${dPct.toFixed(1)}%  阈值${lPct}%`, dPct >= lPct ? RED : T_MAIN, R0 + WRH * 2)
    drawRow('极端峰值连转', `连红${this.data.reportStats.maxWinStreak}发 | 连黑${this.data.reportStats.maxLossStreak}发`, T_MAIN, R0 + WRH * 3, true)
    // 鉴定意见行（文字可能较长，缩小字体单行显示）
    const ADV_Y = R0 + WRH * 4
    context.setFillStyle(T_SUB); context.setFontSize(fs(8))
    context.fillText(`鉴定(${this.data.reportStats.luckMeter}): `, PAD + sp(8), ADV_Y + sp(11))
    context.setFillStyle(T_MAIN); context.setFontSize(fs(8))
    // 截断超长建议文本
    const advText = this.data.sanityMetrics.advice || ''
    const maxAdvW = INNER_W - sp(16) - context.measureText(`鉴定(${this.data.reportStats.luckMeter}): `).width
    let advShort = ''
    for (let i = 0; i < advText.length; i++) {
      const next = advShort + advText[i]
      if (context.measureText(next).width > maxAdvW) break
      advShort = next
    }
    context.fillText(
      advShort + (advShort.length < advText.length ? '…' : ''),
      PAD + sp(8) + context.measureText(`鉴定(${this.data.reportStats.luckMeter}): `).width,
      ADV_Y + sp(11)
    )
    // 第二行放完整建议
    context.setFillStyle(T_SUB); context.setFontSize(fs(8))
    this.wrapCanvasText(context, advText, PAD + sp(8), ADV_Y + sp(21), INNER_W - sp(16), sp(13))

    // ══ SECTION 4：认知偏差 ══
    const DY = WY + WH + sp(8)
    const DH = sp(76)
    fillRR(PAD, DY, INNER_W, DH, sp(8), isDark ? '#0b1a12' : '#f0fdf4')
    strokeRR(PAD, DY, INNER_W, DH, sp(8), isDark ? '#14532d' : '#bbf7d0')
    context.setFillStyle(GREEN); context.setFontSize(fs(10))
    context.fillText(this.data.cognitiveDiagnosis.biasName, PAD + sp(8), DY + sp(18))
    context.setFillStyle(isDark ? '#86efac' : '#166534'); context.setFontSize(fs(8))
    this.wrapCanvasText(context, this.data.cognitiveDiagnosis.biasDes, PAD + sp(8), DY + sp(32), INNER_W - sp(16), sp(13))
    context.setFillStyle(T_SUB); context.setFontSize(fs(8))
    context.fillText(`理智指数: ${this.data.sanityMetrics.score}/100`, PAD + sp(8), DY + DH - sp(8))

    // ══ SECTION 5：流水明细 ══
    const LY = DY + DH + sp(8)
    context.setFillStyle(T_MAIN); context.setFontSize(fs(10))
    context.fillText(`全息账目流水 (${recordCount}条)`, PAD, LY + sp(16))

    if (recordCount === 0) {
      fillRR(PAD, LY + sp(22), INNER_W, sp(32), sp(6), isDark ? '#111827' : '#f8fafc')
      context.setFillStyle(T_SUB); context.setFontSize(fs(9))
      context.fillText('暂无流水，请在控台记录合卡操作。', PAD + sp(10), LY + sp(42))
    } else {
      let rY = LY + sp(22)
      records.slice(0, 8).forEach((item: any) => {
        const rH = LEDGER_ROW_H - sp(4)
        fillRR(PAD, rY, INNER_W, rH, sp(6), isDark ? '#111827' : '#f8fafc')
        strokeRR(PAD, rY, INNER_W, rH, sp(6), BORDER)
        context.setFillStyle(item.success ? GREEN : RED)
        context.fillRect(PAD, rY, sp(4), rH)
        context.setFillStyle(T_MAIN); context.setFontSize(fs(10))
        context.fillText(item.title, PAD + sp(10), rY + sp(16))
        context.setFillStyle(T_SUB); context.setFontSize(fs(8))
        context.fillText(`${item.timeLabel} · ${item.formulaName} · ${item.successRate}%`, PAD + sp(10), rY + sp(29))
        context.setFillStyle(item.success ? GREEN : RED); context.setFontSize(fs(10))
        context.setTextAlign('right')
        context.fillText(`${item.netChangeText}张`, PAD + INNER_W - sp(6), rY + sp(16))
        context.setFillStyle(T_SUB); context.setFontSize(fs(8))
        context.fillText(item.sanityText || '', PAD + INNER_W - sp(6), rY + sp(29))
        context.setTextAlign('left')
        rY += LEDGER_ROW_H
      })
      if (recordCount > 8) {
        context.setFillStyle(T_SUB); context.setFontSize(fs(8))
        context.fillText(`... 还有 ${recordCount - 8} 条更早记录`, PAD + sp(6), rY + sp(16))
      }
    }

    // ══ 底部水印 ══
    context.setFillStyle(T_SUB); context.setFontSize(fs(8))
    context.fillText('NBA2KOL2 合卡理智卫士 · 小程序版', PAD, totalHeight - sp(10))

    context.draw(false, () => {
      wx.canvasToTempFilePath(
        {
          canvasId: 'guardianReportCanvas',
          destWidth: W * 2,
          destHeight: totalHeight * 2,
          success: (result) => {
            wx.previewImage({ urls: [result.tempFilePath], current: result.tempFilePath })
            this.setReportGenerated()
          },
          fail: () => {
            wx.showToast({ title: '报告生成失败，请重试', icon: 'none' })
          },
        },
        this,
      )
    })
  },

  handleGenerateReport(this: GuardianPageInstance) {
    playTapFeedback(this._persistentState.soundEnabled, 'medium')
    const screenW = this.data.windowWidth as number || 375
    // 缩放系数：以 375px 为基准
    const S = screenW / 375
    const recordCount = (this.data.recordList as any[]).length
    const LEDGER_ROWS = Math.min(recordCount, 8)
    // 总高度 = 基础高度(720基准) + 流水行(每行48px基准) + 底部，按S缩放
    const cssHeight = Math.round((720 + LEDGER_ROWS * 48 + 40) * S)
    this.setData({ reportCanvasHeight: cssHeight }, () => {
      setTimeout(() => this.drawReportCanvas(), 120)
    })
  },
} as any)
