# CoreInventory

CoreInventory is a full-stack inventory and warehouse operations platform with role-based workflows for **Inventory Manager** and **Warehouse Staff**.

It includes:
- Multi-warehouse stock tracking
- Product assignment by warehouse
- Receiving, delivery, transfer, and adjustment workflows
- Manager and staff dashboards
- JWT authentication and OTP password reset
- CSV/PDF report export

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- Resend (OTP email)

### Monorepo
- npm workspaces
- Root scripts orchestrate API + web together

---

## Repository Structure

```text
.
├─ apps/
│  ├─ api/      # Express + MySQL REST API
│  └─ web/      # Next.js frontend
├─ password-reset-app/ # separate reference app retained in repo
├─ package.json
└─ README.md
```

---

## Role Workflows

### Inventory Manager
- Dashboard
- Receiving
- Add Product
- Products
- Warehouses
- Delivery Scheduling
- Profile

### Warehouse Staff
- Dashboard
- Internal Transfer
- Picking
- Shelving
- Counting
- Profile

> Warehouse Staff is intentionally blocked from manager Receiving and Delivery Scheduling screens.

---

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+ (or compatible)

---

## Environment Configuration

### 1) API env
Create `apps/api/.env` from `apps/api/.env.example`.

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
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TEST_RECIPIENT=your_test_email@example.com
```

### 2) Web env
Create `apps/web/.env.local` from `apps/web/.env.local.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Run Locally

Install dependencies:

```bash
npm install
```

Run API + web together:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev --workspace @coreinventory/api
npm run dev --workspace @coreinventory/web
```

URLs:
- Web: `http://localhost:3000`
- API: `http://localhost:5000`

Build web app:

```bash
npm run build --workspace @coreinventory/web
```

---

## Seed / Default Admin

On API startup, default admin is ensured:
- Email: `admin@coreinventory.app`
- Password: `Admin@123`

You can also call seed endpoint:
- `POST /api/seed`

---

## API Overview

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PUT /api/auth/me`

### Products
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Warehouses
- `GET /api/warehouses`
- `POST /api/warehouses`
- `PUT /api/warehouses/:id`
- `DELETE /api/warehouses/:id`

### Movements
- `GET /api/movements`
- `POST /api/movements`
- `PATCH /api/movements/:id/status`
- `GET /api/movements/ledger`

### Dashboard / Reports
- `GET /api/dashboard/summary`
- `GET /api/reports/csv`
- `GET /api/reports/pdf`

---

## All Database Tables

The application currently uses these MySQL tables:

1. `users`
2. `password_resets`
3. `warehouses`
4. `products`
5. `product_stock`
6. `stock_movements`
7. `stock_movement_items`
8. `activities`

### 1) `users`
- `id` (PK, bigint unsigned, auto increment)
- `name` (varchar 120)
- `email` (varchar 190, unique)
- `password_hash` (varchar 255)
- `role` (enum: `admin`, `manager`, `operator`)
- `is_active` (tinyint(1))
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2) `password_resets`
- `id` (PK, bigint unsigned, auto increment)
- `user_id` (FK → `users.id`)
- `otp_code` (varchar 10)
- `expires_at` (datetime)
- `used_at` (datetime, nullable)
- `created_at` (timestamp)

### 3) `warehouses`
- `id` (PK, bigint unsigned, auto increment)
- `name` (varchar 150)
- `code` (varchar 40, unique)
- `location` (varchar 255)
- `capacity` (int unsigned)
- `is_active` (tinyint(1))
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 4) `products`
- `id` (PK, bigint unsigned, auto increment)
- `name` (varchar 200)
- `sku` (varchar 80, unique)
- `category` (varchar 120)
- `unit` (varchar 40, default `pcs`)
- `low_stock_threshold` (int, default 10)
- `total_stock` (int, default 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 5) `product_stock`
- `id` (PK, bigint unsigned, auto increment)
- `product_id` (FK → `products.id`)
- `warehouse_id` (FK → `warehouses.id`)
- `quantity` (int, default 0)
- `location_note` (varchar 255, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 6) `stock_movements`
- `id` (PK, bigint unsigned, auto increment)
- `reference_no` (varchar 50, unique)
- `movement_type` (enum: `receipt`, `delivery`, `transfer`, `adjustment`)
- `status` (enum: `draft`, `waiting`, `ready`, `done`, `cancelled`)
- `supplier` (varchar 180, nullable)
- `notes` (text, nullable)
- `source_warehouse_id` (FK → `warehouses.id`, nullable)
- `destination_warehouse_id` (FK → `warehouses.id`, nullable)
- `created_by` (FK → `users.id`, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 7) `stock_movement_items`
- `id` (PK, bigint unsigned, auto increment)
- `movement_id` (FK → `stock_movements.id`)
- `product_id` (FK → `products.id`)
- `quantity` (int)
- `created_at` (timestamp)

### 8) `activities`
- `id` (PK, bigint unsigned, auto increment)
- `action` (varchar 200)
- `entity_type` (varchar 80)
- `entity_id` (varchar 80, nullable)
- `meta_json` (longtext, nullable)
- `user_id` (FK → `users.id`, nullable)
- `created_at` (timestamp)

---

## Operational Notes

- Stock is finalized when movement status is set to `done`.
- Transfer enforces **Transfer From** and **Transfer To** warehouse selection.
- Product assignment is tracked in `product_stock` per warehouse.
- Dashboard UI is resilient to partial API failures and shows fallback state instead of blank screens.

---

## Troubleshooting

### `npm run dev` fails at root
If root `npm run dev` exits with port or stale cache issues:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item "apps/web/.next" -Recurse -Force -ErrorAction SilentlyContinue
npm run dev --workspace @coreinventory/api
npm run dev --workspace @coreinventory/web
```

### Next.js missing chunk / module errors (`Cannot find module './xxx.js'`)
- Stop all Node processes
- Delete `apps/web/.next`
- Restart web dev server

---

## License

Private project repository.
