#!/bin/bash

echo "🚀 Starting Future You..."

# 进入项目目录
cd /home/ming/.openclaw/workspace-yuxin/future-you

# 停止旧进程
echo "🛑 Stopping old processes..."
pkill -f "node.*future-you" || true

# 启动后端
echo "📧 Starting backend..."
cd server
nohup npm run dev > /tmp/future-you-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# 等待后端启动
sleep 5

# 启动前端
echo "🌐 Starting frontend..."
cd ../client
nohup npm run dev > /tmp/future-you-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# 显示访问地址
sleep 3
echo ""
echo "✅ Future You is running!"
echo "🌐 Frontend: http://66.90.98.106:5173"
echo "📧 Backend: http://66.90.98.106:3000"
echo ""
echo "Logs:"
echo "  Backend: tail -f /tmp/future-you-backend.log"
echo "  Frontend: tail -f /tmp/future-you-frontend.log"
echo ""
echo "To stop: pkill -f 'node.*future-you'"
