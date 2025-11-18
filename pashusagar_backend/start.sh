#!/bin/bash
set -e

echo "Starting Django application..."

# Wait for Redis to be ready
python wait-for-redis.py

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000