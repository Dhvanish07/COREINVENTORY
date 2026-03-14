# CoreInventory

Full-stack SaaS Inventory Management System for warehouses and businesses.

## Tech Stack

- Frontend: Next.js (React), Tailwind CSS, Framer Motion, Recharts, Lucide icons
- Backend: Node.js, Express.js, REST API
- Database: MySQL (phpMyAdmin compatible)
- Auth: JWT + OTP password reset

## Run Locally

1. Create env files:

### `apps/api/.env`

```env
PORT=5000
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=coreinventory
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

2. Install dependencies and run:

```bash
npm install
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:5000

## Folder Structure

- apps/api → Express + MySQL backend
- apps/web → Next.js frontend

## Monorepo Structure

- [apps/api/src/server.js](apps/api/src/server.js)
- [apps/api/src/models/User.js](apps/api/src/models/User.js)
- [apps/api/src/models/Product.js](apps/api/src/models/Product.js)
- [apps/api/src/models/Warehouse.js](apps/api/src/models/Warehouse.js)
- [apps/api/src/models/StockMovement.js](apps/api/src/models/StockMovement.js)
- [apps/api/src/models/Activity.js](apps/api/src/models/Activity.js)
- [apps/api/src/controllers](apps/api/src/controllers)
- [apps/api/src/routes](apps/api/src/routes)
- [apps/web/app/page.tsx](apps/web/app/page.tsx) (Landing page)
- [apps/web/app/(auth)](apps/web/app/(auth)) (Login, signup, OTP reset)
- [apps/web/app/dashboard/page.tsx](apps/web/app/dashboard/page.tsx)
- [apps/web/components/dashboard](apps/web/components/dashboard)
- [apps/web/components/landing](apps/web/components/landing)

## Database Schema

### User
- `name`, `email`, `password_hash`, `role`

### Password Reset
- `otp_code`, `expires_at`, `used_at`, `user_id`

### Warehouse
- `name`, `code`, `location`, `capacity`, `is_active`

### Product
- `name`, `sku`, `category`, `unit`
- `low_stock_threshold`, `total_stock`
- `product_stock` table with `warehouse`, `quantity`, `location_note`

### StockMovement
- `movement_type`: `receipt | delivery | transfer | adjustment`
- `status`: `draft | waiting | ready | done | cancelled`
- `reference_no`, `supplier`, `notes`
- `source_warehouse_id`, `destination_warehouse_id`
- `stock_movement_items` with `product_id`, `quantity`

### Activity
- `action`, `entity_type`, `entity_id`, `meta_json`, `user_id`

## REST API Routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

### Warehouses
- `GET /api/warehouses`
- `POST /api/warehouses`
- `PUT /api/warehouses/:id`
- `DELETE /api/warehouses/:id`

### Products
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Stock Movements / Ledger
- `GET /api/movements`
- `POST /api/movements`
- `PATCH /api/movements/:id/status`
- `GET /api/movements/ledger`

### Dashboard / Reports / Seed
- `GET /api/dashboard/summary`
- `GET /api/reports/csv`
- `GET /api/reports/pdf`
- `POST /api/seed`

## Implemented Product Modules

- Landing page (dark SaaS design, glassmorphism, motion animations)
- Authentication pages (JWT + OTP reset)
- Dashboard with KPI cards and charts
- Product Management with filters + SKU search
- Receipts workflow
- Delivery Orders workflow
- Internal Transfers workflow
- Inventory Adjustments workflow
- Activity timeline + movement history
- Multi-warehouse support
- Low stock indicators
- CSV/PDF export
- Loading skeletons and responsive UI

## Dummy Data

To load sample data and default admin credentials:

- Run app
- Trigger `Load Dummy Data` from dashboard quick actions

Default credentials:
- `admin@coreinventory.app`
- `Admin@123`
