#!/bin/bash

echo "🧪 Testing Docker Setup for WebSocket Support"
echo "=============================================="

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.dev.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker compose -f docker-compose.dev.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 15

# Check service status
echo "📊 Checking service status..."
docker compose -f docker-compose.dev.yml ps

# Test Redis connection
echo "🔍 Testing Redis connection..."
if docker compose -f docker-compose.dev.yml exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is working"
else
    echo "❌ Redis connection failed"
fi

# Test Django backend
echo "🔍 Testing Django backend..."
if curl -s -f http://localhost:8000/admin/ > /dev/null; then
    echo "✅ Django backend is responding"
else
    echo "⚠️  Django backend might still be starting..."
fi

# Test WebSocket endpoint (basic check)
echo "🔍 Testing WebSocket endpoint availability..."
if curl -s -I http://localhost:8000/ws/chat/consultation/ | grep -q "426\|101"; then
    echo "✅ WebSocket endpoint is available"
else
    echo "⚠️  WebSocket endpoint check inconclusive"
fi

# Test frontend
echo "🔍 Testing React frontend..."
if curl -s -f http://localhost:3000/ > /dev/null; then
    echo "✅ React frontend is responding"
else
    echo "⚠️  React frontend might still be starting..."
fi

echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:8000/admin/"
echo "   WebSocket: ws://localhost:8000/ws/chat/consultation/"
echo ""
echo "📝 To view logs:"
echo "   docker compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker compose -f docker-compose.dev.yml down"