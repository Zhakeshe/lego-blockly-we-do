# API Documentation - LEGO WeDo 2.0 Platform

Барлық API endpoints-тер `/api` префиксімен басталады.

Base URL: `http://localhost:3000/api` (development)

## 🔐 Аутентификация

Барлық қорғалған endpoints-тер үшін `Authorization` header қажет:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### POST /auth/register
Жаңа қолданушы тіркеу

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "subscriptionStatus": "free",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

### POST /auth/login
Жүйеге кіру

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* User object */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400` - Validation error
- `401` - Invalid credentials

---

### POST /auth/refresh
Access token жаңарту

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### GET /auth/me
Ағымдағы қолданушы деректері

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "subscriptionStatus": "premium",
    "subscriptionExpiry": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /auth/logout
Жүйеден шығу

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Projects Endpoints

### GET /projects
Қолданушының проекттерін алу

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "name": "My Robot Project",
      "description": "First robot program",
      "blocklyWorkspace": "<xml>...</xml>",
      "robot3DConfig": {
        "chassis": { "type": "default", "color": "#0066cc" },
        "motors": [...],
        "sensors": [...],
        "wheels": [...]
      },
      "mapId": "507f1f77bcf86cd799439013",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### POST /projects
Жаңа проект жасау

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "blocklyWorkspace": "<xml>...</xml>",
  "robot3DConfig": {
    "chassis": { "type": "default", "color": "#0066cc" },
    "motors": [],
    "sensors": [],
    "wheels": []
  },
  "mapId": "507f1f77bcf86cd799439013"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": { /* Project object */ }
}
```

---

### GET /projects/:id
Проектті ID бойынша алу

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* Project object */ }
}
```

**Errors:**
- `404` - Project not found
- `403` - Not authorized

---

### PUT /projects/:id
Проектті жаңарту

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "blocklyWorkspace": "<xml>...</xml>",
  "robot3DConfig": { /* Updated config */ }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { /* Updated project */ }
}
```

---

### DELETE /projects/:id
Проектті жою

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Maps Endpoints

### GET /maps
Қолжетімді карталар тізімі

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Simple Maze",
      "description": "Basic maze for beginners",
      "terrain": {
        "width": 100,
        "height": 1,
        "depth": 100,
        "texture": "grass"
      },
      "obstacles": [
        {
          "id": "obstacle_1",
          "type": "box",
          "position": { "x": 10, "y": 1, "z": 10 },
          "rotation": { "x": 0, "y": 0, "z": 0 },
          "scale": { "x": 2, "y": 2, "z": 2 },
          "color": "#ff6b00",
          "physics": {
            "mass": 1,
            "friction": 0.5,
            "restitution": 0.3
          }
        }
      ],
      "startPosition": { "x": 0, "y": 0, "z": 0 },
      "isPublic": true,
      "createdBy": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { /* Pagination info */ }
}
```

---

### POST /maps
Жаңа карта жасау (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "name": "Advanced Maze",
  "description": "Complex maze with obstacles",
  "terrain": {
    "width": 100,
    "height": 1,
    "depth": 100,
    "texture": "concrete"
  },
  "obstacles": [ /* Obstacle configs */ ],
  "startPosition": { "x": 0, "y": 0, "z": 0 },
  "isPublic": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Map created successfully",
  "data": { /* Map object */ }
}
```

---

## Payments Endpoints

### GET /payments/plans
Subscription жоспарлары

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "currency": "USD",
      "duration": 0,
      "features": [
        "Basic Blockly programming",
        "2D robot simulation",
        "5 project saves",
        "Community support"
      ]
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 9.99,
      "currency": "USD",
      "duration": 30,
      "features": [
        "All Free features",
        "3D robot simulation with physics",
        "Unlimited project saves",
        "Access to all maps",
        "Priority support"
      ]
    }
  ]
}
```

---

### POST /payments/create-checkout
Stripe checkout сессиясын жасау

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "planId": "premium"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

---

### GET /payments/history
Төлем тарихы

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "amount": 9.99,
      "currency": "USD",
      "status": "completed",
      "subscriptionType": "premium",
      "paymentMethod": "card",
      "transactionId": "pi_...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { /* Pagination info */ }
}
```

---

## Admin Endpoints

### GET /admin/stats
Dashboard статистика (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "free": 1000,
      "premium": 200,
      "enterprise": 50
    },
    "content": {
      "projects": 5420,
      "maps": 45
    },
    "revenue": {
      "total": 2499.75,
      "payments": 250
    },
    "recentPayments": [ /* Last 5 payments */ ]
  }
}
```

---

### GET /admin/users
Барлық қолданушылар (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)

**Response (200):**
```json
{
  "success": true,
  "data": [ /* Array of users */ ],
  "pagination": { /* Pagination info */ }
}
```

---

### PUT /admin/users/:id/subscription
Қолданушы subscription-ын жаңарту (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "subscriptionStatus": "premium",
  "duration": 30
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User subscription updated successfully",
  "data": { /* Updated user */ }
}
```

---

### DELETE /admin/users/:id
Қолданушыны жою (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User and associated data deleted successfully"
}
```

---

## Error Responses

Барлық қателер келесі форматта қайтарылады:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

API rate limits:
- **General**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Webhooks

### Stripe Webhook

**Endpoint:** `POST /api/payments/webhook`

**Events:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Stripe webhook secret қажет (`.env` файлында).

---

## Postman Collection

API-ны тестілеу үшін Postman collection қолдануға болады:

[Download Postman Collection](./postman_collection.json)

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { accessToken } = response.data.data;
  localStorage.setItem('token', accessToken);
  return response.data;
};

// Get projects
const getProjects = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/projects', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
```

---

Толық API мысалдары `backend/README.md` файлында.
