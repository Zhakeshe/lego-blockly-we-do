# LEGO WeDo 2.0 Platform - Орнату нұсқаулығы

Бұл нұсқаулық жобаны жергілікті машинада немесе серверде орнату үшін қадам-қадаммен көрсетеді.

## 📋 Талаптар

### Жүйе талаптары
- **Node.js**: v18.0.0 немесе жоғары
- **MongoDB**: v6.0 немесе жоғары
- **npm** немесе **pnpm**
- **Git**

### Қосымша (Production үшін)
- **Nginx** немесе **Apache** (reverse proxy)
- **PM2** (process manager)
- **SSL сертификаты** (Let's Encrypt)

## 🚀 Қадам-қадам орнату

### 1. Репозиторийді клондау

```bash
git clone https://github.com/Zhakeshe/lego-blockly-we-do.git
cd lego-blockly-we-do
```

### 2. MongoDB орнату және іске қосу

#### Docker арқылы (ұсынылады)
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

#### Ubuntu-да жергілікті орнату
```bash
# MongoDB GPG кілтін қосу
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# MongoDB репозиторийін қосу
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Орнату
sudo apt-get update
sudo apt-get install -y mongodb-org

# Іске қосу
sudo systemctl start mongod
sudo systemctl enable mongod

# Статусты тексеру
sudo systemctl status mongod
```

### 3. Backend орнату

```bash
cd backend

# Тәуелділіктерді орнату
npm install

# .env файлын жасау
cp .env.example .env

# .env файлын өңдеу
nano .env
```

#### Backend .env конфигурациясы

```env
# Server Configuration
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/lego-wedo

# JWT Secrets (Production-да өзгертіңіз!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-characters
REFRESH_TOKEN_EXPIRE=30d

# Stripe (Test keys)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Admin User (First run)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!
ADMIN_NAME=Admin User
```

#### Backend іске қосу

```bash
# Development режимі
npm run dev

# Production build
npm run build
npm start
```

### 4. Frontend орнату

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

### 5. Stripe орнату (Төлем жүйесі)

1. [Stripe Dashboard](https://dashboard.stripe.com) ашу
2. API кілттерін алу (Developers → API keys)
3. Test mode-да жұмыс істеу үшін test keys қолдану
4. Webhook орнату:
   - Endpoint URL: `http://your-domain.com/api/payments/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
5. Webhook secret алу және `.env` файлына қосу

### 6. Алғашқы admin қолданушы жасау

Backend іске қосылғаннан кейін, автоматты түрде admin қолданушы жасалады (`.env` файлындағы деректермен).

Немесе қолмен жасау:

```bash
cd backend
node scripts/createAdmin.js
```

## 🔧 Конфигурация

### Frontend роутинг

`src/main.tsx` немесе `src/App.tsx` файлында роутерді қосу:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Robot3DProvider } from './contexts/Robot3DContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import IntegratedSimulator from './pages/IntegratedSimulator';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import MapCreator from './components/admin/MapCreator';
import SubscriptionPlans from './components/payment/SubscriptionPlans';

function App() {
  return (
    <AuthProvider>
      <Robot3DProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth/login" element={<LoginForm />} />
            <Route path="/auth/register" element={<RegisterForm />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <IntegratedSimulator />
              </ProtectedRoute>
            } />
            
            <Route path="/pricing" element={<SubscriptionPlans />} />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/maps" element={
              <ProtectedRoute requireAdmin>
                <MapCreator />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </Robot3DProvider>
    </AuthProvider>
  );
}
```

### MongoDB индекстер

Өнімділікті арттыру үшін индекстер жасау:

```javascript
// MongoDB shell немесе Compass арқылы
use lego-wedo

db.users.createIndex({ email: 1 }, { unique: true })
db.projects.createIndex({ userId: 1, createdAt: -1 })
db.maps.createIndex({ isPublic: 1, createdAt: -1 })
db.payments.createIndex({ userId: 1, createdAt: -1 })
```

## 🧪 Тестілеу

### Backend тестілеу

```bash
cd backend

# API endpoints тестілеу
curl http://localhost:3000/api/health

# Тіркелу тестілеу
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Frontend тестілеу

1. Браузерде ашу: `http://localhost:5173`
2. Тіркелу бетіне өту
3. Жаңа қолданушы жасау
4. Кіру
5. Simulator бетін ашу
6. Blockly блоктарын қосу және іске қосу

## 🚢 Production Deployment

### Backend (Railway/Heroku/DigitalOcean)

```bash
cd backend

# Build
npm run build

# Environment variables орнату
# Railway/Heroku dashboard арқылы барлық .env айнымалыларын қосу

# Deploy
git push railway main
# немесе
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist
```

### Nginx конфигурациясы (VPS үшін)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/lego-wedo/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 арқылы backend іске қосу

```bash
# PM2 орнату
npm install -g pm2

# Backend іске қосу
cd backend
pm2 start dist/server.js --name lego-wedo-api

# Auto-restart қосу
pm2 startup
pm2 save
```

## 🔒 Қауіпсіздік

### Production checklist

- [ ] Барлық JWT secrets өзгертілген (32+ символ)
- [ ] MongoDB аутентификация қосылған
- [ ] HTTPS қосылған (SSL сертификаты)
- [ ] CORS дұрыс конфигурацияланған
- [ ] Rate limiting қосылған
- [ ] Environment variables қауіпсіз сақталған
- [ ] Stripe production keys қолданылады
- [ ] Firewall конфигурацияланған
- [ ] Backup стратегиясы бар

### MongoDB қауіпсіздік

```javascript
// Admin қолданушы жасау
use admin
db.createUser({
  user: "admin",
  pwd: "SecurePassword123!",
  roles: ["root"]
})

// Application қолданушы жасау
use lego-wedo
db.createUser({
  user: "legoapp",
  pwd: "AppPassword123!",
  roles: [{ role: "readWrite", db: "lego-wedo" }]
})
```

`.env` файлын жаңарту:
```env
MONGODB_URI=mongodb://legoapp:AppPassword123!@localhost:27017/lego-wedo
```

## 📊 Monitoring

### Logs

```bash
# Backend logs
pm2 logs lego-wedo-api

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health checks

```bash
# Backend health
curl http://localhost:3000/api/health

# MongoDB health
mongosh --eval "db.adminCommand('ping')"
```

## 🆘 Troubleshooting

### MongoDB қосыла алмайды

```bash
# MongoDB іске қосылғанын тексеру
sudo systemctl status mongod

# Port тексеру
sudo netstat -tulpn | grep 27017

# Logs тексеру
sudo tail -f /var/log/mongodb/mongod.log
```

### Backend іске қоспайды

```bash
# Node.js версиясын тексеру
node --version  # v18.0.0+

# Тәуелділіктерді қайта орнату
rm -rf node_modules package-lock.json
npm install

# .env файлын тексеру
cat .env
```

### Frontend build қателері

```bash
# Cache тазалау
rm -rf node_modules .vite dist
npm install

# Build қайталау
npm run build
```

## 📞 Көмек

Қосымша сұрақтар болса:
- GitHub Issues: https://github.com/Zhakeshe/lego-blockly-we-do/issues
- Email: support@example.com

---

**Сәттілік!** 🚀
