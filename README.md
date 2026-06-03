# claude-mcp

Cowork MCP 插件集合。

## 插件列表

### github-connector
GitHub 操作 — 创建 issues、审查 PR、搜索代码、管理仓库。

**配置**：在 `.mcp.json` 中将 `<YOUR_GITHUB_TOKEN>` 替换为你的 GitHub Personal Access Token。

### browser-automation
浏览器自动化 — 导航、截图、点击、输入、读取页面、执行 JavaScript、监控网络和控制台。

**前提条件**：
1. `npm install -g browser-automation-server-1.0.0.tgz`（全局安装）
2. Chrome 扩展：加载 `extension/` 目录到 `chrome://extensions/`
3. 扩展通过 WebSocket 连接 `ws://127.0.0.1:9223`

## 安装

从源码目录打包：
```bash
cd plugin/
zip -r ../output.plugin . -x "*.tgz" "node_modules/.package-lock.json"
```

然后在 Cowork 侧边栏上传 `.plugin` 文件。
