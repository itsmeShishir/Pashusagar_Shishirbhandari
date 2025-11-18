#!/bin/bash
set -e

echo "Starting Django application..."

# Wait for Redis to be ready
python wait-for-redis.py

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Skip collectstatic in development (not needed for runserver)
if [ "$DEBUG" != "True" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
fi

# Check if Daphne is available
echo "Checking for Daphne ASGI server..."
python -c "import daphne; print(f'Daphne version: {daphne.__version__}')" || {
    echo "❌ Daphne not found - Installing..."
    pip install daphne>=4.0.0
}

echo "✅ Starting Django ASGI server with WebSocket support..."
echo "🔌 WebSocket endpoint will be available at: ws://localhost:8000/ws/chat/consultation/"
echo "📋 Server configuration:"
echo "   - Host: 0.0.0.0"
echo "   - Port: 8000"
echo "   - ASGI Application: core.asgi:application"
echo ""

# Start Daphne with verbose logging
exec daphne -v 2 -b 0.0.0.0 -p 8000 core.asgi:application