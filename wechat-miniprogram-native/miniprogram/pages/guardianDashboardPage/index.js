"use strict";
var import_guardian_data = require("../../utils/guardian-data");
var import_guardian_runtime = require("../../utils/guardian-runtime");
// ===== 群二维码通知配置 =====
// 更新群二维码后，把 QR_CODE_NOTICE_VERSION 改成一个新值（建议用发布日期），
// 即可让所有设备重新收到一次群通知弹窗；每台设备点一次「我知道了」后不再弹出。
const QR_CODE_NOTICE_VERSION = "2026-09-23";
const QR_CODE_NOTICE_VERSION_KEY = "nba2k_qr_notice_version_v1";
const EMPTY_SANITY = {
  score: 100,
  status: "excellent",
  advice: "\u5FC3\u5883\u6F84\u660E\uFF0C\u7406\u667A\u503C\u767E\u5206\u767E\u3002\u8FD9\u662F\u6700\u5B8C\u7F8E\u7684\u5F3A\u5316\u65F6\u95F4\u7A97\uFF01",
  colorClass: "emerald",
  recentFailStreak: 0,
  consecutiveWins: 0,
  consecutiveLosses: 0,
  maxDrawdown: 0,
  maxDrawdownPercent: 0
};
function compactFormulaName(formulaName) {
  return String(formulaName || "").replace(/\s+/g, "").replace(/\uFF08/g, "(").replace(/\uFF09/g, ")");
}
function formatRuleDisplayText(targetStar, formulaName) {
  return `${targetStar}\u7A81+${compactFormulaName(formulaName)}`;
}
function buildRuleOptions(targetStar) {
  return import_guardian_data.UPGRADE_RULES.filter((item) => item.targetStar === targetStar).map((item) => ({
    ...item,
    displayText: formatRuleDisplayText(item.targetStar, item.formulaName)
  }));
}
function buildRecordTitle(rule, success) {
  return `${rule.targetStar} \u7A81\u5F3A\u5316 \xB7 ${success ? "\u5347\u661F\u6210\u529F!" : "\u5F3A\u5316\u5931\u8D25... \u7206"}`;
}
Page({
  data: {
    showQrCodeModal: false,
    statusBarHeight: 0,
    menuButtonHeight: 0,
    headerPaddingTop: 0,
    headerHeight: 0,
    headerBarHeight: 0,
    headerRightSafe: 96,
    windowWidth: 375,
    reportCanvasHeight: 720,
    theme: "light",
    soundEnabled: true,
    initialCards: import_guardian_data.DEFAULT_INITIAL_CARDS,
    initialCardsInput: String(import_guardian_data.DEFAULT_INITIAL_CARDS),
    records: [],
    selectedRuleId: import_guardian_data.DEFAULT_SELECTED_RULE_ID,
    drawDownLimitPercent: import_guardian_data.DEFAULT_DRAWDOWN_LIMIT,
    currentTab: "console",
    activeStarTab: 5,
    showReportBadge: false,
    showStrategyHelp: false,
    strategyTricks: [
      "3+1\uFF1A321 \u70B8\u4E00\u6B21\uFF0C\u7136\u540E\u5230\u6210\uFF0C\u518D\u70B8 42",
      "4+1\uFF1A\u70B8\u56DB\u6B21\u6216\u8005\u516B\u6B21 41",
      "4+2\uFF1A21 \u4E0A 3\uFF0C321 \u4E0A 4\uFF0C54 \u4E0A 6",
      "421\uFF1A\u57AB\u5B50 41 \u70B8\u56DB\u6B21\uFF0C\u518D\u70B8 42\uFF0C\u518D\u70B8\u4E00\u624B 421\uFF08\u70B8 321\uFF0C\u70B8\u4E24\u6B21 41\uFF09",
      "431\uFF1A\u57AB\u5B50\u70B8 421 \u76F4\u63A5\u8FFD",
      "521\uFF1A41 \u70B8\u56DB\u6B21\uFF0C42 \u70B8\u4E00\u6B21\uFF0C421 \u70B8\u4E00\u6B21",
      "53\uFF1A\u70B8\u4E2A\u4E09\u6B21 53",
      "542\uFF1A\u57AB\u5B50\u70B8 72% \u76F4\u63A5\u8FFD",
      "543\uFF1A21 \u4E0A 3\uFF0C321 \u4E0A 4\uFF0C\u7EE7\u7EED\u770B\u57AB\u5B50 2+1 \u4E0A 3\uFF0C\u7136\u540E\u8FFD 543 \u70B8 5+1",
      "5421\uFF1A48% \u70B8\u4E09\u6B21\u4EE5\u4E0A\u76F4\u63A5\u8FFD",
      "6321\uFF1A616262163631632 \u76F4\u63A5\u8FFD",
      "64\uFF1A21 \u4E0A 3\uFF0C321 \u4E0A 4\uFF0C54 \u4E0A 6 \u76F4\u63A5\u8FFD",
      "21 \u4E0A 3\uFF0C321 \u4E0A 4\uFF0C43 \u4E0A 5\uFF0C54 \u4E0A 6",
      "65\uFF1A\u52A0\u4E00\u5230 4\uFF0C43 \u70B8\u4E86\u76F4\u63A5\u8FFD",
      "\u62C6 7\uFF1A\u70B8\u56DB\u624B 41\uFF0C\u70B8\u624B 64 \u76F4\u63A5\u8FFD\uFF0841 \u70B8\u4E24\u6B21\uFF0C42 \u70B8\u4E24\u6B21\uFF0C421 \u70B8\u4E24\u6B21\uFF09"
    ],
    isExclusivePanelExpanded: true,
    isBreathingModalOpen: false,
    breathingCountdown: 3,
    breathingTimer: 0,
    breathingPhase: "inhale",
    breathingCardIndex: 0,
    showResetDialog: false,
    reportGenerated: false,
    isLedgerExpanded: true,
    currentRulePickerIndex: 0,
    starOptions: [2, 3, 4, 5, 6],
    icons: {},
    selectedRule: (0, import_guardian_runtime.findRuleById)(import_guardian_data.DEFAULT_SELECTED_RULE_ID),
    currentRules: [],
    currentCards: import_guardian_data.DEFAULT_INITIAL_CARDS,
    maxDrawdownPercent: 0,
    drawdownPeak: import_guardian_data.DEFAULT_INITIAL_CARDS,
    mathExpectationFormatted: "0.000",
    isExpPositive: false,
    expectationTone: "neutral",
    expectationBadgeText: "\u5747\u8861\u65B9\u6848",
    expectationHintText: "\u5207\u6362\u914D\u65B9\u540E\u4F1A\u52A8\u6001\u91CD\u7B97\u6570\u5B66\u671F\u671B\u3002",
    expectationValueText: "-0.00 \u5F20",
    recordsCount: 0,
    records24: [],
    records48: [],
    exclusive24: { total: 0, wins: 0, losses: 0, actualRateText: "--", netCards: 0, netCardsText: "0" },
    exclusive48: { total: 0, wins: 0, losses: 0, actualRateText: "--", netCards: 0, netCardsText: "0" },
    gridSlots: [],
    reportStats: {
      total: 0,
      wins: 0,
      losses: 0,
      actualRate: 0,
      actualRateText: "0.0%",
      expectedRateAvg: 0,
      expectedRateText: "0.0%",
      rateGapText: "0.0%",
      luckMeter: "\u6982\u7387\u5B88\u6052",
      luckFeedback: "",
      netCumulative: 0,
      netCumulativeText: "0",
      maxWinStreak: 0,
      maxLossStreak: 0,
      currentStreakType: "none",
      currentStreakCount: 0,
      currentStreakText: "\u65E0\u6392\u961F"
    },
    recordList: [],
    sanityMetrics: EMPTY_SANITY,
    cognitiveDiagnosis: {
      biasName: "\u6E29\u548C\u5E73\u7406\u667A\u72B6\u6001",
      biasDes: "\u64CD\u4F5C\u4E2D\u89C4\u4E2D\u77E9\uFF0C\u8D26\u7C3F\u76C8\u4E8F\u6CE2\u52A8\u5065\u5EB7\u3002"
    },
    breathingCard: {
      title: "\u7406\u667A\u81EA\u9192",
      content: "\u6DF1\u547C\u5438\u4E4B\u540E\u518D\u505A\u51B3\u5B9A\u3002"
    },
    breathingCueText: "\u6DF1\u5438\u4E00\u53E3\u6C14...",
    breathingCircleScale: 1,
    breathingCueTone: "sky",
    wealthTrend: [import_guardian_data.DEFAULT_INITIAL_CARDS],
    wealthMin: import_guardian_data.DEFAULT_INITIAL_CARDS,
    wealthMax: import_guardian_data.DEFAULT_INITIAL_CARDS,
    wealthIsUp: true,
    showRecordEditor: false,
    editingRecordId: "",
    editRecordTargetStar: (0, import_guardian_runtime.findRuleById)(import_guardian_data.DEFAULT_SELECTED_RULE_ID).targetStar,
    editRecordRuleOptions: [],
    editRecordRuleIndex: 0,
    editRecordSuccess: true,
    editRecordTimeLabel: "",
    editRecordRuleLabel: "",
    editRecordRatePreview: "--",
    editRecordNetPreview: "0\u5F20"
  },
  onLoad() {
    // 群二维码通知：仅当本设备还没确认过「当前版本」时才自动弹出一次
    // 注意：这里不能清 storage，否则每次进页面都会重复弹出
    const confirmedQrNoticeVersion = wx.getStorageSync(QR_CODE_NOTICE_VERSION_KEY);
    if (confirmedQrNoticeVersion !== QR_CODE_NOTICE_VERSION) {
      this.setData({ showQrCodeModal: true });
    }

    const systemInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();

    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const menuButtonHeight = menuButton.height || 32;
    const topGap = Math.max((menuButton.top || statusBarHeight) - statusBarHeight, 8);
    const headerBarHeight = menuButtonHeight + topGap * 2;
    const headerHeight = statusBarHeight + headerBarHeight;
    const windowWidth = systemInfo.windowWidth || systemInfo.screenWidth || 375;
    const headerRightSafe = Math.max(windowWidth - menuButton.left + 12, 96);
    const headerPaddingTop = statusBarHeight;

    this.setData({
      statusBarHeight,
      menuButtonHeight,
      headerPaddingTop,
      headerHeight,
      headerBarHeight,
      headerRightSafe,
      windowWidth,
      reportCanvasHeight: Math.round((20 + (48 * 5) + 20) * (windowWidth / 375)),
    });

    this._persistentState = (0, import_guardian_runtime.loadGuardianPersistentState)();
    this._uiState = (0, import_guardian_runtime.createDefaultUiState)(this._persistentState.selectedRuleId);
    wx.showShareMenu({
      menus: ["shareAppMessage", "shareTimeline"]
    });
    this.syncView();
  },
  onShow() {
    if (this.data.currentTab === "report") {
      setTimeout(() => this.drawTrendCanvas(), 40);
    }
  },
  onUnload() {
    this.clearAllTimers();
  },
  onShareAppMessage() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    return {
      title: "NBA2KOL2 合卡理智卫士 - 科学合卡，拒绝上头",
      path: "/pages/guardianDashboardPage/index"
    };
  },
  onShareTimeline() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    return {
      title: "NBA2KOL2 合卡理智卫士 - 科学合卡，拒绝上头",
      query: "from=timeline"
    };
  },
  clearAllTimers() {
    if (this._badgeTimer) {
      clearTimeout(this._badgeTimer);
      this._badgeTimer = void 0;
    }
    if (this._breathingCountdownTimer) {
      clearInterval(this._breathingCountdownTimer);
      this._breathingCountdownTimer = void 0;
    }
    if (this._breathingPulseTimer) {
      clearInterval(this._breathingPulseTimer);
      this._breathingPulseTimer = void 0;
    }
  },
  syncView() {
    (0, import_guardian_runtime.persistGuardianPersistentState)(this._persistentState);
    const dashboardView = (0, import_guardian_runtime.buildDashboardView)(this._persistentState, this._uiState);
    const currentRulePickerIndex = dashboardView.currentRules.findIndex(
      (item) => item.id === dashboardView.selectedRule.id
    );
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
        ...dashboardView
      },
      () => {
        if (this.data.currentTab === "report") {
          this.drawTrendCanvas();
        }
      }
    );
  },
  setReportGenerated() {
    this.setData({ reportGenerated: true });
    setTimeout(() => {
      this.setData({ reportGenerated: false });
    }, 1800);
  },
  handleToggleSound() {
    const nextValue = !this._persistentState.soundEnabled;
    this._persistentState.soundEnabled = nextValue;
    if (nextValue) {
      (0, import_guardian_runtime.playTapFeedback)(true, "light");
    }
    this.syncView();
  },
  handleToggleTheme() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this._persistentState.theme = this._persistentState.theme === "dark" ? "light" : "dark";
    this.syncView();
  },
  handleSwitchTab(event) {
    const tab = String(event.currentTarget.dataset.tab || "console");
    if (tab === this._uiState.currentTab) {
      return;
    }
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this._uiState.currentTab = tab;
    if (tab === "report") {
      this._uiState.showReportBadge = false;
    }
    this.syncView();
  },
  handleStarTabTap(event) {
    const star = Number(event.currentTarget.dataset.star || 5);
    this._uiState.activeStarTab = star;
    const matchingRule = import_guardian_data.UPGRADE_RULES.find((item) => item.targetStar === star) || (0, import_guardian_runtime.findRuleById)(import_guardian_data.DEFAULT_SELECTED_RULE_ID);
    this._persistentState.selectedRuleId = matchingRule.id;
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this.syncView();
  },
  handleRulePickerChange(event) {
    const index = Number(event.detail.value || 0);
    const nextRule = this.data.currentRules[index];
    if (!nextRule) {
      return;
    }
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this._persistentState.selectedRuleId = nextRule.id;
    this.syncView();
  },
  handleInitialCardsInput(event) {
    this.setData({ initialCardsInput: event.detail.value });
  },
  handleInitialCardsCommit() {
    const parsed = Number(this.data.initialCardsInput);
    const nextValue = Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : this._persistentState.initialCards;
    this._persistentState.initialCards = nextValue;
    this.syncView();
  },
  handleToggleExclusivePanel() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this._uiState.isExclusivePanelExpanded = !this._uiState.isExclusivePanelExpanded;
    this.syncView();
  },
  handleToggleLedger() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this.setData({ isLedgerExpanded: !this.data.isLedgerExpanded });
  },
  handleToggleStrategyHelp() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this._uiState.showStrategyHelp = !this._uiState.showStrategyHelp;
    this.syncView();
  },
  noop() {
  },
  handleTrendSlotTap(event) {
    if (!event.currentTarget.dataset.filled) {
      return;
    }
    const recordId = String(event.currentTarget.dataset.id || "");
    const record = this._persistentState.records.find((item) => item.id === recordId);
    if (!record) {
      return;
    }
    const editRecordRuleOptions = buildRuleOptions(record.targetStar);
    const editRecordRuleIndex = Math.max(0, editRecordRuleOptions.findIndex((item) => item.id === record.ruleId));
    const currentRule = editRecordRuleOptions[editRecordRuleIndex] || editRecordRuleOptions[0];
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this.setData({
      showRecordEditor: true,
      editingRecordId: record.id,
      editRecordTargetStar: record.targetStar,
      editRecordRuleOptions,
      editRecordRuleIndex,
      editRecordSuccess: record.success,
      editRecordTimeLabel: (0, import_guardian_runtime.formatTime)(record.timestamp, true),
      editRecordRuleLabel: currentRule ? currentRule.displayText : formatRuleDisplayText(record.targetStar, record.formulaName),
      editRecordRatePreview: `${record.successRate}%`,
      editRecordNetPreview: `${record.netChange > 0 ? "+" : ""}${record.netChange}\u5F20`
    });
  },
  handleCloseRecordEditor() {
    this.setData({
      showRecordEditor: false,
      editingRecordId: "",
      editRecordRuleOptions: [],
      editRecordRuleIndex: 0
    });
  },
  handleRecordEditorStarChange(event) {
    const targetStar = Number(event.currentTarget.dataset.star || this.data.editRecordTargetStar);
    const editRecordRuleOptions = buildRuleOptions(targetStar);
    const currentRule = editRecordRuleOptions[0];
    if (!currentRule) {
      return;
    }
    this.setData({
      editRecordTargetStar: targetStar,
      editRecordRuleOptions,
      editRecordRuleIndex: 0,
      editRecordRuleLabel: currentRule.displayText,
      editRecordRatePreview: `${currentRule.successRate}%`,
      editRecordNetPreview: `${this.data.editRecordSuccess ? `+${currentRule.successGain}` : `-${currentRule.failLoss}`}\u5F20`
    });
  },
  handleRecordEditorRuleChange(event) {
    const editRecordRuleIndex = Number(event.detail.value || 0);
    const currentRule = this.data.editRecordRuleOptions[editRecordRuleIndex];
    if (!currentRule) {
      return;
    }
    this.setData({
      editRecordRuleIndex,
      editRecordRuleLabel: currentRule.displayText,
      editRecordRatePreview: `${currentRule.successRate}%`,
      editRecordNetPreview: `${this.data.editRecordSuccess ? `+${currentRule.successGain}` : `-${currentRule.failLoss}`}\u5F20`
    });
  },
  handleRecordEditorOutcomeChange(event) {
    const success = String(event.currentTarget.dataset.success) === "true";
    const currentRule = this.data.editRecordRuleOptions[this.data.editRecordRuleIndex];
    this.setData({
      editRecordSuccess: success,
      editRecordNetPreview: currentRule ? `${success ? `+${currentRule.successGain}` : `-${currentRule.failLoss}`}\u5F20` : this.data.editRecordNetPreview
    });
  },
  handleConfirmRecordEdit() {
    const editingRecordId = this.data.editingRecordId;
    const currentRule = this.data.editRecordRuleOptions[this.data.editRecordRuleIndex];
    if (!editingRecordId || !currentRule) {
      return;
    }
    // 1. 修改记录的核心字段
    let nextRecords = this._persistentState.records.map((item) => {
      if (item.id !== editingRecordId) {
        return item;
      }
      return {
        ...item,
        ruleId: currentRule.id,
        formulaName: currentRule.formulaName,
        targetStar: currentRule.targetStar,
        successRate: currentRule.successRate,
        success: this.data.editRecordSuccess,
        failLoss: currentRule.failLoss,
        successGain: currentRule.successGain,
        netChange: this.data.editRecordSuccess ? currentRule.successGain : -currentRule.failLoss,
        title: buildRecordTitle(currentRule, this.data.editRecordSuccess)
      };
    });

    // 2. 重新标准化整个 records，包括重新计算 occurrenceGlobalIndex、sanityScoreBefore/After
    nextRecords = (0, import_guardian_runtime.normalizeRecords)(nextRecords, this._persistentState.initialCards, this._persistentState.drawDownLimitPercent);

    // 3. 保存并刷新
    this._persistentState.records = nextRecords;
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "medium");
    this.setData({ showRecordEditor: false, reportGenerated: false });
    this.syncView();
  },
  handleOpenResetDialog() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this.setData({ showResetDialog: true });
  },
  handleCloseResetDialog() {
    this.setData({ showResetDialog: false });
  },
  handleConfirmReset() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "medium");
    this._persistentState.records = [];
    this._persistentState.initialCards = import_guardian_data.DEFAULT_INITIAL_CARDS;
    this._persistentState.forceCalmAlertShown = false;
    this._uiState.showReportBadge = false;
    this.setData({ showResetDialog: false, reportGenerated: false });
    this.syncView();
  },
  handleDeleteRecord(event) {
    const targetId = String(event.currentTarget.dataset.id || "");
    if (!targetId) {
      return;
    }
    wx.showModal({
      title: "\u786E\u5B9A\u8981\u64A4\u9500\u5E76\u56DE\u6EDA\u672C\u7B14\u8D26\u76EE\uFF1F",
      content: "\u8FD9\u4F1A\u5173\u8054\u5F71\u54CD\u5927\u5E95\u5361\u4F59\u989D\u53CA\u80DC\u7387\u8BA1\u7B97\u7684\u503C\u3002",
      success: (result) => {
        if (!result.confirm) {
          return;
        }
        (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
        this._persistentState.records = this._persistentState.records.filter((item) => item.id !== targetId);
        this.setData({ reportGenerated: false });
        this.syncView();
      }
    });
  },
  handleDrawDownLimitChange(event) {
    this._persistentState.drawDownLimitPercent = Number(event.detail.value || import_guardian_data.DEFAULT_DRAWDOWN_LIMIT);
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "light");
    this.syncView();
  },
  handleManualBreathing() {
    this.openBreathingMode();
  },
  openBreathingMode() {
    this.clearAllTimers();
    this._uiState.isBreathingModalOpen = true;
    this._uiState.breathingCountdown = 3;
    this._uiState.breathingTimer = 0;
    this._uiState.breathingPhase = "inhale";
    this._uiState.breathingCardIndex = (0, import_guardian_runtime.getRandomBreathingCardIndex)();
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "medium");
    this.syncView();
    this._breathingCountdownTimer = setInterval(() => {
      if (this._uiState.breathingCountdown > 0) {
        this._uiState.breathingCountdown -= 1;
        this.setData({ breathingCountdown: this._uiState.breathingCountdown });
      }
      if (this._uiState.breathingCountdown <= 0 && this._breathingCountdownTimer) {
        clearInterval(this._breathingCountdownTimer);
        this._breathingCountdownTimer = void 0;
      }
    }, 1e3);
    this._breathingPulseTimer = setInterval(() => {
      const nextValue = (this._uiState.breathingTimer + 1.5) % 100;
      this._uiState.breathingTimer = nextValue;
      this._uiState.breathingPhase = nextValue < 40 ? "inhale" : nextValue < 60 ? "hold" : "exhale";
      const breathingVisual = (0, import_guardian_runtime.getBreathingVisual)(this._uiState);
      this.setData({
        breathingTimer: this._uiState.breathingTimer,
        breathingPhase: this._uiState.breathingPhase,
        breathingCueText: breathingVisual.breathingCueText,
        breathingCircleScale: breathingVisual.breathingCircleScale,
        breathingCueTone: breathingVisual.breathingCueTone
      });
    }, 45);
  },
  handleConfirmBreathing() {
    if (this._uiState.breathingCountdown > 0) {
      return;
    }
    this.clearAllTimers();
    this._uiState.isBreathingModalOpen = false;
    this.syncView();
  },
  handleLogUpgrade(event) {
    const success = String(event.currentTarget.dataset.success) === "true";
    const beforeScore = this.data.sanityMetrics.score;
    const selectedRule = (0, import_guardian_runtime.findRuleById)(this._persistentState.selectedRuleId);
    const nextRecord = (0, import_guardian_runtime.createRecord)(selectedRule, success, beforeScore);
    const nextRecords = [...this._persistentState.records, nextRecord];
    const tempState = { ...this._persistentState, records: nextRecords };
    const nextView = (0, import_guardian_runtime.buildDashboardView)(tempState, this._uiState);
    nextRecord.sanityScoreAfter = nextView.sanityMetrics.score;
    this._persistentState.records = nextRecords;
    this.setData({ reportGenerated: false });
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, success ? "medium" : "heavy");
    // 合卡专用音效：成功用四音上行，失败用下滑嗡声
    if (success) {
      (0, import_guardian_runtime.playSuccessFeedback)(this._persistentState.soundEnabled);
    } else {
      (0, import_guardian_runtime.playFailFeedback)(this._persistentState.soundEnabled);
    }
    if (nextView.sanityMetrics.score < 50 && beforeScore >= 50 && this._uiState.currentTab !== "report") {
      this._uiState.showReportBadge = true;
      if (this._badgeTimer) {
        clearTimeout(this._badgeTimer);
      }
      this._badgeTimer = setTimeout(() => {
        this._uiState.showReportBadge = false;
        this.setData({ showReportBadge: false });
      }, 5e3);
    }
    if (nextView.sanityMetrics.score < 20 && beforeScore >= 20 && !this._persistentState.forceCalmAlertShown) {
      this._persistentState.forceCalmAlertShown = true;
      this.openBreathingMode();
      return;
    }
    this.syncView();
  },
  drawTrendCanvas() {
    const trend = this.data.wealthTrend;
    if (!trend || trend.length === 0) {
      return;
    }
    const width = 340;
    const height = 75;
    const points = (0, import_guardian_runtime.getTrendCanvasPoints)(trend, width, height);
    if (!points.length) {
      return;
    }
    const isDark = this.data.theme === "dark";
    const lineColor = this.data.wealthIsUp ? "#10b981" : "#ef4444";
    const fillColor = this.data.wealthIsUp ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)";
    const axisColor = isDark ? "#334155" : "#e5e7eb";
    const dotColor = this.data.wealthIsUp ? "#34d399" : "#f87171";
    const context = wx.createCanvasContext("guardianTrendCanvas", this);
    context.clearRect(0, 0, width, height);
    context.setStrokeStyle(axisColor);
    context.setLineWidth(1);
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.stroke();
    context.setFillStyle(fillColor);
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.forEach((point) => context.lineTo(point.x, point.y));
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fill();
    context.setStrokeStyle(lineColor);
    context.setLineWidth(3);
    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.stroke();
    const lastPoint = points[points.length - 1];
    context.setFillStyle(dotColor);
    context.beginPath();
    context.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
    context.fill();
    context.draw();
  },
  wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
    let currentLine = "";
    let currentY = y;
    const chars = text.split("");
    chars.forEach((char, index) => {
      const nextLine = `${currentLine}${char}`;
      if (context.measureText(nextLine).width > maxWidth && currentLine) {
        context.fillText(currentLine, x, currentY);
        currentLine = char;
        currentY += lineHeight;
      } else {
        currentLine = nextLine;
      }
      if (index === chars.length - 1 && currentLine) {
        context.fillText(currentLine, x, currentY);
      }
    });
    return currentY;
  },
  drawReportCanvas() {
    const screenW = this.data.windowWidth || 375;
    const W = screenW;
    const PAD = Math.round(W * 0.056);
    const INNER_W = W - PAD * 2;
    const isDark = this.data.theme === "dark";
    const BG = isDark ? "#0f172a" : "#f8fafc";
    const CARD_BG = isDark ? "#111827" : "#ffffff";
    const BORDER = isDark ? "#1e293b" : "#e2e8f0";
    const T_MAIN = isDark ? "#f1f5f9" : "#0f172a";
    const T_SUB = isDark ? "#94a3b8" : "#64748b";
    const GREEN = "#10b981";
    const RED = "#ef4444";
    const AMBER = "#f59e0b";
    const S = W / 375;
    const fs = (n) => Math.round(n * S);
    const sp = (n) => Math.round(n * S);
    
    // 只绘制报告核心内容的高度（对应网页端reportRef的内容）
    // 网页端reportRef包含5行数据 + 一些padding
    const ROW_HEIGHT = sp(48);
    const PADDING_TOP = sp(20);
    const PADDING_BOTTOM = sp(20);
    const totalHeight = PADDING_TOP + (ROW_HEIGHT * 5) + PADDING_BOTTOM;
    
    const context = wx.createCanvasContext("guardianReportCanvas", this);

    // 辅助函数：��制圆角矩形
    const fillRR = (x, y, w, h, r, fill) => {
      context.setFillStyle(fill);
      context.beginPath();
      context.moveTo(x + r, y); context.lineTo(x + w - r, y);
      context.arcTo(x + w, y, x + w, y + r, r);
      context.lineTo(x + w, y + h - r);
      context.arcTo(x + w, y + h, x + w - r, y + h, r);
      context.lineTo(x + r, y + h);
      context.arcTo(x, y + h, x, y + h - r, r);
      context.lineTo(x, y + r);
      context.arcTo(x, y, x + r, y, r);
      context.closePath(); context.fill();
    };

    // 背景 - 使用白色或深色背景，与网页端reportRef的背景一致
    context.setFillStyle(CARD_BG);
    context.fillRect(0, 0, W, totalHeight);

    // 绘制边框 - 网页端reportRef有圆角边框
    context.setStrokeStyle(BORDER);
    context.setLineWidth(2);
    context.beginPath();
    context.moveTo(PAD + sp(8), PADDING_TOP);
    context.lineTo(W - PAD - sp(8), PADDING_TOP);
    context.arcTo(W - PAD, PADDING_TOP, W - PAD, PADDING_TOP + sp(8), sp(8));
    context.lineTo(W - PAD, totalHeight - PADDING_BOTTOM - sp(8));
    context.arcTo(W - PAD, totalHeight - PADDING_BOTTOM, W - PAD - sp(8), totalHeight - PADDING_BOTTOM, sp(8));
    context.lineTo(PAD + sp(8), totalHeight - PADDING_BOTTOM);
    context.arcTo(PAD, totalHeight - PADDING_BOTTOM, PAD, totalHeight - PADDING_BOTTOM - sp(8), sp(8));
    context.lineTo(PAD, PADDING_TOP + sp(8));
    context.arcTo(PAD, PADDING_TOP, PAD + sp(8), PADDING_TOP, sp(8));
    context.closePath();
    context.stroke();

    // 获取数据
    const reportStats = this.data.reportStats;
    const sanityMetrics = this.data.sanityMetrics;
    const currentCards = this.data.currentCards;
    const actualRate = reportStats.actualRate;
    const expectedRate = reportStats.expectedRateAvg;
    const drawDownLimitPercent = this.data.drawDownLimitPercent;
    const maxDrawdownPercent = sanityMetrics.maxDrawdownPercent;

    // 绘制5行数据（对应网页端reportRef的5行）
    const startY = PADDING_TOP;
    
    // 第1行：当前资本余额
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(10));
    context.fillText("当前资本余额", PAD + sp(12), startY + ROW_HEIGHT * 0.5);
    
    context.setFillStyle(T_MAIN);
    context.setFontSize(fs(14));
    context.setTextAlign("right");
    const netCumulativeText = reportStats.netCumulative >= 0 ? `+${reportStats.netCumulative}` : `${reportStats.netCumulative}`;
    context.fillText(`${currentCards} 张`, W - PAD - sp(12), startY + ROW_HEIGHT * 0.5 - fs(3));
    
    context.setFillStyle(reportStats.netCumulative >= 0 ? GREEN : RED);
    context.setFontSize(fs(10));
    context.fillText(`(${netCumulativeText})`, W - PAD - sp(12), startY + ROW_HEIGHT * 0.5 + fs(3));
    context.setTextAlign("left");
    
    // 分隔线
    context.setStrokeStyle(BORDER);
    context.setLineWidth(1);
    context.beginPath();
    context.moveTo(PAD + sp(12), startY + ROW_HEIGHT);
    context.lineTo(W - PAD - sp(12), startY + ROW_HEIGHT);
    context.stroke();

    // 第2行：整体偏离实测胜率（交替背景色）
    context.setFillStyle(isDark ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)");
    context.fillRect(PAD, startY + ROW_HEIGHT, W - PAD * 2, ROW_HEIGHT);
    
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(10));
    context.fillText("整体偏离实测胜率", PAD + sp(12), startY + ROW_HEIGHT * 1.5);
    
    context.setFillStyle(actualRate >= expectedRate ? GREEN : T_MAIN);
    context.setFontSize(fs(14));
    context.setTextAlign("right");
    context.fillText(reportStats.actualRateText, W - PAD - sp(12), startY + ROW_HEIGHT * 1.5 - fs(3));
    
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(9));
    context.fillText(`官方期望${reportStats.expectedRateText}`, W - PAD - sp(12), startY + ROW_HEIGHT * 1.5 + fs(3));
    context.setTextAlign("left");
    
    // 分隔线
    context.setStrokeStyle(BORDER);
    context.beginPath();
    context.moveTo(PAD + sp(12), startY + ROW_HEIGHT * 2);
    context.lineTo(W - PAD - sp(12), startY + ROW_HEIGHT * 2);
    context.stroke();

    // 第3行：波谷回撤警戒监控
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(10));
    context.fillText("波谷回撤警戒监控", PAD + sp(12), startY + ROW_HEIGHT * 2.5);
    
    const drawdownAlert = maxDrawdownPercent >= drawDownLimitPercent;
    context.setFillStyle(drawdownAlert ? RED : T_MAIN);
    context.setFontSize(fs(14));
    context.setTextAlign("right");
    context.fillText(`${maxDrawdownPercent.toFixed(1)}%`, W - PAD - sp(12), startY + ROW_HEIGHT * 2.5 - fs(3));
    
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(9));
    context.fillText(`阈值 ${drawDownLimitPercent}%`, W - PAD - sp(12), startY + ROW_HEIGHT * 2.5 + fs(3));
    context.setTextAlign("left");
    
    // 分隔线
    context.setStrokeStyle(BORDER);
    context.beginPath();
    context.moveTo(PAD + sp(12), startY + ROW_HEIGHT * 3);
    context.lineTo(W - PAD - sp(12), startY + ROW_HEIGHT * 3);
    context.stroke();

    // 第4行：极端峰值连转（交替背景色）
    context.setFillStyle(isDark ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)");
    context.fillRect(PAD, startY + ROW_HEIGHT * 3, W - PAD * 2, ROW_HEIGHT);
    
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(10));
    context.fillText("极端峰值连转", PAD + sp(12), startY + ROW_HEIGHT * 3.5);
    
    context.setFillStyle(T_MAIN);
    context.setFontSize(fs(12));
    context.setTextAlign("right");
    const streakText = `最高连红${reportStats.maxWinStreak}发 | 最高连黑${reportStats.maxLossStreak}发`;
    const streakWidth = context.measureText(streakText).width;
    if (streakWidth < (W - PAD * 2 - sp(24))) {
      context.fillText(streakText, W - PAD - sp(12), startY + ROW_HEIGHT * 3.5);
    } else {
      // 如果文字太长，分两行显示
      context.fillText(`最高连红${reportStats.maxWinStreak}发`, W - PAD - sp(12), startY + ROW_HEIGHT * 3.5 - fs(3));
      context.fillText(`最高连黑${reportStats.maxLossStreak}发`, W - PAD - sp(12), startY + ROW_HEIGHT * 3.5 + fs(3));
    }
    context.setTextAlign("left");
    
    // 分隔线
    context.setStrokeStyle(BORDER);
    context.beginPath();
    context.moveTo(PAD + sp(12), startY + ROW_HEIGHT * 4);
    context.lineTo(W - PAD - sp(12), startY + ROW_HEIGHT * 4);
    context.stroke();

    // 第5行：理智系统鉴定意见
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(10));
    context.fillText(`鉴定意见(${reportStats.luckMeter}):`, PAD + sp(12), startY + ROW_HEIGHT * 4.5 - fs(6));
    
    context.setFillStyle(T_MAIN);
    context.setFontSize(fs(10));
    const advice = sanityMetrics.advice || "";
    const maxWidth = W - PAD * 2 - sp(24);
    
    // 简单的文字换行
    let currentLine = "";
    let currentY = startY + ROW_HEIGHT * 4.5;
    const lineHeight = fs(12);
    
    for (let i = 0; i < advice.length; i++) {
      const char = advice[i];
      const testLine = currentLine + char;
      const testWidth = context.measureText(testLine).width;
      
      if (testWidth > maxWidth && currentLine.length > 0) {
        context.fillText(currentLine, PAD + sp(12), currentY);
        currentLine = char;
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
      
      if (i === advice.length - 1 && currentLine) {
        context.fillText(currentLine, PAD + sp(12), currentY);
      }
    }

    // 水印
    context.setFillStyle(T_SUB);
    context.setFontSize(fs(8));
    context.fillText("NBA2KOL2 合卡理智卫士 · 小程序版", PAD, totalHeight - sp(5));

    context.draw(false, () => {
      wx.canvasToTempFilePath(
        {
          canvasId: "guardianReportCanvas",
          destWidth: W * 2,
          destHeight: totalHeight * 2,
          success: (result) => {
            wx.previewImage({ urls: [result.tempFilePath], current: result.tempFilePath });
            this.setReportGenerated();
          },
          fail: () => {
            wx.showToast({ title: "报告生成失败，请重试", icon: "none" });
          }
        },
        this
      );
    });
  },
  handleGenerateReport() {
    (0, import_guardian_runtime.playTapFeedback)(this._persistentState.soundEnabled, "medium");
    const screenW = this.data.windowWidth || 375;
    const S = screenW / 375;
    // 现在只绘制5行报告内容，高度固定
    const ROW_HEIGHT = 48;
    const PADDING_TOP = 20;
    const PADDING_BOTTOM = 20;
    const cssHeight = Math.round((PADDING_TOP + (ROW_HEIGHT * 5) + PADDING_BOTTOM) * S);
    this.setData({ reportCanvasHeight: cssHeight }, () => {
      setTimeout(() => this.drawReportCanvas(), 120);
    });
  },
  
  // 关闭二维码弹窗
  handleCloseQrCodeModal() {
    this.setData({ showQrCodeModal: false });
    // 记住本设备已确认「当前版本」的群通知，之后不再自动弹出
    wx.setStorageSync(QR_CODE_NOTICE_VERSION_KEY, QR_CODE_NOTICE_VERSION);
  },
  
  // 重新打开二维码弹窗（供未来在设置中使用）
  handleOpenQrCodeModal() {
    this.setData({ showQrCodeModal: true });
  }
});
