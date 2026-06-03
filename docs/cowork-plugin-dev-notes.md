# Cowork 插件开发与部署经验总结

> 日期：2026-06-03 | 会话中遇到的问题及解决方案

---

## 一、插件消失问题

**现象**：之前安装的 github-connector 和 browser-automation 在 Cowork UI 侧边栏看不到。

**原因**：插件文件仍在磁盘（`cowork_plugins/marketplaces/local-desktop-app-uploads/`），但 Cowork 的插件注册表（manifest）丢失。`list_skills` 可以看到技能，但 `installed_plugins` 为空数组。

**解决**：在 Cowork 侧边栏重新上传 `.plugin` 文件即可重新注册。

---

## 二、VM（Linux 沙箱）挂了

**现象**：`mcp__workspace__bash` 报 `VM service not running. The service failed to start.`

**日志位置**：`%LOCALAPPDATA%\Claude-3p\logs\cowork_vm_node.log`

**排查过程**：
1. 查看日志发现 `\\.\pipe\cowork-vm-service` 命名管道不存在（`ENOENT`）
2. 之前 VM 下载超时、SDK 安装被 App 退出中断，导致自修复反复删除/重建 rootfs 镜像
3. Windows 服务 `CoworkVMService` 状态为 `Stopped`

**解决**：
```powershell
Start-Service CoworkVMService
```
或重启 Cowork 应用。

---

## 三、GitHub MCP 认证失败

**根因**：`.mcp.json` 中使用 `${GITHUB_TOKEN}` 环境变量展开，但 Cowork 的 MCP 启动器不支持此语法。

**原理**：GitHub MCP 是每次调用时通过 `npx` 临时 spawn 进程，进程启动时继承不到后设的变量。

**解决**：把 token 直接写死在 `.mcp.json` 中，不要用 `${VAR}` 语法。

---

## 四、Browser-Automation MCP 无法自动启动 — 最重要！

**根因**：**Cowork 不支持 `node mcp-server.js` 本地文件路径方式启动 MCP**。

**最终解决**：改成 `npx` 包方式：
1. `package.json` 加 `bin` 字段
2. `mcp-server.js` 加 `#!/usr/bin/env node` shebang
3. `.mcp.json` 改用 `command: "npx"`, `args: ["browser-automation-mcp"]`
4. `npm pack` 打包 + `npm install -g` 全局安装

---

## 五、关键教训

1. **MCP 本地启动只能用 `npx`**，不能用 `node local-file.js`
2. **env 不用 `${VAR}` 语法**，写死值
3. **VM 挂 → `Start-Service CoworkVMService`**
4. **插件丢 → 重新上传**
