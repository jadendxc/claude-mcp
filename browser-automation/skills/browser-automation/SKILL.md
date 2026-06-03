---
name: browser-automation
description: 浏览器自动化 — 导航、截图、点击、输入、读取页面、执行 JavaScript、监控网络和控制台。当用户想要控制 Chrome、截图、抓取页面、填写表单或监控网络流量时使用。
---

# 浏览器自动化技能

通过 MCP 浏览器服务器控制 Chrome 浏览器。

## 可用工具
**标签页管理**: `create_tab`, `close_tab`, `list_tabs`, `navigate`
**页面交互**: `screenshot`, `read_page`, `get_page_text`, `click`, `type`, `scroll`, `key`, `hover`, `find`, `javascript`, `form_input`, `scroll_to`
**监控** (需要 DevTools): `get_console`, `get_network`, `clear_console`, `clear_network`

## 安装
1. `npm install -g browser-automation-server-1.0.0.tgz`
2. 加载 `extension/` 到 Chrome 扩展 (`chrome://extensions/`)
3. 扩展通过 WebSocket 连接 `ws://127.0.0.1:9223`

## 提示
- 先用 `find` 定位元素再 `click`/`type`
- 必须先在 Chrome 中加载扩展
