#!/bin/bash

echo "🔄 Force rebuilding Docker containers..."

# Stop and remove all containers, networks, and volumes
echo "🛑 Stopping and cleaning up..."
docker compose -f docker-compose.dev.yml down -v --remove-orphans

# Remove any dangling images
echo "🧹 Cleaning up Docker images..."
docker system prune -f

# Rebuild everything from scratch
echo "🔨 Rebuilding containers from scratch..."
docker compose -f docker-compose.dev.yml build --no-cache

# Start services
echo "🚀 Starting services..."
docker compose -f docker-compose.dev.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Show status
echo "📊 Service status:"
docker compose -f docker-compose.dev.yml ps

# Show backend logs to verify Daphne is running
echo "📋 Backend logs (last 20 lines):"
docker compose -f docker-compose.dev.yml logs --tail=20 backend

echo ""
echo "✅ Rebuild complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "🔌 WebSocket: ws://localhost:8000/ws/chat/consultation/"