<div align="center">
   
# 🛒 **E‑COMMERCE BACKEND API**
### **Fully production‑ready backend powering shopping, cart, orders & admin features.**

✨━━━━━━━━━━━━━━━━━━━  **❖**  ━━━━━━━━━━━━━━━━━━━✨
</div>

---

## 🧰 Tech Stack
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-5-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Caching-red?logo=redis)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)
![Cloudinary](https://img.shields.io/badge/Cloud-Cloudinary-blue?logo=cloudinary)
![Multer](https://img.shields.io/badge/Uploads-Multer-yellow)
![Render](https://img.shields.io/badge/Deployed%20On-Render-purple?logo=render)
![Security](https://img.shields.io/badge/Security-Helmet%20%7C%20CORS%20%7C%20RateLimit-critical)

---

## 📸 Screenshots

## 🔐 Login
![Login Screenshot](assets/screenshots/1-login.png)

## 📊 Tasks Cached
![Tasks Cached](assets/screenshots/2-task-list-cached.png)

## 👤 Profile
![Profile Screenshot](assets/screenshots/3-profile.png)

## 📝 Create Task
![Create Task Screenshot](assets/screenshots/4-create-task.png)

## 📈 Stats
![Stats Screenshot](assets/screenshots/5-stats.png)

## 🖼 Avatar Upload
![Avatar Upload Screenshot](assets/screenshots/6-avatar-upload.png)

---

## 🌍 Live Deployment
🔗 **API URL:** https://production-ecommerce-api.onrender.com  
📁 **GitHub Repo:** https://github.com/Ashishjha013/production-ecommerce-api

---

## 🔥 Features

### 👤 Authentication & Authorization
- Register / Login with JWT (access + refresh token mechanism)
- Refresh token stored in secure `httpOnly` cookies
- Role-based access → **Admin vs User**
- Logout + token renewal flow

### 🛍 Product System
- Full CRUD (admin only)
- Search, sorting, filtering, pagination
- Cloudinary image uploads with Multer
- Redis caching for product list & product detail

### 🛒 Cart
- Add/remove items
- Update quantity
- Clear cart
- User-specific persistent cart

### 📦 Orders
- Place order from cart
- Stock deduction
- View order history
- Admin access to all orders

### 🛡 Security
- Helmet, CORS, secure cookies
- Rate limiting
- Sanitization (NoSQL + XSS protection)

---

## 🧱 API Modules

| Module | Endpoints |
|--------|-----------|
| `/api/users` | Register, login, refresh, logout, profile |
| `/api/products` | List, search, sort, create, update, delete |
| `/api/cart` | Add, view, remove, clear |
| `/api/orders` | Place order, get history, admin orders |

---

## 🏗 Architecture Overview

```
[Client]
   |
 HTTPS
   |
[Express Server]
   ├── Auth (JWT)
   ├── Products
   ├── Cart
   ├── Orders
   ├── Redis Cache Layer
   ├── MongoDB Atlas
   └── Cloudinary (images)
```

---

## 📦 Setup (Local Development)

### 1️⃣ Clone Repo
```bash
git clone https://github.com/Ashishjha013/production-ecommerce-api
cd production-ecommerce-api
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Create `.env` file

```
PORT=8080
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

REDIS_URL=your_redis_cloud_url

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

CLIENT_URL=http://localhost:3000
```

### 4️⃣ Run
```bash
npm start
```

---

## 🧪 Test Flow
- Register → Login  
- Check cookies stored  
- Add product to cart  
- Create order  
- Check Redis cache  
- Admin views orders & manages products  

---

## ✨ Author
**Ashish Kumar Jha**  
📍 India • Backend Developer

---

## 📬 Contact
- GitHub: https://github.com/Ashishjha013  
- LinkedIn: https://www.linkedin.com/in/ashishjha13  
- Email: ashishjha1304@gmail.com  

---

*Generated README: E‑Commerce Backend — Designed for real production usage.*
