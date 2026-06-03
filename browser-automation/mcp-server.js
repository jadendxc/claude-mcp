// browser-automation MCP server
// 通过 WebSocket 连接 Chrome 扩展，实现远程浏览器自动化

#!/usr/bin/env node
process.chdir(__dirname);
"use strict";

const { WebSocket, WebSocketServer } = require("ws");
const readline = require("readline");

const WS_PORT = 9223;
const wss = new WebSocketServer({ port: WS_PORT });
let extSocket = null;
const pendingReqs = new Map();
let reqCounter = 0;

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    if (msg.type === "ready") { extSocket = socket; return; }
    if (msg.result !== undefined || msg.error !== undefined) {
      const pending = pendingReqs.get(msg.id);
      if (pending) {
        clearTimeout(pending.timer);
        if (msg.error) pending.reject(new Error(msg.error));
        else pending.resolve(msg.result);
        pendingReqs.delete(msg.id);
      }
    }
  });
  socket.on("close", () => { extSocket = null; /* cleanup pending */ });
});

function sendToExtension(method, params, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    if (!extSocket || extSocket.readyState !== 1) return reject(new Error("Chrome 扩展未连接"));
    const id = ++reqCounter;
    const timer = setTimeout(() => { pendingReqs.delete(id); reject(new Error("超时")); }, timeoutMs);
    pendingReqs.set(id, { resolve, reject, timer });
    extSocket.send(JSON.stringify({ id, method, params }));
  });
}

const tools = [
  { name: "create_tab", description: "创建新的浏览器标签页", inputSchema: { type: "object", properties: { url: { type: "string" } } } },
  { name: "close_tab", description: "关闭标签页", inputSchema: { type: "object", properties: { tabId: { type: "number" } }, required: ["tabId"] } },
  { name: "list_tabs", description: "列出所有标签页", inputSchema: { type: "object", properties: {} } },
  { name: "navigate", description: "导航到 URL", inputSchema: { type: "object", properties: { url: { type: "string" }, tabId: { type: "number" } }, required: ["url"] } },
  { name: "screenshot", description: "截取页面截图", inputSchema: { type: "object", properties: { tabId: { type: "number" }, region: { type: "array", items: { type: "number" } } } } },
  { name: "read_page", description: "获取页面 DOM 树", inputSchema: { type: "object", properties: { tabId: { type: "number" }, depth: { type: "number" }, filter: { type: "string", enum: ["all", "interactive"] }, ref_id: { type: "string" }, max_chars: { type: "number" } } } },
  { name: "get_page_text", description: "提取页面可见文本", inputSchema: { type: "object", properties: { tabId: { type: "number" } } } },
  { name: "click", description: "点击元素", inputSchema: { type: "object", properties: { tabId: { type: "number" }, coordinate: { type: "array", items: { type: "number" } }, ref: { type: "string" } } } },
  { name: "type", description: "输入文本", inputSchema: { type: "object", properties: { tabId: { type: "number" }, text: { type: "string" } }, required: ["text"] } },
  { name: "scroll", description: "滚动页面", inputSchema: { type: "object", properties: { tabId: { type: "number" }, direction: { type: "string", enum: ["up", "down", "left", "right"] }, amount: { type: "number" } } } },
  { name: "key", description: "发送按键", inputSchema: { type: "object", properties: { tabId: { type: "number" }, key: { type: "string" } }, required: ["key"] } },
  { name: "hover", description: "悬停元素", inputSchema: { type: "object", properties: { tabId: { type: "number" }, coordinate: { type: "array", items: { type: "number" } }, ref: { type: "string" } } } },
  { name: "find", description: "查找元素", inputSchema: { type: "object", properties: { tabId: { type: "number" }, query: { type: "string" } }, required: ["query"] } },
  { name: "javascript", description: "执行 JS 代码", inputSchema: { type: "object", properties: { tabId: { type: "number" }, code: { type: "string" } }, required: ["code"] } },
  { name: "form_input", description: "设置表单值", inputSchema: { type: "object", properties: { tabId: { type: "number" }, ref: { type: "string" }, value: {} }, required: ["ref"] } },
  { name: "scroll_to", description: "滚动到元素", inputSchema: { type: "object", properties: { tabId: { type: "number" }, ref: { type: "string" } }, required: ["ref"] } },
  { name: "get_console", description: "读取控制台消息", inputSchema: { type: "object", properties: { tabId: { type: "number" }, limit: { type: "number" }, clear: { type: "boolean" } } } },
  { name: "get_network", description: "读取网络请求", inputSchema: { type: "object", properties: { tabId: { type: "number" }, urlPattern: { type: "string" }, onlyErrors: { type: "boolean" }, limit: { type: "number" }, clear: { type: "boolean" } } } },
  { name: "clear_console", description: "清空控制台", inputSchema: { type: "object", properties: { tabId: { type: "number" } } } },
  { name: "clear_network", description: "清空网络", inputSchema: { type: "object", properties: { tabId: { type: "number" } } } }
];

const rl = readline.createInterface({ input: process.stdin });

function respond(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n"); }
function respondErr(id, code, msg) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message: msg } }) + "\n"); }

async function handle(req) {
  const { id, method, params } = req;
  switch (method) {
    case "initialize": return { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "browser-automation", version: "1.0.0" } };
    case "notifications/initialized": return null;
    case "tools/list": return { tools };
    case "tools/call": {
      try {
        const result = await sendToExtension(params.name, params.arguments || {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: "错误: " + e.message }], isError: true };
      }
    }
    default: throw { code: -32601, message: "未知方法: " + method };
  }
}

rl.on("line", (line) => {
  let req;
  try { req = JSON.parse(line); } catch { return; }
  if (req.method && req.id === undefined) { handle(req); return; }
  handle(req).then(r => { if (r !== null) respond(req.id, r); }).catch(e => respondErr(req.id, e.code || -32603, e.message || "内部错误"));
});
