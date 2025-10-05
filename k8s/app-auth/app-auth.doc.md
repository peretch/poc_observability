# Authentication Service (app-auth) Configuration Help

## Overview
This directory contains Kubernetes manifests for the authentication microservice built with NestJS, OAuth 2.0, PostgreSQL, and Redis.

## Files
- `auth-deployment.yaml` - Authentication service pod configuration
- `auth-service.yaml` - Network access to authentication service

## Key Configuration Details

### Service Settings
- **Port**: 3001
- **Framework**: NestJS
- **Database**: PostgreSQL (via infra-postgres)
- **Cache**: Redis (via infra-redis)
- **Authentication**: OAuth 2.0 (Google, GitHub, Local)

### Resource Limits
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi
- **CPU Request**: 100m
- **CPU Limit**: 500m

### Health Checks
- **Liveness Probe**: HTTP GET /health
- **Readiness Probe**: HTTP GET /health
- **Initial Delay**: 30s (liveness), 5s (readiness)

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string
- **REDIS_HOST**: Redis host (infra-redis)
- **REDIS_PORT**: Redis port (6379)
- **REDIS_PASSWORD**: Redis password
- **JWT_SECRET**: JWT signing secret
- **JWT_EXPIRES_IN**: JWT token expiration (1h)
- **OAuth Providers**: Google and GitHub OAuth configuration

## API Endpoints

### Authentication
- **POST** `/api/v1/auth/register` - User registration
- **POST** `/api/v1/auth/login` - Local login
- **GET** `/api/v1/auth/google` - Google OAuth login
- **GET** `/api/v1/auth/google/callback` - Google OAuth callback
- **GET** `/api/v1/auth/github` - GitHub OAuth login
- **GET** `/api/v1/auth/github/callback` - GitHub OAuth callback
- **GET** `/api/v1/auth/profile` - Get user profile (requires JWT)
- **POST** `/api/v1/auth/logout` - Logout (requires JWT)
- **POST** `/api/v1/auth/refresh` - Refresh JWT token
- **GET** `/api/v1/auth/verify` - Email verification

### Health
- **GET** `/health` - Health check endpoint

## Connection Details
- **Internal Service**: app-auth:3001
- **Local Access**: localhost:3001 (via port-forward)
- **Base URL**: http://localhost:3001/api/v1

## Common Commands

### Check Service Status
```bash
kubectl get pods -l app=app-auth
kubectl logs deployment/app-auth
```

### Test Authentication
```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Database Migration
```bash
# Run Prisma migrations
kubectl exec -it deployment/app-auth -- npx prisma migrate deploy

# Generate Prisma client
kubectl exec -it deployment/app-auth -- npx prisma generate
```

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI: `http://localhost:3001/api/v1/auth/google/callback`
4. Update environment variables with client ID and secret

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Set Authorization callback URL: `http://localhost:3001/api/v1/auth/github/callback`
4. Update environment variables with client ID and secret

## Security Notes
- JWT secrets should be changed in production
- OAuth client secrets should be stored in Kubernetes secrets
- Database credentials should use Kubernetes secrets
- Enable HTTPS in production
- Configure proper CORS origins
- Use strong passwords and JWT secrets
