# Pashusagar - Full Stack Application

A Django REST API backend with React frontend, featuring real-time chat, authentication, and e-commerce functionality.

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed on your system

### Production Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd pashusagar

# Build and run all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Redis: localhost:6379
```

### Development Setup
```bash
# Use development configuration
docker-compose -f docker-compose.dev.yml up --build

# Access the application
# Frontend (with hot reload): http://localhost:3000
# Backend API: http://localhost:8000
```

### Services
- **Frontend**: React app with Vite, served by Nginx (production) or Vite dev server (development)
- **Backend**: Django REST API with WebSocket support
- **Redis**: For Django Channels (real-time features)
- **Database**: SQLite (development) or PostgreSQL (production)

### Environment Variables
The application uses the following environment variables:

#### Backend
- `DEBUG`: Set to `True` for development
- `REDIS_HOST`: Redis server hostname (default: `redis` in Docker)
- `DATABASE_URL`: Database connection string

#### Frontend
- `VITE_API_URL`: Backend API URL (default: `http://localhost:8000`)

### Docker Commands
```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Run Django commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic
```

### Troubleshooting

#### WebSocket Connection Issues
If you see "Connection error occurred. Please verify that the Django server (with Channels) and Redis are running":

1. **Check if services are running**:
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Test WebSocket connection**:
   - Open `websocket-test.html` in your browser
   - Click "Connect" to test the WebSocket endpoint
   - Try sending a test message

3. **Check logs**:
   ```bash
   docker compose -f docker-compose.dev.yml logs backend
   docker compose -f docker-compose.dev.yml logs redis
   ```

4. **Restart services**:
   ```bash
   docker compose -f docker-compose.dev.yml down
   docker compose -f docker-compose.dev.yml up --build
   ```

#### Common Issues
1. **Port conflicts**: Make sure ports 3000, 8000, and 6379 are available
2. **Permission issues**: On Linux, you might need to run with `sudo`
3. **Database issues**: Delete volumes and restart: `docker compose down -v && docker compose up --build`
4. **WebSocket not working**: Ensure Django is running with Daphne (ASGI server), not the regular runserver

### Features
- User authentication with JWT
- Google OAuth integration
- Real-time chat with WebSockets
- Product management
- Order processing
- Blog functionality
- Admin dashboard