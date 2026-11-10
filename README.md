# Another Day

非官方、原创虚构的 iPhone 风格互动故事。私人消息和社交内容属于平行世界剧情，不代表真实艺人或真实账号。

## 当前功能（V0.4 基础版）

- 锁屏、桌面、Dock、通知中心和移动端安全区域适配；支持添加到主屏幕，HTTPS 下提供基础离线缓存。
- KakaoTalk 私聊、群聊、好友与聊天页；首日选择及第 2、3、5 天的可选事件。选择会保存到关系状态、事件记录与消息历史。
- Instagram、Threads、X 的虚构信息流、玩家发布、点赞与评论；Instagram 收藏，X 转发与搜索。Weverse 有独立的 Artist、Community、LIVE、Media 页，并明确标识暂无授权媒体。
- 本机 JSON 存档导出与导入；读取旧 `another_day_v1` 和附件 V0.4 `another_day_v04_extra` 数据。导入前建议先导出备份。
- 备忘录、故事日历、本地照片预览。AI 仅保留未配置接口，不会发送聊天内容到服务端。

## 运行与测试

静态文件直接由 GitHub Pages 的 `main` 分支根目录部署。开发时可使用任意静态服务器。浏览器冒烟测试需要 Node.js 和 Playwright：

```powershell
npm install --no-save --no-package-lock playwright
npx playwright install chromium
node tests/smoke.cjs
```

## 当前限制

剧情目前只有少量完整事件，并未覆盖 180 天。AI、真实平台账号、云同步及真人媒体均未接入。自由输入聊天仅保存在本机，不会生成虚构的自动回复。没有来源与使用许可的公开媒体不会被复制到仓库。
