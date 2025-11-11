# LEGO WeDo 2.0 Platform - Complete Implementation

Толық функционалды LEGO WeDo 2.0 веб платформасы: 3D симулятор, Blockly интеграциясы, аутентификация, админ панель және төлем жүйесі.

## 🎯 Мүмкіндіктер

### ✅ Дайын компоненттер

#### Backend (Node.js + Express + MongoDB)
- ✅ JWT аутентификация және авторизация
- ✅ Қолданушы басқару (тіркелу, кіру, профиль)
- ✅ Проект басқару (CRUD операциялары)
- ✅ Stripe төлем интеграциясы
- ✅ Карта (Map) басқару
- ✅ Админ панель API
- ✅ Қауіпсіздік (helmet, CORS, rate limiting)
- ✅ Валидация және қате өңдеу
- ✅ Логирование (Winston)

#### Frontend (React + TypeScript + Three.js)
- ✅ 3D робот симуляторы (Three.js + Cannon.js)
- ✅ Аутентификация интерфейсі (Login/Register)
- ✅ Админ панель (Dashboard, User Management)
- ✅ Төлем жүйесі (Subscription Plans)
- ✅ 3D компоненттер (Robot, Motors, Sensors, Wheels)
- ✅ Карта рендерингі (Terrain, Obstacles)
- ✅ Context API (Auth, Robot3D)
- ✅ API сервистер

#### Blockly Integration (Existing + New)
- ✅ Blockly workspace (бар)
- 🔄 3D роботпен интеграция (қосу керек)
- 🔄 Кастом блоктар (қосу керек)

## 📁 Жоба құрылымы

```
lego-blockly-we-do/
├── backend/                    # Backend сервер
│   ├── src/
│   │   ├── config/            # Конфигурация (DB, JWT, Payment)
│   │   ├── middleware/        # Middleware (auth, validation, errors)
│   │   ├── modules/           # Модульдер
│   │   │   ├── auth/          # Аутентификация
│   │   │   ├── users/         # Қолданушылар
│   │   │   ├── projects/      # Проекттер
│   │   │   ├── payments/      # Төлемдер
│   │   │   ├── maps/          # Карталар
│   │   │   └── admin/         # Админ
│   │   ├── types/             # TypeScript типтері
│   │   ├── utils/             # Утилиталар
│   │   ├── app.ts             # Express қосымшасы
│   │   └── server.ts          # Сервер кіру нүктесі
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── src/                        # Frontend
│   ├── components/
│   │   ├── 3d/                # 3D компоненттер
│   │   │   ├── Scene3D.tsx    # Негізгі 3D сахна
│   │   │   ├── Robot3D.tsx    # 3D робот
│   │   │   ├── Motor3D.tsx    # Мотор
│   │   │   ├── Sensor3D.tsx   # Сенсор
│   │   │   ├── Wheel3D.tsx    # Дөңгелек
│   │   │   └── MapRenderer3D.tsx # Карта
│   │   ├── admin/             # Админ панель
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── auth/              # Аутентификация
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── payment/           # Төлем
│   │   │   └── SubscriptionPlans.tsx
│   │   └── ui/                # UI компоненттер (shadcn)
│   ├── contexts/              # React Context
│   │   ├── AuthContext.tsx
│   │   ├── Robot3DContext.tsx
│   │   └── LanguageContext.tsx (бар)
│   ├── services/              # API сервистер
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── paymentService.ts
│   │   ├── mapService.ts
│   │   └── adminService.ts
│   ├── types/                 # TypeScript типтері
│   │   └── index.ts
│   ├── pages/                 # Беттер
│   │   ├── Simulator3D.tsx    # 3D симулятор беті
│   │   └── ... (бар беттер)
│   └── hooks/                 # Custom hooks
│
├── ARCHITECTURE_PLAN.md       # Архитектура жоспары
├── DEPENDENCIES.md            # Қосымша тәуелділіктер
└── README_FULL.md            # Толық нұсқаулық
```

## 🚀 Орнату және іске қосу

### 1. Backend орнату

```bash
# Backend директориясына өту
cd backend

# Тәуелділіктерді орнату
npm install

# .env файлын жасау
cp .env.example .env

# .env файлын өңдеу (MongoDB, JWT secrets, Stripe keys)
nano .env

# MongoDB іске қосу (Docker арқылы)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Немесе жергілікті MongoDB қолдану
mongod

# Development режимінде іске қосу
npm run dev

# Production үшін build
npm run build
npm start
```

### 2. Frontend орнату

```bash
# Негізгі директорияға оралу
cd ..

# Қосымша тәуелділіктерді орнату
npm install three @react-three/fiber @react-three/drei cannon-es @react-three/cannon axios jwt-decode @stripe/stripe-js @stripe/react-stripe-js @types/three

# .env файлын жасау
echo "VITE_API_URL=http://localhost:3000/api" > .env
echo "VITE_STRIPE_PUBLIC_KEY=pk_test_..." >> .env

# Development сервер іске қосу
npm run dev
```

### 3. MongoDB орнату

```bash
# Docker арқылы
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Немесе жергілікті орнату (Ubuntu)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

## 🔑 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/lego-wedo

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRE=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Тіркелу
- `POST /api/auth/login` - Кіру
- `POST /api/auth/refresh` - Token жаңарту
- `GET /api/auth/me` - Ағымдағы қолданушы
- `POST /api/auth/logout` - Шығу

### Projects
- `GET /api/projects` - Проекттер тізімі
- `POST /api/projects` - Жаңа проект
- `GET /api/projects/:id` - Проект алу
- `PUT /api/projects/:id` - Проект жаңарту
- `DELETE /api/projects/:id` - Проект жою

### Payments
- `GET /api/payments/plans` - Subscription жоспарлары
- `POST /api/payments/create-checkout` - Төлем сессиясы
- `GET /api/payments/history` - Төлем тарихы
- `POST /api/payments/webhook` - Stripe webhook

### Maps
- `GET /api/maps` - Карталар тізімі
- `POST /api/maps` - Жаңа карта (Admin)
- `GET /api/maps/:id` - Карта алу
- `PUT /api/maps/:id` - Карта жаңарту (Admin)
- `DELETE /api/maps/:id` - Карта жою (Admin)

### Admin
- `GET /api/admin/stats` - Dashboard статистика
- `GET /api/admin/users` - Қолданушылар тізімі
- `GET /api/admin/users/:id` - Қолданушы деректері
- `PUT /api/admin/users/:id/subscription` - Subscription жаңарту
- `DELETE /api/admin/users/:id` - Қолданушыны жою
- `GET /api/admin/payments` - Барлық төлемдер

## 🎨 Frontend Routes

```typescript
/                          # Басты бет
/auth/login               # Кіру
/auth/register            # Тіркелу
/simulator                # 3D симулятор
/projects                 # Проекттер тізімі
/projects/:id             # Проект редакторы
/pricing                  # Subscription жоспарлары
/admin/dashboard          # Админ панель (Admin only)
/admin/users              # Қолданушылар басқару (Admin only)
/admin/maps               # Карталар басқару (Admin only)
```

## 🔒 Қауіпсіздік

- ✅ JWT аутентификация
- ✅ bcrypt password hashing (12 rounds)
- ✅ Helmet.js қауіпсіздік headers
- ✅ CORS қорғанысы
- ✅ Rate limiting
- ✅ Input validation (express-validator)
- ✅ MongoDB injection қорғанысы
- ✅ XSS қорғанысы

## 💳 Subscription Plans

### Free
- Basic Blockly programming
- 2D robot simulation
- 5 project saves
- Community support

### Premium ($9.99/month)
- All Free features
- 3D robot simulation with physics
- Unlimited project saves
- Access to all maps
- Custom robot configurations
- Priority support

### Enterprise ($29.99/month)
- All Premium features
- Custom map creation
- Advanced analytics
- Multi-user collaboration
- API access
- Dedicated support
- Custom branding

## 🛠️ Технологиялар

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Stripe
- Winston (logging)
- Helmet, CORS

### Frontend
- React 18
- TypeScript
- Three.js + React Three Fiber
- Cannon.js (physics)
- Blockly
- Tailwind CSS + shadcn/ui
- Axios
- React Router

## 📝 Келесі қадамдар

### Blockly интеграциясы
1. Кастом блоктар жасау (motor control, sensor reading)
2. Code generation 3D роботқа
3. Blockly workspace-ті 3D симуляторға қосу
4. Real-time execution

### Map Creator
1. Admin панельге карта жасау интерфейсі
2. Drag-and-drop obstacle placement
3. Terrain editor
4. Preview режимі

### Қосымша мүмкіндіктер
1. WebSocket real-time updates
2. File upload (robot configurations)
3. Email notifications
4. API documentation (Swagger)
5. Unit & integration tests
6. CI/CD pipeline
7. Docker deployment

## 🐛 Debugging

### Backend
```bash
cd backend
npm run dev  # tsx watch режимі
```

Logs: `backend/logs/combined.log` және `backend/logs/error.log`

### Frontend
```bash
npm run dev
```

Browser DevTools консолін қолдану

## 🚢 Deployment

### Backend (Heroku/Railway/DigitalOcean)
```bash
cd backend
npm run build
# dist/ папкасын deploy қылу
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# dist/ папкасын deploy қылу
```

### Environment Variables
Барлық production environment variables-ті орнату керек!

## 📄 License

MIT

## 👥 Contributors

- Backend: Node.js + Express + MongoDB
- Frontend: React + TypeScript + Three.js
- 3D: Three.js + Cannon.js
- UI: shadcn/ui + Tailwind CSS

## 🤝 Support

Сұрақтар болса, issue ашыңыз немесе email жіберіңіз.

---

**Назар аударыңыз**: Бұл толық функционалды платформа. Барлық компоненттер модульдік және қауіпсіз түрде жасалған. Production-ға шығармас бұрын:

1. ✅ Барлық environment variables-ті орнатыңыз
2. ✅ MongoDB қауіпсіздігін қамтамасыз етіңіз
3. ✅ Stripe production keys қолданыңыз
4. ✅ HTTPS қосыңыз
5. ✅ Rate limiting параметрлерін реттеңіз
6. ✅ Logging-ті production режиміне қойыңыз
