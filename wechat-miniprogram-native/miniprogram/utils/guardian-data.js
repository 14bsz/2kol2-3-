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
var guardian_data_exports = {};
__export(guardian_data_exports, {
  DEFAULT_DRAWDOWN_LIMIT: () => DEFAULT_DRAWDOWN_LIMIT,
  DEFAULT_INITIAL_CARDS: () => DEFAULT_INITIAL_CARDS,
  DEFAULT_SELECTED_RULE_ID: () => DEFAULT_SELECTED_RULE_ID,
  DEFAULT_SOUND_ENABLED: () => DEFAULT_SOUND_ENABLED,
  DEFAULT_THEME: () => DEFAULT_THEME,
  MIND_COGNITIVE_CARDS: () => MIND_COGNITIVE_CARDS,
  STORAGE_KEYS: () => STORAGE_KEYS,
  UPGRADE_RULES: () => UPGRADE_RULES
});
module.exports = __toCommonJS(guardian_data_exports);
const STORAGE_KEYS = {
  initialCards: "nba2k_init_cards_v1",
  records: "nba2k_records_v1",
  soundEnabled: "nba2k_sound_v1",
  selectedRuleId: "nba2k_curr_rule_v1",
  drawDownLimitPercent: "nba2k_drawdown_limit_v1",
  theme: "nba2k_theme_v1",
  forceCalmAlertShown: "nba2k_force_calm_alert_shown_v1"
};
const DEFAULT_THEME = "light";
const DEFAULT_SELECTED_RULE_ID = "5_4";
const DEFAULT_INITIAL_CARDS = 40;
const DEFAULT_DRAWDOWN_LIMIT = 35;
const DEFAULT_SOUND_ENABLED = true;
const UPGRADE_RULES = [
  { id: "2_1", targetStar: 2, formulaName: "1 \u7A81\uFF081 \u5F20\uFF09", displayName: "1\u7A81 (\u672C\u4F53) + 1\u7A81 (\u8F85\u5361)", successRate: 48, targetBaseCards: 2, subCards: 1, failLoss: 1, successGain: 1 },
  { id: "3_1", targetStar: 3, formulaName: "1 \u7A81\uFF081 \u5F20\uFF09", displayName: "2\u7A81 (\u672C\u4F53) + 1\u7A81", successRate: 24, targetBaseCards: 4, subCards: 1, failLoss: 1, successGain: 3 },
  { id: "3_2", targetStar: 3, formulaName: "2 \u7A81\uFF082 \u5F20\uFF09", displayName: "2\u7A81 (\u672C\u4F53) + 2\u7A81", successRate: 48, targetBaseCards: 4, subCards: 2, failLoss: 2, successGain: 2 },
  { id: "3_2_2s", targetStar: 3, formulaName: "2 \u7A81 2 \u661F\uFF083 \u5F20\uFF09", displayName: "2\u7A81 (\u672C\u4F53) + 2\u7A812\u661F", successRate: 72, targetBaseCards: 4, subCards: 3, failLoss: 3, successGain: 1 },
  { id: "4_1", targetStar: 4, formulaName: "1 \u7A81\uFF081 \u5F20\uFF09", displayName: "3\u7A81 (\u672C\u4F53) + 1\u7A81", successRate: 12, targetBaseCards: 8, subCards: 1, failLoss: 1, successGain: 7 },
  { id: "4_2", targetStar: 4, formulaName: "2 \u7A81\uFF082 \u5F20\uFF09", displayName: "3\u7A81 (\u672C\u4F53) + 2\u7A81", successRate: 24, targetBaseCards: 8, subCards: 2, failLoss: 2, successGain: 6 },
  { id: "4_2_2s", targetStar: 4, formulaName: "2 \u7A81 2 \u661F\uFF083 \u5F20\uFF09", displayName: "3\u7A81 (\u672C\u4F53) + 2\u7A812\u661F", successRate: 36, targetBaseCards: 8, subCards: 3, failLoss: 3, successGain: 5 },
  { id: "4_3", targetStar: 4, formulaName: "3 \u7A81\uFF084 \u5F20\uFF09", displayName: "3\u7A81 (\u672C\u4F53) + 3\u7A81", successRate: 48, targetBaseCards: 8, subCards: 4, failLoss: 4, successGain: 4 },
  { id: "4_3_1s", targetStar: 4, formulaName: "3 \u7A81 1 \u661F\uFF085 \u5F20\uFF09", displayName: "3\u7A81 (\u672C\u4F53) + 3\u7A811\u661F", successRate: 60, targetBaseCards: 8, subCards: 5, failLoss: 5, successGain: 3 },
  { id: "4_3_2s", targetStar: 4, formulaName: "3 \u7A81 2 \u661F\uFF086 \u5F20\uFF09", displayName: "3\u7A81 (\u672C\u4F53) + 3\u7A812\u661F", successRate: 72, targetBaseCards: 8, subCards: 6, failLoss: 6, successGain: 2 },
  { id: "4_3_3s", targetStar: 4, formulaName: "3 \u7A81 3 \u661F\uFF087 \u5F20\uFF09", displayName: "3\u7A81 (\u672C\u4F53) + 3\u7A813\u661F", successRate: 84, targetBaseCards: 8, subCards: 7, failLoss: 7, successGain: 1 },
  { id: "5_1", targetStar: 5, formulaName: "1 \u7A81\uFF081 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 1\u7A81", successRate: 6, targetBaseCards: 16, subCards: 1, failLoss: 1, successGain: 15 },
  { id: "5_2", targetStar: 5, formulaName: "2 \u7A81\uFF082 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 2\u7A81", successRate: 12, targetBaseCards: 16, subCards: 2, failLoss: 2, successGain: 14 },
  { id: "5_2_2s", targetStar: 5, formulaName: "2 \u7A81 2 \u661F\uFF083 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 2\u7A812\u661F", successRate: 18, targetBaseCards: 16, subCards: 3, failLoss: 3, successGain: 13 },
  { id: "5_3", targetStar: 5, formulaName: "3 \u7A81\uFF084 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 3\u7A81", successRate: 24, targetBaseCards: 16, subCards: 4, failLoss: 4, successGain: 12 },
  { id: "5_3_1s", targetStar: 5, formulaName: "3 \u7A81 1 \u661F\uFF085 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 3\u7A811\u661F", successRate: 30, targetBaseCards: 16, subCards: 5, failLoss: 5, successGain: 11 },
  { id: "5_3_2s", targetStar: 5, formulaName: "3 \u7A81 2 \u661F\uFF086 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 3\u7A812\u661F", successRate: 36, targetBaseCards: 16, subCards: 6, failLoss: 6, successGain: 10 },
  { id: "5_3_3s", targetStar: 5, formulaName: "3 \u7A81 3 \u661F\uFF087 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 3\u7A813\u661F", successRate: 42, targetBaseCards: 16, subCards: 7, failLoss: 7, successGain: 9 },
  { id: "5_4", targetStar: 5, formulaName: "4 \u7A81\uFF088 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 4\u7A81", successRate: 48, targetBaseCards: 16, subCards: 8, failLoss: 8, successGain: 8 },
  { id: "5_4_p1", targetStar: 5, formulaName: "4 \u7A81\u5E26 1 \u5F20\uFF089 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 4\u7A81\u5E261\u5F20", successRate: 54, targetBaseCards: 16, subCards: 9, failLoss: 9, successGain: 7 },
  { id: "5_4_1s", targetStar: 5, formulaName: "4 \u7A81 1 \u661F\uFF0810 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 4\u7A811\u661F", successRate: 60, targetBaseCards: 16, subCards: 10, failLoss: 10, successGain: 6 },
  { id: "5_4_1s_p1", targetStar: 5, formulaName: "4 \u7A81 1 \u661F\u5E26 1 \u5F20\uFF0811 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 4\u7A811\u661F\u5E261\u5F20", successRate: 66, targetBaseCards: 16, subCards: 11, failLoss: 11, successGain: 5 },
  { id: "5_4_2s", targetStar: 5, formulaName: "4 \u7A81 2 \u661F\uFF0812 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 4\u7A812\u661F", successRate: 72, targetBaseCards: 16, subCards: 12, failLoss: 12, successGain: 4 },
  { id: "5_4_2s_p1", targetStar: 5, formulaName: "4 \u7A81 2 \u661F\u5E26 1 \u5F20\uFF0813 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 4\u7A812\u661F\u5E261\u5F20", successRate: 78, targetBaseCards: 16, subCards: 13, failLoss: 13, successGain: 3 },
  { id: "5_4_3s", targetStar: 5, formulaName: "4 \u7A81 3 \u661F\uFF0814 \u5F20\uFF09", displayName: "4\u7A81 (\u672C\u4F53) + 4\u7A813\u661F", successRate: 84, targetBaseCards: 16, subCards: 14, failLoss: 14, successGain: 2 },
  { id: "6_1", targetStar: 6, formulaName: "1 \u7A81\uFF081 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 1\u7A81", successRate: 3, targetBaseCards: 32, subCards: 1, failLoss: 1, successGain: 31 },
  { id: "6_2", targetStar: 6, formulaName: "2 \u7A81\uFF082 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 2\u7A81", successRate: 6, targetBaseCards: 32, subCards: 2, failLoss: 2, successGain: 30 },
  { id: "6_2_2s", targetStar: 6, formulaName: "2 \u7A81 2 \u661F\uFF083 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 2\u7A812\u661F", successRate: 9, targetBaseCards: 32, subCards: 3, failLoss: 3, successGain: 29 },
  { id: "6_3", targetStar: 6, formulaName: "3 \u7A81\uFF084 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 3\u7A81", successRate: 12, targetBaseCards: 32, subCards: 4, failLoss: 4, successGain: 28 },
  { id: "6_3_1s", targetStar: 6, formulaName: "3 \u7A81 1 \u661F\uFF085 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 3\u7A811\u661F", successRate: 15, targetBaseCards: 32, subCards: 5, failLoss: 5, successGain: 27 },
  { id: "6_3_2s", targetStar: 6, formulaName: "3 \u7A81 2 \u661F\uFF086 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 3\u7A812\u661F", successRate: 18, targetBaseCards: 32, subCards: 6, failLoss: 6, successGain: 26 },
  { id: "6_3_3s", targetStar: 6, formulaName: "3 \u7A81 3 \u661F\uFF087 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 3\u7A813\u661F", successRate: 21, targetBaseCards: 32, subCards: 7, failLoss: 7, successGain: 25 },
  { id: "6_4", targetStar: 6, formulaName: "4 \u7A81\uFF088 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A81", successRate: 24, targetBaseCards: 32, subCards: 8, failLoss: 8, successGain: 24 },
  { id: "6_4_p1", targetStar: 6, formulaName: "4 \u7A81\u5E26 1 \u5F20\uFF089 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A81\u5E261\u5F20", successRate: 27, targetBaseCards: 32, subCards: 9, failLoss: 9, successGain: 23 },
  { id: "6_4_1s", targetStar: 6, formulaName: "4 \u7A81 1 \u661F\uFF0810 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A811\u661F", successRate: 30, targetBaseCards: 32, subCards: 10, failLoss: 10, successGain: 22 },
  { id: "6_4_1s_p1", targetStar: 6, formulaName: "4 \u7A81 1 \u661F\u5E26 1 \u5F20\uFF0811 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A811\u661F\u5E261\u5F20", successRate: 33, targetBaseCards: 32, subCards: 11, failLoss: 11, successGain: 21 },
  { id: "6_4_2s", targetStar: 6, formulaName: "4 \u7A81 2 \u661F\uFF0812 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A812\u661F", successRate: 36, targetBaseCards: 32, subCards: 12, failLoss: 12, successGain: 20 },
  { id: "6_4_2s_p1", targetStar: 6, formulaName: "4 \u7A81 2 \u661F\u5E26 1 \u5F20\uFF0813 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A812\u661F\u5E261\u5F20", successRate: 39, targetBaseCards: 32, subCards: 13, failLoss: 13, successGain: 19 },
  { id: "6_4_3s", targetStar: 6, formulaName: "4 \u7A81 3 \u661F\uFF0814 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A813\u661F", successRate: 42, targetBaseCards: 32, subCards: 14, failLoss: 14, successGain: 18 },
  { id: "6_4_3s_p1", targetStar: 6, formulaName: "4 \u7A81 3 \u661F\u5E26 1 \u5F20\uFF0815 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 4\u7A813\u661F\u5E261\u5F20", successRate: 45, targetBaseCards: 32, subCards: 15, failLoss: 15, successGain: 17 },
  { id: "6_5", targetStar: 6, formulaName: "5 \u7A81\uFF0816 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A81", successRate: 48, targetBaseCards: 32, subCards: 16, failLoss: 16, successGain: 16 },
  { id: "6_5_p1", targetStar: 6, formulaName: "5 \u7A81\u5E26 1 \u5F20\uFF0817 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A81\u5E261\u5F20", successRate: 51, targetBaseCards: 32, subCards: 17, failLoss: 17, successGain: 15 },
  { id: "6_5_p2", targetStar: 6, formulaName: "5 \u7A81\u5E26 2 \u5F20\uFF0818 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A81\u5E262\u5F20", successRate: 54, targetBaseCards: 32, subCards: 18, failLoss: 18, successGain: 14 },
  { id: "6_5_p3", targetStar: 6, formulaName: "5 \u7A81\u5E26 3 \u5F20\uFF0819 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A81\u5E263\u5F20", successRate: 57, targetBaseCards: 32, subCards: 19, failLoss: 19, successGain: 13 },
  { id: "6_5_1s", targetStar: 6, formulaName: "5 \u7A81 1 \u661F\uFF0820 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A811\u661F", successRate: 60, targetBaseCards: 32, subCards: 20, failLoss: 20, successGain: 12 },
  { id: "6_5_1s_p1", targetStar: 6, formulaName: "5 \u7A81 1 \u661F\u5E26 1 \u5F20\uFF0821 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A811\u661F\u5E261\u5F20", successRate: 63, targetBaseCards: 32, subCards: 21, failLoss: 21, successGain: 11 },
  { id: "6_5_1s_p2", targetStar: 6, formulaName: "5 \u7A81 1 \u661F\u5E26 2 \u5F20\uFF0822 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A811\u661F\u5E262\u5F20", successRate: 66, targetBaseCards: 32, subCards: 22, failLoss: 22, successGain: 10 },
  { id: "6_5_1s_p3", targetStar: 6, formulaName: "5 \u7A81 1 \u661F\u5E26 3 \u5F20\uFF0823 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A811\u661F\u5E263\u5F20", successRate: 69, targetBaseCards: 32, subCards: 23, failLoss: 23, successGain: 9 },
  { id: "6_5_2s", targetStar: 6, formulaName: "5 \u7A81 2 \u661F\uFF0824 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A812\u661F", successRate: 72, targetBaseCards: 32, subCards: 24, failLoss: 24, successGain: 8 },
  { id: "6_5_2s_p1", targetStar: 6, formulaName: "5 \u7A81 2 \u661F\u5E26 1 \u5F20\uFF0825 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A812\u661F\u5E261\u5F20", successRate: 75, targetBaseCards: 32, subCards: 25, failLoss: 25, successGain: 7 },
  { id: "6_5_2s_p2", targetStar: 6, formulaName: "5 \u7A81 2 \u661F\u5E26 2 \u5F20\uFF0826 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A812\u661F\u5E262\u5F20", successRate: 78, targetBaseCards: 32, subCards: 26, failLoss: 26, successGain: 6 },
  { id: "6_5_2s_p3", targetStar: 6, formulaName: "5 \u7A81 2 \u661F\u5E26 3 \u5F20\uFF0827 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A812\u661F\u5E263\u5F20", successRate: 81, targetBaseCards: 32, subCards: 27, failLoss: 27, successGain: 5 },
  { id: "6_5_3s", targetStar: 6, formulaName: "5 \u7A81 3 \u661F\uFF0828 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A813\u661F", successRate: 84, targetBaseCards: 32, subCards: 28, failLoss: 28, successGain: 4 },
  { id: "6_5_3s_p1", targetStar: 6, formulaName: "5 \u7A81 3 \u661F\u5E26 1 \u5F20\uFF0829 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A813\u661F\u5E261\u5F20", successRate: 87, targetBaseCards: 32, subCards: 29, failLoss: 29, successGain: 3 },
  { id: "6_5_3s_p2", targetStar: 6, formulaName: "5 \u7A81 3 \u661F\u5E26 2 \u5F20\uFF0830 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A813\u661F\u5E262\u5F20", successRate: 90, targetBaseCards: 32, subCards: 30, failLoss: 30, successGain: 2 },
  { id: "6_5_3s_p3", targetStar: 6, formulaName: "5 \u7A81 3 \u661F\u5E26 3 \u5F20\uFF0831 \u5F20\uFF09", displayName: "5\u7A81 (\u672C\u4F53) + 5\u7A813\u661F\u5E263\u5F20", successRate: 93, targetBaseCards: 32, subCards: 31, failLoss: 31, successGain: 1 }
];
const MIND_COGNITIVE_CARDS = [
  {
    title: "\u300C\u57AB\u5B50/\u94FA\u57AB\u8FC7\u8F7D\u300D\u8BA4\u77E5\u5E7B\u89C9",
    content: "\u73A9\u5BB6\u6DF1\u4FE1\uFF1A\u300C\u6211\u524D\u9762\u8FDE\u7EED\u7206\u6389\u4E865\u6B21\uFF0C\u6309\u7167\u6982\u7387\uFF0C\u6211\u7684\u4E0B\u4E00\u5927\u5361\u8FD9\u6B21\u80AF\u5B9A\u80FD\u6210\uFF01\u300D\n\n\u3010\u79D1\u5B66\u89E3\u5256\u3011\uFF1A\u6BCF\u4E00\u6B21\u72EC\u7ACB\u7684\u5F3A\u5316\u5408\u5361\u5728\u670D\u52A1\u5668\u7AEF\u90FD\u5C5E\u4E8E\u79BB\u6563\u968F\u673A\u4E8B\u4EF6\uFF0C\u524D\u9762\u7684\u5931\u8D25\u65E0\u6CD5\u63D0\u9AD8\u4E0B\u4E00\u5C40\u7684\u5BA2\u89C2\u4E2D\u5956\u51E0\u7387\u3002\u57AB\u5B50\u884C\u4E3A\u7EAF\u5C5E\u5FC3\u91CC\u5BFB\u6C42\u5B89\u6170\u4E0E\u6C89\u6CA1\u6210\u672C\u81EA\u6211\u50AC\u7720\u3002"
  },
  {
    title: "\u300C\u5C31\u5DEE\u4E00\u6B21\u5C31\u56DE\u672C\u300D\u68AD\u54C8\u9677\u9631",
    content: "\u73A9\u5BB6\u6DF1\u4FE1\uFF1A\u300C\u4ECA\u5929\u5DF2\u7ECF\u4E8F\u635F\u5927\u534A\u4E86\uFF0C\u53EA\u8981\u518D\u62FC\u4E00\u628A\u5927\u661F\uFF0C\u6210\u4E86\u4E0D\u4EC5\u80FD\u5168\u90E8\u56DE\u672C\u8FD8\u80FD\u5927\u8D5A\uFF01\u300D\n\n\u3010\u79D1\u5B66\u89E3\u5256\u3011\uFF1A\u5F53\u60C5\u7EEA\u8FDB\u5165\u7EDD\u671B\u53CD\u5F39\u65F6\uFF0C\u51B3\u7B56\u8010\u53D7\u529B\u6781\u5177\u4E0B\u6ED1\uFF0C\u73A9\u5BB6\u901A\u5E38\u503E\u5411\u4E8E\u5FFD\u7565\u6982\u7387\u548C\u98CE\u9669\uFF0C\u5F3A\u884C\u9009\u62E9\u4F4E\u6210\u529F\u7387\u751A\u81F3\u9AD8\u6298\u56DE\u4E8F\u635F\u6863\u4F4D\uFF0C\u5BFC\u81F4\u6700\u540E\u7684\u4FDD\u9669\u6C60\u4E5F\u88AB\u8361\u6DA4\u4E00\u7A7A\u3002"
  },
  {
    title: "\u300C\u8FD9\u628A\u7CFB\u7EDF\u5728\u9488\u5BF9\u6211\u300D\u53D7\u5BB3\u8005\u6028\u6C14",
    content: "\u73A9\u5BB6\u5728\u7206\u53D1\u8FDE\u8D25\u540E\uFF1A\u300C\u6982\u7387\u7EDD\u5BF9\u88AB\u5B98\u65B9\u6697\u6539\u4E86\uFF0C\u8FD9\u6839\u672C\u4E0D\u662F\u4EC0\u4E4848%\uFF01\u6211\u504F\u8981\u5E72\u5230\u5E95\u770B\u5B83\u4EC0\u4E48\u65F6\u5019\u7ED9\u6211\u6210\uFF01\u300D\n\n\u3010\u79D1\u5B66\u89E3\u5256\u3011\uFF1A\u5C40\u90E8\u5927\u6837\u672C\u6CE2\u52A8\u5728\u5C0F\u5E8F\u5217\u64CD\u4F5C\u65F6\u5B8C\u5168\u6709\u53EF\u80FD\u53D1\u751F\u4E00\u6CE2\u6D41\u6781\u4F4E\u6781\u9AD8\u504F\u79BB\u3002\u7406\u667A\u7684\u505A\u6CD5\u662F\u6682\u65F6\u7194\u65AD\uFF0C\u9000\u51FA\u64CD\u76D8\u671F\uFF0C\u8FDC\u79BB\u7531\u4E8E\u504F\u6267\u5E26\u6765\u7684\u65E0\u8282\u5236\u4E0B\u6CE8\u884C\u4E3A\u3002"
  }
];
