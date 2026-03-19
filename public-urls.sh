#!/bin/bash

echo "=========================================="
echo "  Future You - 公网访问信息"
echo "=========================================="
echo ""

# 检查前端隧道
if [ -f /tmp/lt-frontend.log ]; then
    echo "🌐 前端地址（用户界面）："
    grep "your url is" /tmp/lt-frontend.log | sed 's/your url is: //'
else
    echo "❌ 前端隧道未运行"
fi

echo ""

# 检查后端隧道
if [ -f /tmp/lt-backend.log ]; then
    echo "📧 后端地址（API接口）："
    grep "your url is" /tmp/lt-backend.log | sed 's/your url is: //'
else
    echo "❌ 后端隧道未运行"
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

if pgrep -f "localtunnel" > /dev/null; then
    echo "✅ 隧道服务：运行中"
else
    echo "❌ 隧道服务：未运行"
fi

echo ""
echo "=========================================="
echo "  管理命令"
echo "=========================================="
echo ""
echo "查看日志："
echo "  前端：tail -f /tmp/lt-frontend.log"
echo "  后端：tail -f /tmp/lt-backend.log"
echo ""
echo "重启隧道："
echo "  pkill -f localtunnel"
echo "  nohup npx localtunnel --port 5173 --subdomain future-you-frontend > /tmp/lt-frontend.log 2>&1 &"
echo "  nohup npx localtunnel --port 3000 --subdomain future-you-backend > /tmp/lt-backend.log 2>&1 &"
echo ""
