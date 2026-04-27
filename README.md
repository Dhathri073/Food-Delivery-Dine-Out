# 🍔 FoodHub — Integrated Food Delivery & Dine-Out Hospitality Platform

A production-ready full-stack web application with real-time order tracking, geolocation-based restaurant discovery, gamified reviews, and role-based dashboards.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand + React Query
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose (with 2dsphere geospatial index)
- **Real-time**: Socket.io (WebSockets)
- **Auth**: JWT (role-based: customer, restaurant_owner, courier)
- **Deployment**: Docker + Docker Compose

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd food-delivery-platform

# Copy and fill in environment variables
cp .env.example .env
cp server/.env.example server/.env
```

Edit `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/food-delivery
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Seed Sample Data

```bash
cd server
npm run seed
```

This creates 3 demo users and 3 restaurants:
| Email | Password | Role |
|-------|----------|------|
| customer@demo.com | password123 | Customer |
| owner@demo.com | password123 | Restaurant Owner |
| courier@demo.com | password123 | Courier |

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Visit: http://localhost:3000

---

## Docker Deployment

```bash
# Copy and fill root .env
cp .env.example .env

# Build and run
docker-compose up --build
```

Visit: http://localhost

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/restaurants | List all |
| GET | /api/restaurants/nearby?lat=&lng=&radius= | Geospatial search |
| GET | /api/restaurants/:id | Get by ID |
| POST | /api/restaurants | Create (owner only) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Create from cart |
| GET | /api/orders/my | My order history |
| GET | /api/orders/:id | Order detail |
| PATCH | /api/orders/:id/status | Update status |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get cart |
| POST | /api/cart/add | Add item |
| PUT | /api/cart/item/:id | Update quantity |
| DELETE | /api/cart/clear | Clear cart |

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| ORDER_CREATED | Server → Client | New order placed |
| ORDER_ACCEPTED | Server → Customer | Restaurant accepted |
| ORDER_STATUS_UPDATED | Server → All parties | Status change |
| JOIN_RESTAURANT_ROOM | Client → Server | Owner joins room |
| TRACK_ORDER | Client → Server | Customer tracks order |

---

## Features

- **Geolocation**: MongoDB `$geoNear` aggregation with 2dsphere index
- **Real-time**: Socket.io rooms per user, restaurant, and order
- **Gamified Reviews**: Points = word count + keyword bonuses + rating bonus
- **AI Suggestions**: Item-aware review prompts
- **Multi-restaurant cart guard**: Prevents mixing restaurants
- **Order state machine**: PLACED → ACCEPTED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
- **Role dashboards**: Merchant revenue + order management, Courier delivery queue

---

## Project Structure

```
├── server/
│   ├── config/         # DB connection
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── sockets/        # Socket.io setup
│   └── utils/          # Seed script
├── client/
│   └── src/
│       ├── components/ # Layout, ProtectedRoute
│       ├── lib/        # API client, Socket
│       ├── pages/      # All page components
│       └── store/      # Zustand stores
├── docker-compose.yml
└── README.md
```
