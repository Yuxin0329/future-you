#!/bin/bash

echo "🛑 Stopping tunnels..."
pkill -f "lt --subdomain" || true
pkill -f localtunnel || true
echo "✅ Stopped!"
