# LEGO WeDo 2.0 Platform - Architecture Plan

## Current State Analysis

### Existing Technology Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Visual Programming**: Blockly 12.3.1

### Current Structure
```
src/
├── components/     # UI components including Blockly workspace
├── contexts/       # Language context
├── hooks/          # Custom hooks (useWeDo for robot control)
├── lib/            # Utilities
└── pages/          # Route pages (Index, Constructor, Visual, Projects, ProjectEditor)
```

## New Architecture - Modular Extensions

### 1. Backend Architecture (Node.js + Express)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB/PostgreSQL configuration
│   │   ├── jwt.ts               # JWT secret and configuration
│   │   └── payment.ts           # Stripe/PayPal configuration
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   ├── errorHandler.ts     # Global error handler
│   │   └── validation.ts       # Request validation
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.model.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.model.ts
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── payments.routes.ts
│   │   │   └── payments.model.ts
│   │   ├── projects/
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── projects.routes.ts
│   │   │   └── projects.model.ts
│   │   ├── maps/
│   │   │   ├── maps.controller.ts
│   │   │   ├── maps.service.ts
│   │   │   ├── maps.routes.ts
│   │   │   └── maps.model.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── admin.routes.ts
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── .env.example
├── package.json
└── tsconfig.json
```

### 2. Frontend Extensions

```
src/
├── components/
│   ├── 3d/                      # 3D Simulator Components
│   │   ├── Scene3D.tsx          # Three.js scene container
│   │   ├── Robot3D.tsx          # 3D robot model
│   │   ├── Motor3D.tsx          # Motor component
│   │   ├── Sensor3D.tsx         # Sensor components
│   │   ├── Wheel3D.tsx          # Wheel component
│   │   ├── PhysicsWorld.tsx     # Cannon.js/Ammo.js physics
│   │   └── MapRenderer3D.tsx    # Map visualization
│   ├── admin/                   # Admin Panel Components
│   │   ├── AdminLayout.tsx
│   │   ├── UserManagement.tsx
│   │   ├── SubscriptionManager.tsx
│   │   ├── PaymentHistory.tsx
│   │   ├── MapCreator.tsx       # Admin map creation tool
│   │   └── Analytics.tsx
│   ├── auth/                    # Authentication Components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ProtectedRoute.tsx
│   ├── payment/                 # Payment Components
│   │   ├── SubscriptionPlans.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── PaymentSuccess.tsx
│   └── blockly/                 # Enhanced Blockly
│       ├── BlocklyEditor.tsx
│       ├── CustomBlocks.tsx
│       └── CodeGenerator.tsx
├── contexts/
│   ├── AuthContext.tsx          # Authentication state
│   ├── Robot3DContext.tsx       # 3D robot state
│   └── MapContext.tsx           # Map state
├── hooks/
│   ├── useAuth.ts               # Authentication hook
│   ├── use3DRobot.ts            # 3D robot control
│   ├── usePayment.ts            # Payment processing
│   └── useMap.ts                # Map management
├── services/
│   ├── api.ts                   # API client configuration
│   ├── authService.ts           # Auth API calls
│   ├── projectService.ts        # Project API calls
│   ├── paymentService.ts        # Payment API calls
│   └── mapService.ts            # Map API calls
├── types/
│   ├── auth.ts
│   ├── robot.ts
│   ├── payment.ts
│   └── map.ts
└── pages/
    ├── admin/
    │   ├── Dashboard.tsx
    │   ├── Users.tsx
    │   ├── Payments.tsx
    │   └── Maps.tsx
    ├── auth/
    │   ├── Login.tsx
    │   ├── Register.tsx
    │   └── Profile.tsx
    └── Simulator3D.tsx          # Main 3D simulator page
```

### 3. Database Schema

#### Users Collection/Table
```typescript
{
  id: string,
  email: string,
  password: string (hashed),
  name: string,
  role: 'user' | 'admin',
  subscriptionStatus: 'free' | 'premium' | 'enterprise',
  subscriptionExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Projects Collection/Table
```typescript
{
  id: string,
  userId: string,
  name: string,
  description: string,
  blocklyWorkspace: string (XML),
  robot3DConfig: JSON,
  mapId: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Payments Collection/Table
```typescript
{
  id: string,
  userId: string,
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed',
  subscriptionType: string,
  paymentMethod: string,
  transactionId: string,
  createdAt: Date
}
```

#### Maps Collection/Table
```typescript
{
  id: string,
  name: string,
  description: string,
  terrain: JSON,          // 3D terrain configuration
  obstacles: JSON[],      // Obstacle positions and types
  startPosition: {x, y, z},
  createdBy: string,      // Admin user ID
  isPublic: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. 3D Simulator Architecture

#### Core Technologies
- **Three.js**: 3D rendering engine
- **Cannon.js** or **Ammo.js**: Physics simulation
- **React Three Fiber**: React renderer for Three.js

#### Robot Components
```typescript
interface Robot3D {
  chassis: THREE.Mesh,
  motors: Motor3D[],
  wheels: Wheel3D[],
  sensors: Sensor3D[],
  position: Vector3,
  rotation: Euler,
  physics: CANNON.Body | Ammo.btRigidBody
}

interface Motor3D {
  id: string,
  type: 'motor' | 'servo',
  power: number,      // -100 to 100
  position: Vector3,
  connectedWheel?: Wheel3D
}

interface Sensor3D {
  id: string,
  type: 'distance' | 'tilt' | 'motion',
  value: number,
  position: Vector3,
  range: number
}
```

### 5. Blockly Integration with 3D

#### Custom Blocks
```javascript
// Motor control blocks
Blockly.Blocks['motor_set_power'] = {
  init: function() {
    this.appendValueInput('POWER')
      .setCheck('Number')
      .appendField('Set motor')
      .appendField(new Blockly.FieldDropdown([['A', 'A'], ['B', 'B']]), 'MOTOR')
      .appendField('power to');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
  }
};

// Sensor reading blocks
Blockly.Blocks['sensor_read_distance'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Read distance sensor');
    this.setOutput(true, 'Number');
  }
};
```

#### Code Execution Flow
```
Blockly Workspace → JavaScript Code → 3D Robot Commands → Physics Simulation → Visual Update
```

### 6. Security Measures

1. **Authentication**
   - JWT tokens with refresh mechanism
   - Password hashing with bcrypt (12 rounds)
   - Rate limiting on auth endpoints

2. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes on frontend
   - Middleware validation on backend

3. **Payment Security**
   - Stripe/PayPal SDK integration
   - Server-side payment validation
   - Webhook verification
   - No credit card data storage

4. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention (parameterized queries)
   - XSS protection
   - CORS configuration
   - Environment variable management

### 7. API Endpoints

#### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user

#### Users
- GET `/api/users/:id` - Get user profile
- PUT `/api/users/:id` - Update user profile
- DELETE `/api/users/:id` - Delete user (admin)

#### Projects
- GET `/api/projects` - List user projects
- POST `/api/projects` - Create project
- GET `/api/projects/:id` - Get project
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

#### Payments
- POST `/api/payments/create-checkout` - Create payment session
- POST `/api/payments/webhook` - Payment webhook
- GET `/api/payments/history` - Payment history

#### Maps
- GET `/api/maps` - List public maps
- POST `/api/maps` - Create map (admin)
- GET `/api/maps/:id` - Get map
- PUT `/api/maps/:id` - Update map (admin)
- DELETE `/api/maps/:id` - Delete map (admin)

#### Admin
- GET `/api/admin/users` - List all users
- GET `/api/admin/stats` - Platform statistics
- PUT `/api/admin/users/:id/subscription` - Update user subscription

### 8. Implementation Phases

**Phase 1**: Backend Setup
- Express server with TypeScript
- Database connection
- Authentication module
- User management

**Phase 2**: Admin Panel
- Admin layout and routing
- User management interface
- Payment history viewer
- Map creator tool

**Phase 3**: 3D Simulator Core
- Three.js scene setup
- Basic robot model
- Physics integration
- Camera controls

**Phase 4**: Blockly Integration
- Custom blocks for robot control
- Code generation
- 3D robot command interface
- Real-time execution

**Phase 5**: Map System
- Map creation in admin panel
- Map loading in 3D simulator
- Robot interaction with map elements

**Phase 6**: Testing & Documentation
- Integration testing
- API documentation
- User guide
- Deployment setup

### 9. Environment Variables

```env
# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/wedo
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRE=30d

# Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 10. Technology Choices

**Database**: MongoDB (flexible schema for robot configurations and maps)
**Physics Engine**: Cannon.js (easier integration, good performance)
**Payment**: Stripe (better developer experience, more features)
**3D Rendering**: React Three Fiber (React integration, easier state management)

## Next Steps

1. Set up backend structure with Express and TypeScript
2. Implement authentication system with JWT
3. Create database models and migrations
4. Build admin panel components
5. Develop 3D simulator with Three.js
6. Integrate Blockly with 3D robot
7. Implement payment system
8. Create map creation and management tools
9. Test all integrations
10. Deploy and document
