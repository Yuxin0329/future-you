#!/bin/bash

echo "=========================================="
echo "  Future You - 访问信息"
echo "=========================================="
echo ""

# 检查 ngrok 隧道
if [ -f /tmp/ngrok-tunnel.log ]; then
    echo "🌐 访问地址（无需密码）："
    grep "url=" /tmp/ngrok-tunnel.log | sed 's/.*url=/  /'
else
    echo "❌ ngrok 隧道未运行"
fi

echo ""
echo "=========================================="
echo "  服务状态"
echo "=========================================="
echo ""

# 检查服务进程
if pgrep -f "node.*app.js" > /dev/null; then
    echo "✅ 后端服务：运行中"
else
    echo "❌ 后端服务：未运行"
fi

if pgrep -f "vite" > /dev/null; then
    echo "✅ 前端服务：运行中"
else
    echo "❌ 前端服务：未运行"
fi

if pgrep -f "ngrok" > /dev/null; then
    echo "✅ ngrok 隧道：运行中"
else
    echo "❌ ngrok 隧道：未运行"
fi

echo ""
echo "=========================================="
echo "  管理命令"
echo "=========================================="
echo ""
echo "查看日志："
echo "  前端：tail -f /tmp/future-you-frontend.log"
echo "  后端：tail -f /tmp/future-you-backend.log"
echo "  隧道：tail -f /tmp/ngrok-tunnel.log"
echo ""
echo "重启服务："
echo "  pkill -f ngrok && pkill -f vite && pkill -f 'node.*app.js'"
echo "  cd /home/ming/.openclaw/workspace-yuxin/future-you/server && npm run dev &"
echo "  cd /home/ming/.openclaw/workspace-yuxin/future-you/client && npm run dev &"
echo "  nohup ngrok http 5173 --log=stdout --log-level=info > /tmp/ngrok-tunnel.log 2>&1 &"
echo ""
