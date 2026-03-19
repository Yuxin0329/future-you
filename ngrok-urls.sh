#!/bin/bash

echo "🌐 Frontend URL:"
grep "forwarding" /tmp/ngrok-frontend.log | tail -1

echo ""
echo "📧 Backend URL:"
grep "forwarding" /tmp/ngrok-backend.log | tail -1

echo ""
echo "📊 Ngrok Dashboard:"
echo "  http://localhost:4040"
