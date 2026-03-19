# Future You - 内网穿透配置指南

## 概述

本指南帮助您配置内网穿透，让 Future You 项目可以从外网访问。

## 当前状态

✅ **已安装的工具：**
- ngrok (v3.37.2) - 需要 authtoken
- localtunnel - 免费但可能有连接问题
- cloudflared (v2026.3.0) - 需要配置 Cloudflare 账户

✅ **项目已运行：**
- 前端：http://localhost:5173 ✓
- 后端：http://localhost:3000 ✓

✅ **管理脚本已创建：**

### Ngrok 方案（推荐）

```
ngrok-start.sh  - 启动 ngrok 隧道
ngrok-stop.sh   - 停止 ngrok 隧道
ngrok-urls.sh   - 查看公网 URL
```

### Localtunnel 方案（备选）

```
tunnel-start.sh  - 启动 localtunnel 隧道
tunnel-stop.sh   - 停止 localtunnel 隧道
tunnel-urls.sh   - 查看公网 URL
```

---

## 方案一：使用 Ngrok（推荐）

### 步骤 1：注册 Ngrok 账户

1. 访问 https://dashboard.ngrok.com/signup
2. 注册免费账户（无需信用卡）
3. 登录后获取您的 authtoken

### 步骤 2：配置 authtoken

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

将 `YOUR_AUTHTOKEN` 替换为您从 ngrok.com 获取的实际 token。

### 步骤 3：启动隧道

```bash
cd /home/ming/.openclaw/workspace-yuxin/future-you
./ngrok-start.sh
```

### 步骤 4：获取公网 URL

```bash
./ngrok-urls.sh
```

您会看到类似这样的输出：
```
🌐 Frontend URL:
https://abcd-1234.ngrok-free.app

📧 Backend URL:
https://wxyz-5678.ngrok-free.app
```

### 步骤 5：测试访问

1. 在浏览器中访问前端 URL
2. 测试后端 API（例如：`https://wxyz-5678.ngrok-free.app/api/health`）

### 停止隧道

```bash
./ngrok-stop.sh
```

---

## 方案二：使用 Localtunnel（备选）

**注意：** Localtunnel 可能因为网络原因连接不稳定。

### 启动隧道

```bash
cd /home/ming/.openclaw/workspace-yuxin/future-you
./tunnel-start.sh
```

### 获取公网 URL

```bash
./tunnel-urls.sh
```

### 停止隧道

```bash
./tunnel-stop.sh
```

---

## 方案三：使用 Cloudflare Tunnel（高级）

### 配置步骤

1. 登录 Cloudflare：https://dash.cloudflare.com/
2. 获取您的 Account ID
3. 安装并认证：

```bash
# 认证
cloudflared tunnel login

# 创建隧道
cloudflared tunnel create futureyou

# 配置前端隧道
cloudflared tunnel route dns futureyou futureyou.yourdomain.com

# 启动隧道
cloudflared tunnel --url http://localhost:5173
```

---

## 前端配置

由于隧道 URL 每次启动可能变化，建议在前端使用相对路径：

```javascript
// client/src/api.js 或类似文件
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
```

或者创建 `.env.production` 文件（如果需要固定 URL）：

```env
VITE_API_BASE_URL=https://your-backend-tunnel-url
```

---

## 日志位置

### Ngrok 日志
- 前端：`/tmp/ngrok-frontend.log`
- 后端：`/tmp/ngrok-backend.log`

### Localtunnel 日志
- 前端：`/tmp/tunnel-frontend.log`
- 后端：`/tmp/tunnel-backend.log`

### 查看实时日志
```bash
# Ngrok 前端
tail -f /tmp/ngrok-frontend.log

# Localtunnel 前端
tail -f /tmp/tunnel-frontend.log
```

---

## 故障排除

### Ngrok 错误：authentication failed

**解决方法：**
1. 访问 https://dashboard.ngrok.com/signup 注册
2. 登录后复制 authtoken
3. 运行：`ngrok config add-authtoken YOUR_TOKEN`

### Localtunnel 错误：connection refused

**解决方法：**
- 检查网络连接
- 尝试使用 ngrok 方案
- 检查防火墙设置

### 端口已被占用

**解决方法：**
```bash
# 检查占用进程
lsof -i :5173
lsof -i :3000

# 停止隧道
./ngrok-stop.sh
# 或
./tunnel-stop.sh
```

---

## 快速参考

### 启动项目
```bash
cd /home/ming/.openclaw/workspace-yuxin/future-you
./start.sh
```

### 启动隧道（推荐：ngrok）
```bash
# 配置完成后
./ngrok-start.sh
```

### 查看公网 URL
```bash
./ngrok-urls.sh
```

### 停止隧道
```bash
./ngrok-stop.sh
```

---

## 重要提示

1. **URL 变化：** 免费隧道每次重启 URL 可能会变化
2. **安全性：** 不要在生产环境中使用免费的未加密隧道
3. **流量限制：** 免费版本有流量限制，但个人使用足够
4. **自动启动：** 如需开机自动启动，可以创建 systemd 服务

---

## 下一步

1. 选择一个方案（推荐 ngrok）
2. 完成账户注册和配置
3. 启动隧道
4. 测试公网访问
5. 将公网 URL 分享给需要访问的人

---

## 技术支持

- Ngrok 文档：https://ngrok.com/docs
- Localtunnel GitHub：https://github.com/localtunnel/localtunnel
- Cloudflare Tunnel 文档：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
