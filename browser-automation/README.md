# Browser Automation Plugin for Claude Cowork

通过 WebSocket 连接 Chrome 扩展实现远程浏览器自动化。

## 前提条件
1. `npm install -g browser-automation-server-1.0.0.tgz`
2. Chrome 扩展：加载 `extension/` 到 `chrome://extensions/`
3. 扩展自动连接 `ws://127.0.0.1:9223`

## 打包
```bash
cd plugin/ && npm pack && zip -r ../output.plugin . -x "*.tgz"
```
