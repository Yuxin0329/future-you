# Tunnel Quick Start - 快速开始

## 一分钟指南

### 前提条件
- ✅ Future You 项目已运行（前端:5173, 后端:3000）
- ✅ ngrok 已安装（v3.37.2）
- ✅ 管理脚本已就绪

### 推荐方案：Ngrok

#### 1. 获取 Authtoken（一次性）
```
访问: https://dashboard.ngrok.com/signup
注册 → 登录 → 复制 authtoken
```

#### 2. 配置（一次性）
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

#### 3. 启动隧道
```bash
cd /home/ming/.openclaw/workspace-yuxin/future-you
./ngrok-start.sh
```

#### 4. 获取 URL
```bash
./ngrok-urls.sh
```

#### 5. 停止
```bash
./ngrok-stop.sh
```

---

## 命令速查

| 命令 | 说明 |
|------|------|
| `./ngrok-start.sh` | 启动隧道（前端+后端） |
| `./ngrok-urls.sh` | 查看公网 URL |
| `./ngrok-stop.sh` | 停止所有隧道 |
| `tail -f /tmp/ngrok-frontend.log` | 查看前端日志 |
| `tail -f /tmp/ngrok-backend.log` | 查看后端日志 |

---

## 备选方案：Localtunnel

```bash
# 启动
./tunnel-start.sh

# 查看 URL
./tunnel-urls.sh

# 停止
./tunnel-stop.sh
```

**注意：** Localtunnel 可能不稳定

---

## 测试访问

启动后，您会得到两个 URL：
- 前端：`https://xxx.ngrok-free.app` 或 `https://xxx.loca.lt`
- 后端：`https://yyy.ngrok-free.app` 或 `https://yyy.loca.lt`

在浏览器中访问前端 URL 即可！

---

## 故障排除

### 问题：authentication failed
**解决：** 需要先注册并配置 authtoken（见步骤 1-2）

### 问题：端口已被占用
**解决：**
```bash
lsof -i :5173   # 检查前端
lsof -i :3000   # 检查后端
./ngrok-stop.sh # 停止隧道
```

### 问题：连接不稳定
**解决：** 尝试使用 ngrok 方案代替 localtunnel

---

## 文件位置

- 配置指南：`TUNNEL_SETUP.md`
- 快速参考：`TUNNEL_QUICKSTART.md`（本文件）
- 项目目录：`/home/ming/.openclaw/workspace-yuxin/future-you`

---

**需要详细说明？** 查看 `TUNNEL_SETUP.md`
