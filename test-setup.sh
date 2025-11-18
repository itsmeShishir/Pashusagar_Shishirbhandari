#!/bin/bash

echo "🚀 Testing Docker setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✓ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

echo "✓ docker-compose is available"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait a bit for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✓ Services are running"
    
    # Test Redis connection
    if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping | grep -q "PONG"; then
        echo "✓ Redis is responding"
    else
        echo "⚠ Redis connection issue"
    fi
    
    # Test backend health
    sleep 5
    if curl -f http://localhost:8000/admin/ > /dev/null 2>&1; then
        echo "✓ Backend is responding"
    else
        echo "⚠ Backend might still be starting up"
    fi
    
    # Test frontend
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        echo "✓ Frontend is responding"
    else
        echo "⚠ Frontend might still be starting up"
    fi
    
    echo ""
    echo "🎉 Setup complete! Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8000"
    echo "   Admin:    http://localhost:8000/admin/"
    echo ""
    echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "To stop:      docker-compose -f docker-compose.dev.yml down"
    
else
    echo "❌ Services failed to start. Check logs:"
    docker-compose -f docker-compose.dev.yml logs
fi