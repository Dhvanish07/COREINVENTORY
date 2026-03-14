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
├─ package.json
├─ README.md
├─ apps/
│  ├─ api/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ server.js
│  │     ├─ config/
│  │     │  ├─ db.js
│  │     │  └─ mysql.js
│  │     ├─ controllers/
│  │     │  ├─ authController.js
│  │     │  ├─ dashboardController.js
│  │     │  ├─ movementController.js
│  │     │  ├─ productController.js
│  │     │  ├─ reportController.js
│  │     │  ├─ seedController.js
│  │     │  └─ warehouseController.js
│  │     ├─ middleware/
│  │     │  ├─ auth.js
│  │     │  └─ rbac.js
│  │     ├─ models/
│  │     │  ├─ Activity.js
│  │     │  ├─ Product.js
│  │     │  ├─ StockMovement.js
│  │     │  ├─ User.js
│  │     │  └─ Warehouse.js
│  │     ├─ routes/
│  │     │  ├─ authRoutes.js
│  │     │  ├─ dashboardRoutes.js
│  │     │  ├─ movementRoutes.js
│  │     │  ├─ productRoutes.js
│  │     │  ├─ reportRoutes.js
│  │     │  ├─ seedRoutes.js
│  │     │  └─ warehouseRoutes.js
│  │     └─ utils/
│  │        ├─ bootstrap.js
│  │        ├─ generateOtp.js
│  │        ├─ generateToken.js
│  │        ├─ inventoryService.js
│  │        ├─ logActivity.js
│  │        ├─ reference.js
│  │        ├─ roles.js
│  │        └─ sendResetOtpEmail.js
│  └─ web/
│     ├─ next-env.d.ts
│     ├─ next.config.js
│     ├─ package.json
│     ├─ postcss.config.js
│     ├─ tailwind.config.ts
│     ├─ tsconfig.json
│     ├─ app/
│     │  ├─ globals.css
│     │  ├─ layout.tsx
│     │  ├─ page.tsx
│     │  ├─ (auth)/
│     │  │  ├─ layout.tsx
│     │  │  ├─ forgot-password/
│     │  │  │  └─ page.tsx
│     │  │  ├─ login/
│     │  │  │  └─ page.tsx
│     │  │  └─ signup/
│     │  │     └─ page.tsx
│     │  └─ dashboard/
│     │     └─ page.tsx
│     ├─ components/
│     │  ├─ dashboard/
│     │  │  ├─ ActivityList.tsx
│     │  │  ├─ DataTables.tsx
│     │  │  ├─ KpiCards.tsx
│     │  │  ├─ ManagerDashboard.tsx
│     │  │  ├─ QuickActions.tsx
│     │  │  ├─ Sidebar.tsx
│     │  │  ├─ StaffDashboard.tsx
│     │  │  └─ TrendChart.tsx
│     │  ├─ landing/
│     │  │  ├─ Benefits.tsx
│     │  │  ├─ DashboardPreview.tsx
│     │  │  ├─ Features.tsx
│     │  │  ├─ Footer.tsx
│     │  │  └─ Hero.tsx
│     │  └─ ui/
│     │     ├─ badge.tsx
│     │     ├─ button.tsx
│     │     ├─ card.tsx
│     │     ├─ input.tsx
│     │     └─ skeleton.tsx
│     ├─ lib/
│     │  ├─ api.ts
│     │  ├─ auth.ts
│     │  └─ utils.ts
│     └─ types/
│        └─ index.ts
└─ password-reset-app/
   ├─ package.json
   ├─ QUICKSTART.md
   ├─ README.md
   ├─ client/
   │  ├─ index.html
   │  ├─ package.json
   │  ├─ vite.config.js
   │  └─ src/
   │     ├─ App.css
   │     ├─ App.jsx
   │     ├─ index.css
   │     ├─ main.jsx
   │     └─ components/
   │        ├─ PasswordResetForm.css
   │        ├─ PasswordResetForm.jsx
   │        └─ steps/
   │           ├─ EmailStep.css
   │           ├─ EmailStep.jsx
   │           ├─ OTPStep.css
   │           ├─ OTPStep.jsx
   │           ├─ PasswordStep.css
   │           └─ PasswordStep.jsx
   └─ server/
      ├─ index.js
      └─ package.json
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

## Run Projects Locally

### A) Run CoreInventory (apps/api + apps/web)

1. Open terminal in the repository root.

2. Install root workspace dependencies:

```bash
npm install
```

3. Create API env file:
   - Copy `apps/api/.env.example` to `apps/api/.env`
   - Fill your MySQL + JWT + Resend values.

4. Create web env file:
   - Copy `apps/web/.env.local.example` to `apps/web/.env.local`
   - Set `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`).

5. Ensure MySQL is running and `DB_NAME` exists (example: `coreinventory`).

6. Start both API and web together:

```bash
npm run dev
```

7. Open:
   - Web: `http://localhost:3000`
   - API health: `http://localhost:5000/`

8. (Optional) Run each service separately:

```bash
npm run dev --workspace @coreinventory/api
npm run dev --workspace @coreinventory/web
```

9. Production build/start (web):

```bash
npm run build --workspace @coreinventory/web
npm run start --workspace @coreinventory/web
```

### B) Run Password Reset App (`password-reset-app`)

1. Move into the app directory:

```bash
cd password-reset-app
```

2. Install dependencies:

```bash
npm install
```

3. Configure backend env:
   - Copy `server/.env.example` to `server/.env`
   - Set `RESEND_API_KEY`, `PORT` (default `3001`), and `CLIENT_URL` (default `http://localhost:5173`).

4. Start client + server together:

```bash
npm run dev
```

5. Open:
   - Client: `http://localhost:5173`
   - Server: `http://localhost:3001`

6. (Optional) Run separately:

```bash
npm run server
npm run client
```

7. Build client:

```bash
npm run build
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
