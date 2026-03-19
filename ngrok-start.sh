#!/bin/bash

echo "🚀 Starting ngrok tunnels..."

# 停止旧的 ngrok 进程
echo "🛑 Stopping old ngrok processes..."
pkill -f ngrok || true

# 等待确保停止
sleep 2

# 启动前端隧道
echo "🌐 Starting frontend tunnel (port 5173)..."
nohup ngrok http 5173 --log=stdout --log-level=info > /tmp/ngrok-frontend.log 2>&1 &

# 等待前端隧道启动
sleep 3

# 启动后端隧道
echo "📧 Starting backend tunnel (port 3000)..."
nohup ngrok http 3000 --log=stdout --log-level=info > /tmp/ngrok-backend.log 2>&1 &

# 等待后端隧道启动
sleep 3

# 显示公网地址
echo ""
echo "✅ Ngrok tunnels started!"
echo ""
echo "Getting public URLs..."
sleep 2

echo ""
echo "🌐 Frontend URL:"
grep "forwarding" /tmp/ngrok-frontend.log | tail -1

echo ""
echo "📧 Backend URL:"
grep "forwarding" /tmp/ngrok-backend.log | tail -1

echo ""
echo "📊 Ngrok Dashboard:"
echo "  http://localhost:4040"
echo ""
echo "Logs:"
echo "  Frontend: tail -f /tmp/ngrok-frontend.log"
echo "  Backend: tail -f /tmp/ngrok-backend.log"
echo ""
echo "To stop: ./ngrok-stop.sh"
