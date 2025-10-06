# Books Service (app-books) Configuration Help

## Overview
This directory contains Kubernetes manifests for the books microservice built with NestJS, Prisma, PostgreSQL, and Prometheus metrics.

## Files
- `books-deployment.yaml` - Books service pod configuration
- `books-service.yaml` - Network access to books service

## Key Configuration Details

### Service Settings
- **Port**: 3002
- **Framework**: NestJS with Fastify
- **Database**: PostgreSQL (via infra-postgres)
- **Authentication**: JWT validation with app-auth service
- **Metrics**: Prometheus integration

### Resource Limits
- **Memory Request**: 128Mi
- **Memory Limit**: 512Mi
- **CPU Request**: 50m
- **CPU Limit**: 500m

### Health Checks
- **Liveness Probe**: HTTP GET /api/v1/health
- **Readiness Probe**: HTTP GET /api/v1/health
- **Initial Delay**: 30s (liveness), 5s (readiness)

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: JWT signing secret (shared with app-auth)
- **JWT_EXPIRES_IN**: JWT token expiration (1h)
- **AUTH_SERVICE_URL**: URL to app-auth service for token validation
- **ALLOWED_ORIGINS**: CORS allowed origins

## API Endpoints

### Books CRUD
- **POST** `/api/v1/books` - Create a new book (requires JWT)
- **GET** `/api/v1/books` - Get all user's books (requires JWT)
- **GET** `/api/v1/books/:id` - Get specific book (requires JWT)
- **PATCH** `/api/v1/books/:id` - Update book (requires JWT)
- **DELETE** `/api/v1/books/:id` - Delete book (requires JWT)

### Health
- **GET** `/api/v1/health` - Health check endpoint

### Metrics
- **GET** `/api/v1/metrics` - Prometheus metrics endpoint

## Authentication Flow
1. User authenticates with app-auth service
2. app-auth returns JWT token
3. User includes JWT in Authorization header
4. app-books validates JWT with app-auth service
5. If valid, user can access their books

## Connection Details
- **Internal Service**: app-books:3002
- **Local Access**: localhost:3002 (via port-forward)
- **Base URL**: http://localhost:3002/api/v1

## Common Commands

### Check Service Status
```bash
kubectl get pods -l app=app-books
kubectl logs deployment/app-books
```

### Test Books API
```bash
# Health check
curl http://localhost:3002/api/v1/health

# Get books (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3002/api/v1/books

# Create book (requires JWT token)
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Great Gatsby","year":"1925","author":"F. Scott Fitzgerald","description":"A classic American novel"}' \
  http://localhost:3002/api/v1/books
```

### Database Migration
```bash
# Run Prisma migrations
kubectl exec -it deployment/app-books -- npx prisma migrate deploy

# Generate Prisma client
kubectl exec -it deployment/app-books -- npx prisma generate
```

## Data Model

### Book Entity
- **id**: Unique identifier (CUID)
- **title**: Book title (string)
- **year**: Publication year (string)
- **description**: Book description (string, optional)
- **author**: Author name (string)
- **userId**: Reference to user in app-auth (string, no FK)
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

## Security Notes
- JWT secrets should be shared between app-auth and app-books
- User isolation: Users can only access their own books
- No foreign key constraints (microservices pattern)
- CORS configured for development origins
- Health checks for service monitoring

## Prometheus Metrics
- **books_operations_total**: Counter for CRUD operations
- **total_books_total**: Gauge for total books count
- **http_request_duration_seconds**: Request duration histogram
- **http_requests_total**: HTTP request counter
- Default Node.js metrics (memory, CPU, GC, etc.)
