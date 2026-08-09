"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var guardian_runtime_exports = {};
__export(guardian_runtime_exports, {
  buildDashboardView: () => buildDashboardView,
  buildThemeIcons: () => buildThemeIcons,
  createDefaultUiState: () => createDefaultUiState,
  createRecord: () => createRecord,
  findRuleById: () => findRuleById,
  formatTime: () => formatTime,
  getBreathingVisual: () => getBreathingVisual,
  getRandomBreathingCardIndex: () => getRandomBreathingCardIndex,
  getTrendCanvasPoints: () => getTrendCanvasPoints,
  loadGuardianPersistentState: () => loadGuardianPersistentState,
  normalizeRecords: () => normalizeRecords,
  persistGuardianPersistentState: () => persistGuardianPersistentState,
  playTapFeedback: () => playTapFeedback,
  playSuccessFeedback: () => playSuccessFeedback,
  playFailFeedback: () => playFailFeedback
});
module.exports = __toCommonJS(guardian_runtime_exports);
var import_guardian_data = require("./guardian-data");
var import_guardian_icons = require("./guardian-icons");
const BASE_ICON_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "CURRENT_COLOR",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function safeParseRecords(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => item && typeof item === "object").map((item) => item);
}
function loadGuardianPersistentState() {
  const initialCards = clamp(Number(wx.getStorageSync(import_guardian_data.STORAGE_KEYS.initialCards)) || import_guardian_data.DEFAULT_INITIAL_CARDS, 1, 999999);
  const records = safeParseRecords(wx.getStorageSync(import_guardian_data.STORAGE_KEYS.records));
  const soundEnabledStorage = wx.getStorageSync(import_guardian_data.STORAGE_KEYS.soundEnabled);
  const selectedRuleIdStorage = String(wx.getStorageSync(import_guardian_data.STORAGE_KEYS.selectedRuleId) || import_guardian_data.DEFAULT_SELECTED_RULE_ID);
  const drawDownLimitPercent = clamp(Number(wx.getStorageSync(import_guardian_data.STORAGE_KEYS.drawDownLimitPercent)) || import_guardian_data.DEFAULT_DRAWDOWN_LIMIT, 10, 80);
  const themeStorage = wx.getStorageSync(import_guardian_data.STORAGE_KEYS.theme);
  const forceCalmAlertShownStorage = wx.getStorageSync(import_guardian_data.STORAGE_KEYS.forceCalmAlertShown);
  const selectedRule = import_guardian_data.UPGRADE_RULES.find((item) => item.id === selectedRuleIdStorage) || import_guardian_data.UPGRADE_RULES[0];
  return {
    initialCards,
    records,
    soundEnabled: soundEnabledStorage === "" ? import_guardian_data.DEFAULT_SOUND_ENABLED : String(soundEnabledStorage) !== "false",
    selectedRuleId: selectedRule.id,
    drawDownLimitPercent,
    theme: themeStorage === "dark" ? "dark" : import_guardian_data.DEFAULT_THEME,
    forceCalmAlertShown: String(forceCalmAlertShownStorage) === "true"
  };
}
function persistGuardianPersistentState(state) {
  wx.setStorageSync(import_guardian_data.STORAGE_KEYS.initialCards, state.initialCards);
  wx.setStorageSync(import_guardian_data.STORAGE_KEYS.records, state.records);
  wx.setStorageSync(import_guardian_data.STORAGE_KEYS.soundEnabled, state.soundEnabled);
  wx.setStorageSync(import_guardian_data.STORAGE_KEYS.selectedRuleId, state.selectedRuleId);
  wx.setStorageSync(import_guardian_data.STORAGE_KEYS.drawDownLimitPercent, state.drawDownLimitPercent);
  wx.setStorageSync(import_guardian_data.STORAGE_KEYS.theme, state.theme);
  wx.setStorageSync(import_guardian_data.STORAGE_KEYS.forceCalmAlertShown, state.forceCalmAlertShown);
}
function createDefaultUiState(selectedRuleId) {
  const selectedRule = import_guardian_data.UPGRADE_RULES.find((item) => item.id === selectedRuleId) || import_guardian_data.UPGRADE_RULES[0];
  return {
    currentTab: "console",
    activeStarTab: selectedRule.targetStar,
    showReportBadge: false,
    showStrategyHelp: false,
    isExclusivePanelExpanded: true,
    isBreathingModalOpen: false,
    breathingCountdown: 3,
    breathingTimer: 0,
    breathingPhase: "inhale",
    breathingCardIndex: 0
  };
}
function findRuleById(ruleId) {
  return import_guardian_data.UPGRADE_RULES.find((item) => item.id === ruleId) || import_guardian_data.UPGRADE_RULES[0];
}
function createRecord(rule, success, sanityScoreBefore) {
  const title = `${rule.targetStar} \u7A81\u5F3A\u5316 \xB7 ${success ? "\u5347\u661F\u6210\u529F!" : "\u5F3A\u5316\u5931\u8D25... \u7206"}`;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
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
    title
  };
}
function compactFormulaName(formulaName) {
  return String(formulaName || "").replace(/\s+/g, "").replace(/\uFF08/g, "(").replace(/\uFF09/g, ")");
}
function formatRuleDisplayText(targetStar, formulaName) {
  return `${targetStar}\u7A81+${compactFormulaName(formulaName)}`;
}
function getMathExpectation(rule) {
  return rule.successRate / 100 * rule.successGain - (1 - rule.successRate / 100) * rule.failLoss;
}
function getCurrentCards(initialCards, records) {
  const change = records.reduce((sum, item) => sum + item.netChange, 0);
  return Math.max(0, initialCards + change);
}
function getDrawdownStats(initialCards, records) {
  let peak = initialCards;
  let current = initialCards;
  let maxDrawdown = 0;
  records.forEach((item) => {
    current += item.netChange;
    if (current > peak) {
      peak = current;
    }
    const drawdown = peak - current;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  return {
    peak,
    maxDrawdown,
    maxDrawdownPercent: peak > 0 ? maxDrawdown / peak * 100 : 0
  };
}
function getSanityMetrics(initialCards, records, drawDownLimitPercent) {
  const drawdownStats = getDrawdownStats(initialCards, records);
  let score = 100;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let tempLossStreak = 0;
  let tempWinStreak = 0;
  records.forEach((item) => {
    if (!item.success) {
      tempLossStreak += 1;
      tempWinStreak = 0;
    } else {
      tempWinStreak += 1;
      tempLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, tempWinStreak);
    }
  });
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (!records[index].success) {
      currentLossStreak += 1;
    } else {
      break;
    }
  }
  if (currentLossStreak === 1) {
    score -= 8;
  } else if (currentLossStreak === 2) {
    score -= 22;
  } else if (currentLossStreak === 3) {
    score -= 45;
  } else if (currentLossStreak >= 4) {
    score -= 70;
  }
  if (drawdownStats.maxDrawdownPercent > 0) {
    if (drawdownStats.maxDrawdownPercent < 20) {
      score -= drawdownStats.maxDrawdownPercent * 0.7;
    } else if (drawdownStats.maxDrawdownPercent < 40) {
      score -= drawdownStats.maxDrawdownPercent * 1.1;
    } else {
      score -= drawdownStats.maxDrawdownPercent * 1.6;
    }
  }
  const desperateAttempts = records.slice(-4).filter((item) => item.successRate <= 15 && !item.success).length;
  score -= desperateAttempts * 12;
  score = clamp(Math.round(score), 0, 100);
  let status = "excellent";
  let advice = "\u5FC3\u5883\u6F84\u660E\uFF0C\u7406\u667A\u503C\u767E\u5206\u767E\u3002\u8FD9\u662F\u6700\u5B8C\u7F8E\u7684\u5F3A\u5316\u65F6\u95F4\u7A97\uFF01";
  let colorClass = "emerald";
  if (score >= 80) {
    status = "excellent";
    advice = "\u60A8\u5F53\u524D\u547C\u5438\u89C4\u5F8B\uFF0C\u64CD\u4F5C\u5E73\u7A33\u3002\u5927\u8111\u989D\u53F6\u5B8C\u5168\u4E3B\u5BFC\uFF0C\u53EF\u4E25\u683C\u6309\u65E2\u5B9A\u89C4\u5212\u65B9\u6848\u5408\u5361\u3002";
    colorClass = "emerald";
  } else if (score >= 50) {
    status = "normal";
    advice = "\u5FC3\u7387\u6B63\u5E38\uFF0C\u7406\u667A\u5F97\u5206\u8FC7\u786C\u3002\u6B64\u65F6\u8FDB\u884C\u666E\u901A\u4F4E\u661F\u5F3A\u5316\u6216\u5907\u7528\u6599\u79EF\u7D2F\u5B8C\u5168\u53EF\u4EE5\uFF0C\u7EE7\u7EED\u4FDD\u6301\uFF01";
    colorClass = "sky";
  } else if (score >= 20) {
    status = "warn";
    advice = "\u3010\u9632\u7206\u8B66\u62A5\u3011\uFF1A\u5FC3\u5883\u5F00\u59CB\u6025\u8E81\u3002\u60A8\u6B63\u5904\u4E8E\u6E29\u548C\u4E0A\u5934\u8FB9\u7F18\uFF01\u5EFA\u8BAE\u5C06\u5347\u661F\u6D88\u8017\u8C03\u6574\u4E3A\u9AD8\u80DC\u6BD4\u8F85\u6599\u5957\u8DEF\uFF0C\u7981\u6B62\u4EFB\u4F55\u6781\u4F4E\u80DC\u51E0\u7387\u7684\u76F2\u5F3A\u5316\u3002";
    colorClass = "amber";
  } else {
    status = "danger";
    advice = "\u3010\u5F3A\u5236\u7184\u706B\u3011\uFF1A\u5FC3\u8DF3\u7206\u8868\uFF0C\u5DF2\u7ECF\u8F93\u6025\u773C\uFF01\u8FDB\u5165\u8BA4\u77E5\u4E0D\u8FDE\u8D2F\u5F3A\u8D4C\u535A\u6A21\u5F0F\u3002\u7CFB\u7EDF\u7406\u667A\u88C5\u7F6E\u5DF2\u81EA\u52A8\u95ED\u9501\uFF0C\u8BF7\u7ACB\u523B\u6DF1\u547C\u5438\u653E\u677E\u81EA\u6551\u3002";
    colorClass = "rose";
  }
  if (drawdownStats.maxDrawdownPercent >= drawDownLimitPercent) {
    status = "breached";
    advice = `\u3010\u7269\u7406\u9632\u5FA1\u5F7B\u5E95\u51FB\u7A7F\u3011\uFF1A\u60A8\u8BBE\u5B9A\u7684\u6700\u5927\u8D44\u4EA7\u4FDD\u62A4\u7EBF\uFF08\u51CF\u8017 ${drawDownLimitPercent}%\uFF09\u5DF2\u88AB\u8DCC\u7834\uFF01\u8FD9\u5C5E\u4E8E\u6700\u9AD8\u8B66\u6212\u7EA7\u522B\u3002\u6839\u636E\u9632\u6C89\u6EBA\u7EAA\u5F8B\uFF0C\u5E94\u7ACB\u5373\u4E0B\u7EBF\u4F11\u606F\uFF0C\u660E\u65E5\u518D\u6218\u3002`;
    colorClass = "red";
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
    maxDrawdownPercent: drawdownStats.maxDrawdownPercent
  };
}
function getExclusiveSummary(records, rate) {
  const matched = records.filter((item) => item.successRate === rate);
  const total = matched.length;
  const wins = matched.filter((item) => item.success).length;
  const netCards = matched.reduce((sum, item) => sum + item.netChange, 0);
  const actualRate = total > 0 ? wins / total * 100 : 0;
  return {
    total,
    wins,
    losses: total - wins,
    actualRateText: total > 0 ? `${actualRate.toFixed(1)}%` : "--",
    netCards,
    netCardsText: `${netCards > 0 ? "+" : ""}${netCards}`
  };
}
function getReportStats(records) {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      wins: 0,
      losses: 0,
      actualRate: 0,
      actualRateText: "0.0%",
      expectedRateAvg: 0,
      expectedRateText: "0.0%",
      rateGapText: "0.0%",
      luckMeter: "\u6982\u7387\u5B88\u6052",
      luckFeedback: "\u6982\u7387\u5B8C\u5168\u5B88\u6052\u4E2D\uFF0C\u5F53\u524D\u672A\u6709\u4EFB\u4F55\u6781\u7AEF\u597D\u574F\u8FD0\u504F\u79BB\u3002",
      netCumulative: 0,
      netCumulativeText: "0",
      maxWinStreak: 0,
      maxLossStreak: 0,
      currentStreakType: "none",
      currentStreakCount: 0,
      currentStreakText: "\u65E0\u6392\u961F"
    };
  }
  const wins = records.filter((item) => item.success).length;
  const losses = total - wins;
  const actualRate = wins / total * 100;
  const expectedRateAvg = records.reduce((sum, item) => sum + item.successRate, 0) / total;
  const gap = actualRate - expectedRateAvg;
  let luckMeter = "\u6982\u7387\u5B88\u6052";
  let luckFeedback = "\u5F53\u524D\u5B9E\u9645\u6210\u529F\u7387\u4E0E\u5B98\u65B9\u9884\u4F30\u5927\u4F53\u7B26\u5408\u3002\u5C5E\u4E8E\u6B63\u5E38\u6CE2\u52A8\u3002";
  if (gap >= 15) {
    luckMeter = "\u4E94\u661F\u9526\u9CA4\u9644\u8EAB";
    luckFeedback = "\u5929\u547D\u7737\u987E\uFF01\u60A8\u7684\u5B9E\u6D4B\u7387\u9AD8\u51FA\u4E86\u6807\u79F0\u6982\u7387\uFF0C\u6B27\u6C14\u5168\u5F00\u3002\u5EFA\u8BAE\u89C1\u597D\u5C31\u6536\uFF0C\u907F\u514D\u56DE\u5410\u3002";
  } else if (gap > 5) {
    luckMeter = "\u559C\u6C14\u76C8\u76C8";
    luckFeedback = "\u6C14\u8FD0\u4E2D\u4E0A\uFF0C\u76EE\u524D\u80DC\u6BD4\u9AD8\u4E8E\u6570\u5B66\u5747\u503C\u3002\u8111\u6CE2\u5B8C\u5168\u5904\u4E8E\u4E0A\u5CF0\u3002";
  } else if (gap <= -15) {
    luckMeter = "\u975E\u914B\u672C\u914B";
    luckFeedback = "\u57AB\u5B50\u5728\u72C2\u53EB\uFF01\u6781\u9AD8\u9891\u6B21\u7684\u7206\u5361\u5DF2\u6784\u6210\u4E8B\u5B9E\u8FDE\u8D25\uFF0C\u4E0D\u8981\u786C\u6297\u6982\u7387\uFF0C\u9A6C\u4E0A\u4F11\u606F\uFF01";
  } else if (gap < -5) {
    luckMeter = "\u9634\u4E91\u5BC6\u5E03";
    luckFeedback = "\u8FD0\u52BF\u7565\u9ED1\u3002\u5B98\u65B9\u6982\u7387\u672A\u66FE\u5151\u73B0\uFF0C\u7126\u8E81\u5BB9\u6613\u5E26\u6765\u62A5\u590D\u6027\u8FDE\u7206\u3002";
  }
  const netCumulative = records.reduce((sum, item) => sum + item.netChange, 0);
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let tempWin = 0;
  let tempLoss = 0;
  records.forEach((item) => {
    if (item.success) {
      tempWin += 1;
      tempLoss = 0;
      maxWinStreak = Math.max(maxWinStreak, tempWin);
    } else {
      tempLoss += 1;
      tempWin = 0;
      maxLossStreak = Math.max(maxLossStreak, tempLoss);
    }
  });
  let currentStreakType = "none";
  let currentStreakCount = 0;
  if (records.length > 0) {
    const lastIsWin = records[records.length - 1].success;
    currentStreakType = lastIsWin ? "win" : "loss";
    for (let index = records.length - 1; index >= 0; index -= 1) {
      if (records[index].success === lastIsWin) {
        currentStreakCount += 1;
      } else {
        break;
      }
    }
  }
  const currentStreakText = currentStreakType === "win" ? `\u8FDE\u7EA2\u4E2D +${currentStreakCount}` : currentStreakType === "loss" ? `\u8FDE\u9ED1\u4E2D -${currentStreakCount}` : "\u65E0\u6392\u961F";
  const rateGap = actualRate - expectedRateAvg;
  return {
    total,
    wins,
    losses,
    actualRate,
    actualRateText: `${actualRate.toFixed(1)}%`,
    expectedRateAvg,
    expectedRateText: `${expectedRateAvg.toFixed(1)}%`,
    rateGapText: `${rateGap > 0 ? "+" : ""}${rateGap.toFixed(1)}%`,
    luckMeter,
    luckFeedback,
    netCumulative,
    netCumulativeText: `${netCumulative > 0 ? "+" : ""}${netCumulative}`,
    maxWinStreak,
    maxLossStreak,
    currentStreakType,
    currentStreakCount,
    currentStreakText
  };
}
function normalizeRecords(records, initialCards, drawDownLimitPercent) {
  const normalized = [];
  records.forEach((item) => {
    const sanityScoreBefore = getSanityMetrics(initialCards, normalized, drawDownLimitPercent).score;
    const nextRecord = {
      ...item,
      sanityScoreBefore,
      sanityScoreAfter: sanityScoreBefore,
      occurrenceGlobalIndex: normalized.length + 1
    };
    const previewRecords = [...normalized, nextRecord];
    nextRecord.sanityScoreAfter = getSanityMetrics(initialCards, previewRecords, drawDownLimitPercent).score;
    normalized.push(nextRecord);
  });
  return normalized;
}
function buildRecordList(records) {
  return records.slice().reverse().map((item) => ({
    ...item,
    timeLabel: formatTime(item.timestamp, true),
    statusText: item.success ? "\u6210\u529F" : "\u5931\u8D25",
    netChangeText: `${item.netChange > 0 ? "+" : ""}${item.netChange}`,
    sanityText: `${item.sanityScoreAfter}%`,
    ruleDisplayText: formatRuleDisplayText(item.targetStar, item.formulaName)
  }));
}
function buildExclusiveRecordList(records, rate) {
  const matched = records.filter((item) => item.successRate === rate).map((item) => ({
    ...item,
    occurrenceIndex: item.occurrenceGlobalIndex,
    occurrenceText: `\u7B2C${item.occurrenceGlobalIndex}\u6B21`
  }));
  return buildRecordList(matched);
}
function buildGridSlots(records) {
  const reversed = records.slice().reverse();
  if (!reversed.length) {
    return [{
      id: "placeholder_empty",
      isFilled: false,
      success: false,
      symbol: "\u2022",
      targetStarLabel: "",
      detailTitle: "",
      detailText: ""
    }];
  }
  return reversed.map((item) => ({
    id: item.id,
    isFilled: true,
    success: item.success,
    symbol: item.success ? "\u2713" : "\u2717",
    targetStarLabel: `${item.targetStar}`,
    detailTitle: `${item.success ? "\u6210\u529F" : "\u5931\u8D25"} \xB7 ${formatRuleDisplayText(item.targetStar, item.formulaName)}`,
    detailText: `${formatTime(item.timestamp, true)} \xB7 \u5B98\u65B9\u51E0\u7387 ${item.successRate}% \xB7 ${item.netChange > 0 ? `\u8D5A +${item.netChange}` : `\u4E8F ${item.netChange}`} \u5F20`
  }));
}
function buildWealthTrend(initialCards, records) {
  const trend = [initialCards];
  let current = initialCards;
  records.forEach((item) => {
    current += item.netChange;
    trend.push(current);
  });
  return trend;
}
function getExpectationDescriptor(selectedRule, currentRules) {
  const scopedRules = currentRules.length ? currentRules : [selectedRule];
  const currentExpectation = getMathExpectation(selectedRule);
  const expectationValues = scopedRules.map((rule) => getMathExpectation(rule));
  const maxExpectation = Math.max(...expectationValues);
  const minExpectation = Math.min(...expectationValues);
  const range = maxExpectation - minExpectation;
  const deltaToBest = maxExpectation - currentExpectation;
  const deltaToWorst = currentExpectation - minExpectation;
  if (currentExpectation >= 0) {
    return {
      isExpPositive: true,
      expectationTone: "positive",
      expectationBadgeText: "\u671F\u671B\u4E3A\u6B63",
      expectationHintText: "\u957F\u671F\u770B\u6536\u76CA\u5360\u4F18\uFF0C\u53EF\u4EE5\u4F5C\u4E3A\u5F53\u524D\u4E3B\u63A8\u65B9\u6848\u3002",
      expectationValueText: `${currentExpectation > 0 ? "+" : ""}${currentExpectation.toFixed(2)} \u5F20`
    };
  }
  if (range < 0.08) {
    return {
      isExpPositive: false,
      expectationTone: "neutral",
      expectationBadgeText: "\u540C\u6863\u63A5\u8FD1",
      expectationHintText: "\u5F53\u524D\u661F\u7EA7\u5404\u914D\u65B9\u671F\u671B\u5DEE\u8DDD\u5F88\u5C0F\uFF0C\u66F4\u591A\u770B\u4F60\u7684\u8282\u594F\u63A7\u5236\u3002",
      expectationValueText: `${currentExpectation.toFixed(2)} \u5F20`
    };
  }
  if (deltaToBest <= 0.08) {
    return {
      isExpPositive: false,
      expectationTone: "positive",
      expectationBadgeText: "\u5F53\u524D\u6863\u6700\u4F18",
      expectationHintText: "\u867D\u7136\u4ECD\u662F\u8D1F\u671F\u671B\uFF0C\u4F46\u5DF2\u7ECF\u662F\u672C\u6863\u91CC\u635F\u8017\u6700\u4F4E\u7684\u914D\u65B9\u3002",
      expectationValueText: `${currentExpectation.toFixed(2)} \u5F20`
    };
  }
  if (deltaToWorst <= range * 0.35) {
    return {
      isExpPositive: false,
      expectationTone: "negative",
      expectationBadgeText: "\u9AD8\u98CE\u9669\u51B2\u523A",
      expectationHintText: "\u8FD9\u5957\u66F4\u5403\u8FD0\u6C14\uFF0C\u957F\u671F\u635F\u8017\u66F4\u9AD8\uFF0C\u5EFA\u8BAE\u8C28\u614E\u4E0A\u5934\u3002",
      expectationValueText: `${currentExpectation.toFixed(2)} \u5F20`
    };
  }
  return {
    isExpPositive: false,
    expectationTone: "neutral",
    expectationBadgeText: "\u5747\u8861\u65B9\u6848",
    expectationHintText: "\u671F\u671B\u5904\u4E8E\u4E2D\u95F4\u533A\u95F4\uFF0C\u9002\u5408\u8FB9\u6253\u8FB9\u89C2\u5BDF\u8D70\u52BF\u3002",
    expectationValueText: `${currentExpectation.toFixed(2)} \u5F20`
  };
}
function getCognitiveDiagnosis(reportStats, sanityMetrics, drawDownLimitPercent) {
  if (reportStats.total === 0) {
    return {
      biasName: "\u865A\u7A7A\u4EE5\u5F85",
      biasDes: "\u8D26\u7C3F\u5185\u6682\u672A\u5305\u542B\u8BB0\u8D26\uFF0C\u591A\u505A\u51E0\u6B21\u5408\u5361\u5373\u53EF\u4E3A\u4F60\u5256\u6790\u64CD\u76D8\u5FC3\u7406\u5B66\u9519\u89C9\u3002"
    };
  }
  if (sanityMetrics.status === "breached" || sanityMetrics.maxDrawdownPercent >= drawDownLimitPercent) {
    return {
      biasName: "\u9632\u7EBF\u51FB\u7A7F \xB7 \u6B63\u53D1\u751F\u66B4\u8D70\u8D4C\u5F92\u503E\u659C",
      biasDes: "\u60A8\u7684\u786C\u6027\u51C0\u8D44\u4EA7\u7F29\u6C34\u5DF2\u7ECF\u51FB\u7A7F\u4E2A\u4EBA\u7EA2\u7EBF\u3002\u8BA4\u77E5\u5FC3\u7406\u5B66\u663E\u793A\u5F53\u524D\u989D\u53F6\u524D\u76AE\u5C42\u5B8C\u5168\u5931\u53BB\u7406\u667A\u4E3B\u5BFC\u6743\uFF0C\u7EE7\u7EED\u5408\u5361\u5C06\u6781\u6613\u53D1\u751F\u5F7B\u5E95\u6E05\u4ED3\u5F0F\u7684\u66B4\u6012\u5F3A\u5316\u3002"
    };
  }
  if (reportStats.currentStreakType === "loss" && reportStats.currentStreakCount >= 3) {
    return {
      biasName: "\u57AB\u5B50\u81EA\u6B3A\u6B3A\u4EBA\u9519\u89C9",
      biasDes: "\u60A8\u5F53\u524D\u9677\u5165\u4E86\u7ECF\u5178\u7684\u57AB\u5B50\u8C2C\u8BEF\u3002\u524D\u9762\u7684\u5931\u8D25\u5E76\u4E0D\u4F1A\u63D0\u9AD8\u4E0B\u4E00\u6B21\u5F3A\u5316\u7684\u5BA2\u89C2\u6210\u529F\u7387\uFF0C\u8BF7\u7ACB\u5373\u62C9\u5F00\u8DDD\u79BB\uFF0C\u505C\u6B62\u60C5\u7EEA\u6027\u8FFD\u5355\u3002"
    };
  }
  if (reportStats.currentStreakType === "win" && reportStats.currentStreakCount >= 3) {
    return {
      biasName: "\u9AD8\u50B2\u5FC5\u8D25\u5E78\u5B58\u8005\u504F\u5DEE",
      biasDes: "\u8FDE\u7EED\u6210\u529F\u4F1A\u8BA9\u4EBA\u8BEF\u4EE5\u4E3A\u4ECA\u5929\u624B\u6C14\u65E0\u654C\u3002\u8BF7\u6CE8\u610F\u8FD9\u901A\u5E38\u53EA\u662F\u6B63\u5E38\u6CE2\u5CF0\uFF0C\u4E0D\u5E94\u6210\u4E3A\u653E\u5927\u4ED3\u4F4D\u7684\u7406\u7531\u3002"
    };
  }
  if (reportStats.total > 10 && reportStats.actualRate < reportStats.expectedRateAvg) {
    return {
      biasName: "\u8D8B\u5747\u503C\u56DE\u5F52\u6CD5\u5219",
      biasDes: "\u5B9E\u6D4B\u80DC\u7387\u4F4E\u4E8E\u5B98\u65B9\u6807\u79F0\uFF0C\u5C5E\u4E8E\u6982\u7387\u7684\u6B63\u5E38\u5DE6\u4FA7\u6CE2\u6298\u3002\u4FDD\u6301\u5E73\u548C\uFF0C\u4E0D\u8981\u901A\u8FC7\u4ED3\u4FC3\u8FFD\u52A0\u5927\u989D\u5E95\u5361\u53BB\u62FC\u6982\u7387\u3002"
    };
  }
  return {
    biasName: "\u6E29\u548C\u5E73\u7406\u667A\u72B6\u6001",
    biasDes: "\u64CD\u4F5C\u4E2D\u89C4\u4E2D\u77E9\uFF0C\u8D26\u7C3F\u76C8\u4E8F\u6CE2\u52A8\u5065\u5EB7\u3002\u8BF7\u5B88\u4F4F\u5F53\u524D\u9632\u5FA1\u7EBF\uFF0C\u7EE7\u7EED\u7406\u667A\u64CD\u76D8\u3002"
  };
}
function stringifyAttrs(attrs) {
  return Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(" ");
}
function buildSvgDataUri(iconName, color) {
  const nodes = import_guardian_icons.LUCIDE_ICON_MAP[iconName] || [];
  const children = nodes.map(([tagName, attrs]) => {
    const nextAttrs = {};
    Object.keys(attrs).forEach((key) => {
      if (key !== "key") {
        nextAttrs[key] = String(attrs[key]);
      }
    });
    return `<${tagName} ${stringifyAttrs(nextAttrs)}></${tagName}>`;
  }).join("");
  const svg = `<svg ${stringifyAttrs(BASE_ICON_ATTRS).replace("CURRENT_COLOR", color)}>${children}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function buildThemeIcons(theme) {
  const neutral = theme === "dark" ? "#d4d4d8" : "#111827";
  const muted = theme === "dark" ? "#71717a" : "#6b7280";
  return {
    activity: buildSvgDataUri("activity", "#10b981"),
    arrowRightLeft: buildSvgDataUri("arrow-right-left", muted),
    bookOpen: buildSvgDataUri("book-open", "#10b981"),
    brainCircuit: buildSvgDataUri("brain-circuit", "#f59e0b"),
    chevronDown: buildSvgDataUri("chevron-down", muted),
    chevronUp: buildSvgDataUri("chevron-up", muted),
    coins: buildSvgDataUri("coins", "#f59e0b"),
    compass: buildSvgDataUri("compass", "#10b981"),
    download: buildSvgDataUri("download", neutral),
    flame: buildSvgDataUri("flame", "#ef4444"),
    heart: buildSvgDataUri("heart", "#ef4444"),
    helpCircle: buildSvgDataUri("help-circle", "#10b981"),
    history: buildSvgDataUri("history", "#10b981"),
    moon: buildSvgDataUri("moon", "#4f46e5"),
    percent: buildSvgDataUri("percent", "#10b981"),
    refreshCw: buildSvgDataUri("refresh-cw", muted),
    scale: buildSvgDataUri("scale", "#10b981"),
    shieldAlert: buildSvgDataUri("shield-alert", "#f59e0b"),
    sparkles: buildSvgDataUri("sparkles", "#f59e0b"),
    sun: buildSvgDataUri("sun", "#f59e0b"),
    target: buildSvgDataUri("target", "#10b981"),
    trash2: buildSvgDataUri("trash-2", muted),
    trendingDown: buildSvgDataUri("trending-down", "#10b981"),
    volume2: buildSvgDataUri("volume-2", "#10b981"),
    volumeX: buildSvgDataUri("volume-x", muted),
    wind: buildSvgDataUri("wind", "#10b981")
  };
}
function getBreathingVisual(uiState) {
  let circleScale = 1;
  let breathingCueText = "\u6DF1\u5438\u4E00\u53E3\u6C14...";
  let breathingCueTone = "sky";
  if (uiState.breathingPhase === "inhale") {
    const ratio = uiState.breathingTimer / 40;
    circleScale = 1 + ratio * 0.4;
    breathingCueText = "\u7F13\u7F13\u5438\u6C14 \xB7 \u5361\u91CF\u53EA\u662F\u6570\u5B57";
    breathingCueTone = "emerald";
  } else if (uiState.breathingPhase === "hold") {
    circleScale = 1.4;
    breathingCueText = "\u5C4F\u606F\u5C4F\u6C14 \xB7 \u8BA9\u7406\u667A\u5F52\u4F4D";
    breathingCueTone = "amber";
  } else {
    const ratio = (uiState.breathingTimer - 60) / 40;
    circleScale = 1.4 - ratio * 0.4;
    breathingCueText = "\u6162\u6162\u547C\u6C14 \xB7 \u6C89\u6CA1\u6210\u672C\u5DF2\u662F\u8FC7\u53BB";
    breathingCueTone = "sky";
  }
  return {
    breathingCueText,
    breathingCueTone,
    breathingCircleScale: Number(circleScale.toFixed(3))
  };
}
function buildDashboardView(persistentState, uiState) {
  const selectedRule = findRuleById(persistentState.selectedRuleId);
  const currentRules = import_guardian_data.UPGRADE_RULES.filter((item) => item.targetStar === uiState.activeStarTab);
  const normalizedRecords = normalizeRecords(
    persistentState.records,
    persistentState.initialCards,
    persistentState.drawDownLimitPercent
  );
  const currentCards = getCurrentCards(persistentState.initialCards, normalizedRecords);
  const drawdownStats = getDrawdownStats(persistentState.initialCards, normalizedRecords);
  const sanityMetrics = getSanityMetrics(
    persistentState.initialCards,
    normalizedRecords,
    persistentState.drawDownLimitPercent
  );
  const reportStats = getReportStats(normalizedRecords);
  const mathExpectation = getMathExpectation(selectedRule);
  const expectationDescriptor = getExpectationDescriptor(selectedRule, currentRules);
  const breathingVisual = getBreathingVisual(uiState);
  const wealthTrend = buildWealthTrend(persistentState.initialCards, normalizedRecords);
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
    recordsCount: normalizedRecords.length,
    records24: buildExclusiveRecordList(normalizedRecords, 24),
    records48: buildExclusiveRecordList(normalizedRecords, 48),
    exclusive24: getExclusiveSummary(normalizedRecords, 24),
    exclusive48: getExclusiveSummary(normalizedRecords, 48),
    gridSlots: buildGridSlots(normalizedRecords),
    reportStats,
    recordList: buildRecordList(normalizedRecords),
    sanityMetrics,
    cognitiveDiagnosis: getCognitiveDiagnosis(reportStats, sanityMetrics, persistentState.drawDownLimitPercent),
    icons: buildThemeIcons(persistentState.theme),
    breathingCard: import_guardian_data.MIND_COGNITIVE_CARDS[uiState.breathingCardIndex] || import_guardian_data.MIND_COGNITIVE_CARDS[0],
    breathingCueText: breathingVisual.breathingCueText,
    breathingCircleScale: breathingVisual.breathingCircleScale,
    breathingCueTone: breathingVisual.breathingCueTone,
    wealthTrend,
    wealthMin: Math.min(...wealthTrend),
    wealthMax: Math.max(...wealthTrend),
    wealthIsUp: wealthTrend[wealthTrend.length - 1] >= wealthTrend[0]
  };
}
function formatTime(timestamp, withSeconds = false) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
}
function getRandomBreathingCardIndex() {
  return Math.floor(Math.random() * import_guardian_data.MIND_COGNITIVE_CARDS.length);
}
// ─── WAV 合成音效（复刻网页端 Web Audio API 效果）───────────────────────────
// 将 PCM 浮点样本数组编码为 16-bit WAV，返回 Base64 字符串
function _buildWavBase64(samples, sampleRate) {
  const numSamples = samples.length;
  const byteLength = 44 + numSamples * 2;
  // 使用数字数组模拟 ArrayBuffer，再转 Base64
  const buf = new Array(byteLength).fill(0);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) buf[offset + i] = str.charCodeAt(i);
  }
  function writeU32LE(offset, val) {
    buf[offset]     =  val        & 0xff;
    buf[offset + 1] = (val >>  8) & 0xff;
    buf[offset + 2] = (val >> 16) & 0xff;
    buf[offset + 3] = (val >> 24) & 0xff;
  }
  function writeU16LE(offset, val) {
    buf[offset]     =  val       & 0xff;
    buf[offset + 1] = (val >> 8) & 0xff;
  }

  writeStr(0,  'RIFF');
  writeU32LE(4,  byteLength - 8);
  writeStr(8,  'WAVE');
  writeStr(12, 'fmt ');
  writeU32LE(16, 16);           // chunk size
  writeU16LE(20, 1);            // PCM
  writeU16LE(22, 1);            // mono
  writeU32LE(24, sampleRate);
  writeU32LE(28, sampleRate * 2);
  writeU16LE(32, 2);            // block align
  writeU16LE(34, 16);           // bits per sample
  writeStr(36, 'data');
  writeU32LE(40, numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const pcm = s < 0 ? s * 0x8000 : s * 0x7fff;
    writeU16LE(44 + i * 2, pcm & 0xffff);
  }

  // 转 Base64
  let binary = '';
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  // wx 环境下用 wx.arrayBufferToBase64 更高效，但为兼容性用纯 JS
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  for (let i = 0; i < binary.length; i += 3) {
    const b0 = binary.charCodeAt(i);
    const b1 = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
    const b2 = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;
    base64 += chars[b0 >> 2];
    base64 += chars[((b0 & 3) << 4) | (b1 >> 4)];
    base64 += i + 1 < binary.length ? chars[((b1 & 0xf) << 2) | (b2 >> 6)] : '=';
    base64 += i + 2 < binary.length ? chars[b2 & 0x3f] : '=';
  }
  return base64;
}

// 生成单个正弦音调样本
function _sineEnvelope(freq, duration, vol, sampleRate, attack, release) {
  const n = Math.ceil(duration * sampleRate);
  const att = Math.ceil(attack * sampleRate);
  const rel = Math.ceil(release * sampleRate);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    let env = vol;
    if (i < att) env = vol * (i / att);
    else if (i >= n - rel) env = vol * ((n - i) / rel);
    samples[i] = Math.sin(2 * Math.PI * freq * i / sampleRate) * env;
  }
  return samples;
}

// 混合多段样本（带偏移）
function _mix(parts, totalSamples) {
  const out = new Array(totalSamples).fill(0);
  for (const { samples, offset } of parts) {
    for (let i = 0; i < samples.length; i++) {
      if (offset + i < totalSamples) out[offset + i] += samples[i];
    }
  }
  // normalize 防止裁切
  let peak = 0;
  for (const v of out) if (Math.abs(v) > peak) peak = Math.abs(v);
  if (peak > 0.9) for (let i = 0; i < out.length; i++) out[i] /= (peak / 0.9);
  return out;
}

// 将 Base64 WAV 写入临时文件并播放
function _playWavBase64(base64) {
  try {
    const fs = wx.getFileSystemManager();
    const tmpPath = `${wx.env.USER_DATA_PATH}/_sfx_${Date.now()}.wav`;
    fs.writeFileSync(tmpPath, base64, 'base64');
    const audio = wx.createInnerAudioContext();
    audio.src = tmpPath;
    audio.volume = 1;
    audio.play();
    // 播放完后清理临时文件
    audio.onEnded(() => {
      audio.destroy();
      try { fs.unlinkSync(tmpPath); } catch (_) {}
    });
    audio.onError(() => {
      audio.destroy();
      try { fs.unlinkSync(tmpPath); } catch (_) {}
    });
  } catch (e) {
    // 静默忽略
  }
}

const SR = 22050; // 采样率，降低以减小文件体积

function _buildLightTick() {
  // 轻触：450Hz 短促 beep，复刻网页端 tab 切换音
  const s = _sineEnvelope(450, 0.09, 0.06, SR, 0.005, 0.06);
  return _buildWavBase64(s, SR);
}

function _buildSuccessChime() {
  // 成功：四音上行音阶（C5→E5→G5→C6），复刻网页端成功音效
  const beeps = [
    { freq: 523.25, start: 0.00, dur: 0.12 },
    { freq: 659.25, start: 0.06, dur: 0.12 },
    { freq: 783.99, start: 0.12, dur: 0.16 },
    { freq: 1046.5, start: 0.18, dur: 0.25 },
  ];
  const total = Math.ceil((0.18 + 0.25) * SR);
  const parts = beeps.map(b => ({
    samples: _sineEnvelope(b.freq, b.dur, 0.07, SR, 0.005, b.dur * 0.6),
    offset: Math.floor(b.start * SR),
  }));
  return _buildWavBase64(_mix(parts, total), SR);
}

function _buildFailBuzz() {
  // 失败：sawtooth 下滑嗡嗡声，复刻网页端失败音效
  const dur = 0.35;
  const n = Math.ceil(dur * SR);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = 220 * Math.pow(120 / 220, t / dur); // 220→120 Hz 滑落
    const phase = t * (220 + 120) / 2; // 近似相位
    // sawtooth wave
    const saw = 2 * (phase - Math.floor(phase + 0.5));
    const env = 0.09 * Math.max(0, 1 - t / dur);
    samples[i] = saw * env;
  }
  return _buildWavBase64(samples, SR);
}

function _buildMediumBeep() {
  // 中等：500Hz beep，用于确认/冷静弹窗
  const s = _sineEnvelope(500, 0.12, 0.07, SR, 0.008, 0.08);
  return _buildWavBase64(s, SR);
}

// 缓存已生成的 wav base64，避免重复计算
let _cache = null;
function _getCache() {
  if (!_cache) {
    _cache = {
      light:   _buildLightTick(),
      success: _buildSuccessChime(),
      fail:    _buildFailBuzz(),
      medium:  _buildMediumBeep(),
    };
  }
  return _cache;
}

function playTapFeedback(enabled, type = "light") {
  if (!enabled) return;
  try {
    const cache = _getCache();
    if (type === 'heavy') {
      _playWavBase64(cache.fail);
    } else if (type === 'medium') {
      _playWavBase64(cache.medium);
    } else {
      _playWavBase64(cache.light);
    }
  } catch (e) {
    // 静默忽略
  }
}

// 专用：成功合卡音效（四音上行）
function playSuccessFeedback(enabled) {
  if (!enabled) return;
  try {
    _playWavBase64(_getCache().success);
  } catch (e) {}
}

// 专用：失败合卡音效（下滑嗡声）
function playFailFeedback(enabled) {
  if (!enabled) return;
  try {
    _playWavBase64(_getCache().fail);
  } catch (e) {}
}
function getTrendCanvasPoints(trend, width, height) {
  if (!trend.length) {
    return [];
  }
  const paddingY = 14;
  const minValue = Math.min(...trend);
  const maxValue = Math.max(...trend);
  const range = maxValue - minValue || 1;
  return trend.map((value, index) => {
    const x = trend.length === 1 ? width / 2 : index / (trend.length - 1) * width;
    const y = height - paddingY - (value - minValue) / range * (height - paddingY * 2);
    return { x, y };
  });
}
