# 🚀 LEGO WeDo 2.0 Platform - Жылдам Бастау

## 1️⃣ Бірінші қадам: MongoDB орнату

```bash
# Docker арқылы (ең оңай)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 2️⃣ Екінші қадам: Backend іске қосу

```bash
cd backend

# Тәуелділіктерді орнату
npm install

# .env файлын жасау
cp .env.example .env

# .env файлын өңдеу (мінімум конфигурация)
nano .env
```

### Мінімум .env конфигурациясы:
```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/lego-wedo
JWT_SECRET=my-super-secret-jwt-key-min-32-characters-long-change-me
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=my-refresh-token-secret-min-32-chars-change
REFRESH_TOKEN_EXPIRE=30d
```

```bash
# Development режимінде іске қосу
npm run dev
```

✅ Backend дайын! API: `http://localhost:3000/api`

## 3️⃣ Үшінші қадам: Frontend орнату

```bash
# Негізгі директорияға оралу
cd ..

# Қосымша тәуелділіктерді орнату
npm install three @react-three/fiber @react-three/drei cannon-es @react-three/cannon axios jwt-decode @stripe/stripe-js @stripe/react-stripe-js @types/three

# .env файлын жасау
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Development сервер іске қосу
npm run dev
```

✅ Frontend дайын! Браузерде: `http://localhost:5173`

## 4️⃣ Төртінші қадам: Алғашқы қолданушы жасау

1. Браузерде `http://localhost:5173/auth/register` ашу
2. Тіркелу формасын толтыру:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
3. "Create Account" басу
4. Автоматты түрде кіру

✅ Қолданушы жасалды!

## 5️⃣ Бесінші қадам: Симуляторды тексеру

1. Басты бетте `http://localhost:5173/` 3D симулятор ашылады
2. "Blockly Editor" табына өту
3. Блоктарды қосу (мысалы, "Move Forward")
4. "Run" батырмасын басу
5. "3D Simulator" табында робот қозғалысын көру

✅ Барлығы жұмыс істейді!

## 🎯 Қосымша: Admin қолданушы жасау

Backend іске қосылған кезде `.env` файлында admin деректерін қосу:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Admin User
```

Немесе MongoDB-да қолмен жасау:

```javascript
// MongoDB shell
use lego-wedo

db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$12$...", // bcrypt hash
  name: "Admin User",
  role: "admin",
  subscriptionStatus: "enterprise",
  createdAt: new Date()
})
```

## 📝 Stripe орнату (опционалды)

Төлем жүйесін тестілеу үшін:

1. [Stripe Dashboard](https://dashboard.stripe.com) ашу
2. Test mode-қа өту
3. API keys алу (Developers → API keys)
4. `.env` файлына қосу:

Backend `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Frontend `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 🐛 Қателерді шешу

### MongoDB қосыла алмайды
```bash
# MongoDB іске қосылғанын тексеру
docker ps | grep mongodb

# Егер жоқ болса, қайта іске қосу
docker start mongodb
```

### Backend іске қоспайды
```bash
# Port 3000 бос екенін тексеру
lsof -i :3000

# Logs тексеру
cd backend
npm run dev
```

### Frontend build қателері
```bash
# Cache тазалау
rm -rf node_modules .vite
npm install
npm run dev
```

## 📚 Толық құжаттама

- **Орнату**: `INSTALLATION.md`
- **API**: `API_DOCUMENTATION.md`
- **Функционал**: `FEATURES.md`
- **Қорытынды**: `IMPLEMENTATION_SUMMARY.md`

## ✅ Checklist

- [ ] MongoDB іске қосылды
- [ ] Backend іске қосылды (`http://localhost:3000/api`)
- [ ] Frontend іске қосылды (`http://localhost:5173`)
- [ ] Қолданушы тіркелді
- [ ] Симулятор жұмыс істейді
- [ ] Blockly блоктары қосылды
- [ ] Робот қозғалды

## 🎉 Дайын!

Енді толық функционалды LEGO WeDo 2.0 платформасын қолдана аласыз!

---

**Көмек керек пе?** `INSTALLATION.md` немесе `README_FULL.md` файлдарын қараңыз.
