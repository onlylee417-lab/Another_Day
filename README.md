# Another Day

非官方、原创虚构的 iPhone 风格互动故事。私人消息和社交内容属于平行世界剧情，不代表真实艺人或真实账号。

作品设定在初次进入和设置页说明；聊天、通知与社交信息流使用自然的应用文案，不在每条内容旁重复展示说明。

## 当前功能（V0.4 基础版）

- 锁屏、桌面、Dock、通知中心和移动端安全区域适配；支持添加到主屏幕，HTTPS 下提供基础离线缓存。
- KakaoTalk 私聊、群聊、好友与聊天页；首日到第 10 天的可选事件，内容围绕音乐、散步、天气和日常关系。第 5、8、9、10 天分别在 Instagram、Threads、X、Weverse 选择和发布剧情内容；桌面、通知与日历都可进入当天事件。聊天支持发送小尺寸本机照片。
- Instagram 从六条公开帖子摘要中轮换展示两条，可在站内查看 BTS 与七位成员资料页；Weverse 从五条公开帖子摘要中轮换展示三条，田柾国艺人主页有独立的封面与帖子页。每次重新进入 App 会换一组，页面内操作不会打乱当前内容。Community 放原创故事；Threads、X 以粉丝和路人的原创讨论为主。
- 本机 JSON 存档导出与导入；读取旧 `another_day_v1` 和附件 V0.4 `another_day_v04_extra` 数据。导入前建议先导出备份。
- 备忘录、故事日历、本地照片预览。AI 仅保留未配置接口，不会发送聊天内容到服务端。

公开内容入口按 [BIGHIT BTS 成员资料](https://bts.ibighit.com/eng/profile/) 和 [BTS Weverse](https://weverse.io/bts/highlight) 核对。成员社交账号可能变更，上线前需定期复核；故事内容不会写成艺人官方帖子。

## 运行与测试

静态文件直接由 GitHub Pages 的 `main` 分支根目录部署。开发时可使用任意静态服务器。浏览器冒烟测试需要 Node.js 和 Playwright：

```powershell
npm install --no-save --no-package-lock playwright
npx playwright install chromium
node tests/smoke.cjs
```

检查 iPhone Safari 对应的 WebKit 布局时，可运行 `npx playwright install webkit`，再运行 `$env:SMOKE_ENGINE='webkit'; node tests/smoke.cjs`。

## 当前限制

第一章目前只到第 10 天，完成后不会生成空白新天数；尚未覆盖 180 天。已保存的旧事件 ID 与历史保留，升级后不会重播已完成事件。公开平台内容是人工核对的简短中文摘要与来源链接；随机轮换并非实时抓取，静态站点尚未接入官方内容 API。部分成员资料页尚无已核对的站内帖子。关注按钮只保存本机偏好，不会操作原平台账号。AI、云同步及真人媒体均未接入。自由输入聊天仅保存在本机，不会生成虚构的自动回复。没有来源与使用许可的公开媒体不会被复制到仓库。
