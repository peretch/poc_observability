# HTTP Requests for Microservices Testing

This directory contains HTTP request files for testing the microservices APIs using Cursor's HTTP extension or similar tools.

## Prerequisites

1. **Start the services**:
   ```bash
   # Make sure all services are running
   kubectl get pods
   
   # Port forward services (if not using Skaffold)
   kubectl port-forward service/app-auth 3001:3001 &
   kubectl port-forward service/app-books 3002:3002 &
   kubectl port-forward service/app-hello-world 3000:3000 &
   ```

2. **Install HTTP extension** in Cursor (if not already installed)

## File Structure

### Authentication Requests (app-auth)
- `01-auth-register.http` - User registration
- `02-auth-login.http` - User login
- `03-auth-profile.http` - Get user profile
- `04-auth-refresh.http` - Refresh JWT token
- `05-auth-logout.http` - User logout

### Books API Requests (app-books)
- `06-books-create.http` - Create book with full data
- `07-books-create-minimal.http` - Create book with minimal data
- `08-books-list.http` - List all user's books
- `09-books-get.http` - Get specific book
- `10-books-update.http` - Update book
- `11-books-delete.http` - Delete book

### System Requests
- `12-health-checks.http` - Health checks for all services
- `13-metrics.http` - Prometheus metrics endpoints
- `14-complete-workflow.http` - End-to-end workflow example

## Usage Instructions

### 1. Authentication Flow
1. Start with `01-auth-register.http` to create a user
2. Use `02-auth-login.http` to get JWT token
3. Copy the JWT token from the response
4. Replace `YOUR_JWT_TOKEN_HERE` in subsequent requests

### 2. Books API Flow
1. Ensure you have a valid JWT token from authentication
2. Use `06-books-create.http` or `07-books-create-minimal.http` to create books
3. Use `08-books-list.http` to see all your books
4. Copy a book ID from the list response
5. Use `09-books-get.http`, `10-books-update.http`, or `11-books-delete.http` with the book ID

### 3. Complete Workflow
Use `14-complete-workflow.http` for a full end-to-end test that includes:
- User registration and login
- Creating multiple books
- Listing, updating, and deleting books

## Variables

Replace these placeholders in the requests:
- `YOUR_JWT_TOKEN_HERE` - JWT token from login response
- `YOUR_REFRESH_TOKEN_HERE` - Refresh token from login response
- `BOOK_ID_HERE` - Book ID from create/list response
- `{{jwt_token}}` - Variable for workflow (set in Cursor)

## Expected Responses

### Successful Registration/Login
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Successful Book Creation
```json
{
  "id": "book_id",
  "title": "Book Title",
  "year": "2023",
  "author": "Author Name",
  "description": "Book description",
  "userId": "user_id",
  "createdAt": "2023-10-06T00:00:00.000Z",
  "updatedAt": "2023-10-06T00:00:00.000Z"
}
```

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check JWT token is valid and not expired
2. **403 Forbidden**: User trying to access another user's books
3. **404 Not Found**: Book ID doesn't exist or doesn't belong to user
4. **Connection refused**: Services not running or port forwarding not set up

### Health Checks
Use `12-health-checks.http` to verify all services are running:
- Auth service: `http://localhost:3001/api/v1/health`
- Books service: `http://localhost:3002/api/v1/health`
- Hello World service: `http://localhost:3000/health`

### Metrics
Use `13-metrics.http` to check Prometheus metrics:
- Auth metrics: `http://localhost:3001/api/v1/metrics`
- Books metrics: `http://localhost:3002/api/v1/metrics`
- Hello World metrics: `http://localhost:3000/metrics`

## Cursor HTTP Extension Tips

1. **Variables**: Use `{{variable_name}}` for dynamic values
2. **Environment**: Set up environment variables for different stages
3. **History**: View request/response history in the extension
4. **Collections**: Organize requests into collections for better management
