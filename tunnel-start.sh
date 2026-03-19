#!/bin/bash

echo "🚀 Starting tunnels with localtunnel..."

# 停止旧进程
echo "🛑 Stopping old tunnel processes..."
pkill -f "lt --subdomain" || true
pkill -f localtunnel || true

# 等待确保停止
sleep 2

# 启动前端隧道
echo "🌐 Starting frontend tunnel (port 5173)..."
nohup lt --port 5173 --subdomain futureyou-frontend 2>&1 > /tmp/tunnel-frontend.log &

# 等待前端隧道启动
sleep 3

# 启动后端隧道
echo "📧 Starting backend tunnel (port 3000)..."
nohup lt --port 3000 --subdomain futureyou-backend 2>&1 > /tmp/tunnel-backend.log &

# 等待后端隧道启动
sleep 3

# 显示公网地址
echo ""
echo "✅ Tunnels started!"
echo ""
echo "Getting public URLs..."
sleep 2

echo ""
echo "🌐 Frontend URL:"
grep -o "https://.*\.loca\.lt" /tmp/tunnel-frontend.log | tail -1

echo ""
echo "📧 Backend URL:"
grep -o "https://.*\.loca\.lt" /tmp/tunnel-backend.log | tail -1

echo ""
echo "Logs:"
echo "  Frontend: tail -f /tmp/tunnel-frontend.log"
echo "  Backend: tail -f /tmp/tunnel-backend.log"
echo ""
echo "To stop: ./tunnel-stop.sh"
