#!/bin/bash

echo "=========================================="
echo "  Future You - 一键启动脚本"
echo "=========================================="
echo ""

# 停止旧进程
echo "🛑 停止旧进程..."
pkill -f "node.*app.js" || true
pkill -f "vite" || true
pkill -f "ngrok" || true
sleep 2

# 启动后端
echo "📧 启动后端服务..."
cd /home/ming/.openclaw/workspace-yuxin/future-you/server
nohup npm run dev > /tmp/future-you-backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID"

# 等待后端启动
sleep 3

# 启动前端（使用 Vite dev server，支持代理）
echo "🌐 启动前端服务..."
cd /home/ming/.openclaw/workspace-yuxin/future-you/client
nohup npm run dev > /tmp/vite-dev.log 2>&1 &
FRONTEND_PID=$!
echo "   前端 PID: $FRONTEND_PID"

# 等待前端启动
sleep 3

# 启动 ngrok 隧道
echo "🚇 启动 ngrok 隧道..."
nohup ngrok http 5173 --log=stdout --log-level=info > /tmp/ngrok-tunnel.log 2>&1 &
NGROK_PID=$!
echo "   ngrok PID: $NGROK_PID"

# 等待 ngrok 启动
sleep 5

# 获取公网 URL
echo ""
echo "=========================================="
echo "  🌐 公网访问地址"
echo "=========================================="

NGROK_URL=$(grep "url=" /tmp/ngrok-tunnel.log | tail -1 | sed 's/.*url=//')
if [ -n "$NGROK_URL" ]; then
    echo "✅ Future You 访问地址："
    echo ""
    echo "   $NGROK_URL"
    echo ""
else
    echo "❌ 无法获取公网地址，请稍后手动运行 ./show-url.sh"
fi

echo ""
echo "=========================================="
echo "  📊 服务状态"
echo "=========================================="

# 检查后端
if pgrep -f "node.*app.js" > /dev/null; then
    echo "✅ 后端服务：运行中"
else
    echo "❌ 后端服务：未运行"
fi

# 检查前端
if pgrep -f "vite" > /dev/null; then
    echo "✅ 前端服务：运行中"
else
    echo "❌ 前端服务：未运行"
fi

# 检查 ngrok
if pgrep -f "ngrok" > /dev/null; then
    echo "✅ ngrok 隧道：运行中"
else
    echo "❌ ngrok 隧道：未运行"
fi

echo ""
echo "=========================================="
echo "  📝 管理命令"
echo "=========================================="
echo ""
echo "查看日志："
echo "  后端：tail -f /tmp/future-you-backend.log"
echo "  前端：tail -f /tmp/vite-dev.log"
echo "  ngrok：tail -f /tmp/ngrok-tunnel.log"
echo ""
echo "查看地址："
echo "  ./show-url.sh"
echo ""
echo "停止所有服务："
echo "  ./stop-all.sh"
echo ""
