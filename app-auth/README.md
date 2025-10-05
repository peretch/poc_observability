# Authentication Microservice (app-auth)

A NestJS-based authentication microservice with OAuth 2.0 support, PostgreSQL database, and Redis session management.

## Features

- 🔐 **OAuth 2.0 Authentication** - Google and GitHub OAuth integration
- 👤 **User Management** - Registration, login, profile management
- 🔑 **JWT Tokens** - Secure token-based authentication
- 📊 **Session Management** - Redis-backed session storage
- 🗄️ **Database Integration** - PostgreSQL with Prisma ORM
- 🛡️ **Security** - Password hashing, token validation, CORS protection

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   app-auth      │───▶│   PostgreSQL    │
│   (React/Vue)   │    │   (NestJS)      │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         └─────────────▶│   Redis         │
                        │   (Sessions)    │
                        └─────────────────┘
```

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: Passport.js with OAuth 2.0
- **Tokens**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Security**: bcrypt for password hashing

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - Local login
- `GET /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/github` - GitHub OAuth login
- `GET /api/v1/auth/profile` - Get user profile (JWT required)
- `POST /api/v1/auth/logout` - Logout (JWT required)
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Health
- `GET /health` - Health check

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@infra-postgres:5432/microservices_db"

# Redis
REDIS_HOST=infra-redis
REDIS_PORT=6379
REDIS_PASSWORD=redis

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/auth/github/callback

# App Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Docker (for containerization)

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```

3. **Start Development Server**
   ```bash
   npm run start:dev
   ```

### Docker Development

1. **Build Image**
   ```bash
   docker build -t app-auth .
   ```

2. **Run Container**
   ```bash
   docker run -p 3001:3001 app-auth
   ```

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (String) - Unique email
- `password` (String) - Hashed password
- `firstName` (String) - User's first name
- `lastName` (String) - User's last name
- `avatar` (String) - Profile picture URL
- `isActive` (Boolean) - Account status
- `isEmailVerified` (Boolean) - Email verification status
- `googleId` (String) - Google OAuth ID
- `githubId` (String) - GitHub OAuth ID
- `provider` (String) - Authentication provider
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

### Sessions Table
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to users
- `sessionToken` (String) - Unique session token
- `refreshToken` (String) - Refresh token
- `expiresAt` (DateTime) - Session expiration
- `isActive` (Boolean) - Session status
- `userAgent` (String) - Client user agent
- `ipAddress` (String) - Client IP address
- `createdAt` (DateTime) - Creation timestamp

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Redis-backed session storage
- **OAuth 2.0**: Secure third-party authentication
- **CORS Protection**: Configurable origin restrictions
- **Input Validation**: class-validator for request validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## Monitoring & Observability

- **Health Checks**: `/health` endpoint for Kubernetes
- **Logging**: Structured logging with NestJS
- **Error Handling**: Global exception filters
- **Request Validation**: Automatic request validation
- **Database Monitoring**: Prisma query logging in development

## Production Considerations

- Use Kubernetes secrets for sensitive data
- Enable HTTPS/TLS
- Configure proper CORS origins
- Use strong JWT secrets
- Implement rate limiting
- Add request logging
- Configure database connection pooling
- Set up monitoring and alerting

## Integration

This service integrates with:
- **infra-postgres**: PostgreSQL database
- **infra-redis**: Redis cache
- **Frontend applications**: Via REST API
- **Other microservices**: Via JWT token validation

## License

This project is part of the microservices observability learning project.
