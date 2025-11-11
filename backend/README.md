# LEGO WeDo 2.0 Backend Server

Backend server for the LEGO WeDo 2.0 platform with authentication, project management, payment processing, and admin features.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Secure password hashing with bcrypt
  - Refresh token mechanism

- **Project Management**
  - Create, read, update, delete projects
  - Save Blockly workspace
  - Store 3D robot configurations
  - Project limits based on subscription

- **User Management**
  - User registration and login
  - Profile management
  - Subscription status tracking

- **Security**
  - Helmet.js for HTTP headers
  - CORS protection
  - Rate limiting
  - Input validation and sanitization
  - MongoDB injection prevention

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: helmet, cors, bcryptjs
- **Logging**: Winston
- **Payment**: Stripe

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lego-wedo
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
```

4. Start MongoDB:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB installation
mongod
```

## Development

Start development server with hot reload:
```bash
npm run dev
```

## Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

## Production

Run compiled JavaScript:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout user (Protected)

### Projects
- `GET /api/projects` - Get all user projects (Protected)
- `POST /api/projects` - Create new project (Protected)
- `GET /api/projects/:id` - Get project by ID (Protected)
- `PUT /api/projects/:id` - Update project (Protected)
- `DELETE /api/projects/:id` - Delete project (Protected)

### Health Check
- `GET /health` - Server health status

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   ├── jwt.ts       # JWT configuration
│   │   └── payment.ts   # Payment configuration
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication middleware
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── projects/    # Project management
│   │   ├── payments/    # Payment processing
│   │   ├── maps/        # Map management
│   │   └── admin/       # Admin features
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   │   ├── logger.ts    # Winston logger
│   │   └── validators.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── logs/                # Log files
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Pagination

List endpoints support pagination:

```
GET /api/projects?page=1&limit=10
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Authentication

Protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

## Subscription Limits

- **Free**: 5 projects maximum
- **Premium**: Unlimited projects, 3D simulation access
- **Enterprise**: All features, custom maps, admin access

## Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## Security Best Practices

1. Always use HTTPS in production
2. Keep JWT secrets secure and rotate regularly
3. Use strong passwords (enforced by validation)
4. Enable rate limiting
5. Keep dependencies updated
6. Use environment variables for sensitive data
7. Implement proper CORS configuration
8. Validate and sanitize all inputs

## Next Steps

To complete the backend:

1. Implement payment module (Stripe integration)
2. Add map management module
3. Create admin panel endpoints
4. Add email notifications
5. Implement file upload for robot configurations
6. Add WebSocket support for real-time updates
7. Create API documentation with Swagger
8. Add unit and integration tests

## License

MIT
