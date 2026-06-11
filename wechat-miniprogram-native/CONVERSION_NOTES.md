# NBA2KOL2 合卡理智卫士 - 微信小程序转换说明

## 已完成迁移

- 已将 React 单页应用重构为原生微信小程序单页面架构，入口页为 `pages/guardianDashboardPage/index`
- 已复刻主控台、报告页、底部三栏切换、主题切换、音效开关、强制冷静弹层、账目回滚、回撤阈值控制
- 已将 `localStorage` 替换为 `wx.setStorageSync` / `wx.getStorageSync`
- 已将 Web Audio 提示音替换为 `wx.vibrateShort()` 触感反馈
- 已将 Lucide 图标提取为小程序可用的 SVG Data URI 资源映射，保持线性描边风格
- 已保留亮色 / 暗色两套主视觉
- 已实现报告页资本曲线 `canvas` 绘制
- 已实现报告图导出为小程序 `canvas` 图片并预览

## 等价替换说明

- `html2canvas` / `html-to-image`
  - Web 端原方案依赖 DOM 截图，小程序中改为 `canvas` 手工绘制报告图后使用 `wx.canvasToTempFilePath`
  - 当前已输出可分享的报告图，但不是 DOM 像素级截屏，而是按数据结构重绘的等价导出

- Web Audio API
  - 原项目有多处合成音效和和弦提示音
  - 小程序版本统一改为轻/中/重三档 `wx.vibrateShort()` 触感反馈，保证交互反馈节奏

- 悬浮 tooltip
  - Web 端胜率走势区块使用 hover tooltip
  - 小程序版本改为点击方格弹出详情 `wx.showModal`

- `confirm()` / `alert()`
  - 已改为 `wx.showModal()` 和 `wx.showToast()`

## 需要人工验证

- 真机暗色模式下的颜色层级和对比度
- iPhone 安全区与 Android 底部手势区适配
- 报告图导出后的文字清晰度与换行效果
- 不同基础库版本下 SVG Data URI 的展示兼容性
- `slider`、`scroll-view`、`canvas` 在低端机上的流畅度

## 当前目录

```text
wechat-miniprogram-native/
  project.config.json
  tsconfig.json
  CONVERSION_NOTES.md
  miniprogram/
    app.json
    app.ts
    app.wxss
    sitemap.json
    pages/
      guardianDashboardPage/
        index.json
        index.ts
        index.wxml
        index.wxss
    utils/
      guardian-data.ts
      guardian-icons.ts
      guardian-runtime.ts
```

## 使用建议

- 用微信开发者工具打开 `wechat-miniprogram-native`
- 首次导入后检查小程序基础库版本是否高于 `3.7.x`
- 建议在真机上重点验证：
  - 账目记录新增 / 删除
  - 报告图导出
  - 强制冷静 3 秒倒计时
  - 深浅主题切换
