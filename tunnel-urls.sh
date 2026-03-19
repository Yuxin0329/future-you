#!/bin/bash

echo "🌐 Frontend URL:"
grep -o "https://.*\.loca\.lt" /tmp/tunnel-frontend.log | tail -1

echo ""
echo "📧 Backend URL:"
grep -o "https://.*\.loca\.lt" /tmp/tunnel-backend.log | tail -1
