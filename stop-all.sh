#!/bin/bash

echo "=========================================="
echo "  Future You - 停止所有服务"
echo "=========================================="
echo ""

echo "🛑 停止后端服务..."
pkill -f "node.*app.js"

echo "🛑 停止前端服务..."
pkill -f "vite"

echo "🛑 停止 ngrok 隧道..."
pkill -f "ngrok"

echo ""
echo "⏳ 等待进程结束..."
sleep 2

# 检查是否还有进程在运行
RUNNING=0

if pgrep -f "node.*app.js" > /dev/null; then
    echo "❌ 后端服务仍在运行"
    RUNNING=1
else
    echo "✅ 后端服务已停止"
fi

if pgrep -f "vite" > /dev/null; then
    echo "❌ 前端服务仍在运行"
    RUNNING=1
else
    echo "✅ 前端服务已停止"
fi

if pgrep -f "ngrok" > /dev/null; then
    echo "❌ ngrok 隧道仍在运行"
    RUNNING=1
else
    echo "✅ ngrok 隧道已停止"
fi

echo ""
if [ $RUNNING -eq 0 ]; then
    echo "🎉 所有服务已成功停止！"
else
    echo "⚠️  部分服务未能停止，请手动检查"
fi
