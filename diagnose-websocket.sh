#!/bin/bash

echo "🔍 WebSocket Diagnostic Tool"
echo "============================"

# Check if containers are running
echo "📊 Container Status:"
docker compose -f docker-compose.dev.yml ps

echo ""
echo "🔍 Backend Container Details:"
docker compose -f docker-compose.dev.yml exec backend ps aux | grep -E "(daphne|runserver|python)"

echo ""
echo "📋 Recent Backend Logs:"
docker compose -f docker-compose.dev.yml logs --tail=10 backend

echo ""
echo "🌐 Testing HTTP Endpoint:"
curl -I http://localhost:8000/admin/ 2>/dev/null | head -3 || echo "❌ HTTP endpoint not responding"

echo ""
echo "🔌 Testing WebSocket Endpoint (should show upgrade required):"
curl -I http://localhost:8000/ws/chat/consultation/ 2>/dev/null | head -3 || echo "❌ WebSocket endpoint not found"

echo ""
echo "🔍 Checking if Daphne is installed in container:"
docker compose -f docker-compose.dev.yml exec backend python -c "import daphne; print(f'Daphne version: {daphne.__version__}')" 2>/dev/null || echo "❌ Daphne not found in container"

echo ""
echo "📦 Python packages in container:"
docker compose -f docker-compose.dev.yml exec backend pip list | grep -E "(daphne|django|channels)"