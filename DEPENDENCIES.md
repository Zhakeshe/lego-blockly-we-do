# Additional Dependencies to Install

## Frontend Dependencies

Install these packages to enable 3D simulation, authentication, and payment features:

```bash
cd /home/ubuntu/lego-blockly-we-do

# 3D and Physics
npm install three @react-three/fiber @react-three/drei cannon-es @react-three/cannon

# Authentication and API
npm install axios jwt-decode

# Payment (Stripe)
npm install @stripe/stripe-js @stripe/react-stripe-js

# Type definitions
npm install -D @types/three
```

## Backend Dependencies

Already configured in `backend/package.json`. Install with:

```bash
cd backend
npm install
```

## Installation Commands

### Complete Frontend Setup
```bash
npm install three @react-three/fiber @react-three/drei cannon-es @react-three/cannon axios jwt-decode @stripe/stripe-js @stripe/react-stripe-js @types/three
```

### Complete Backend Setup
```bash
cd backend
npm install
```

## Package Descriptions

### Frontend

- **three**: Core 3D rendering library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for React Three Fiber
- **cannon-es**: Physics engine for 3D simulations
- **@react-three/cannon**: React bindings for Cannon.js
- **axios**: HTTP client for API requests
- **jwt-decode**: Decode JWT tokens
- **@stripe/stripe-js**: Stripe JavaScript SDK
- **@stripe/react-stripe-js**: Stripe React components

### Backend

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **stripe**: Stripe payment processing
- **winston**: Logging
- **helmet**: Security headers
- **cors**: CORS middleware
- **express-validator**: Request validation
- **express-rate-limit**: Rate limiting

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Backend (.env)
See `backend/.env.example` for complete configuration.
