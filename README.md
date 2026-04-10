# Pharmacy Management System

A production-style Medicine Inventory Management System for pharmacists. 

## Features
- Scalable, component-based React architecture using Tailwind CSS.
- Highly secure Node.js APIs backed by PostgreSQL and Prisma ORM.
- JWT-based pharmacist isolation ensures no user can access another's inventory.
- Real-time QR Scanning (`html5-qrcode`) for quick stock additions and sales.
- Automated low stock and near-expiry thresholds and analytical dashboard alerts.
- Predictive Analytics on upcoming stock demand using historical movement data.

## Folder Structure
```text
/backend
 ├── prisma/schema.prisma     (Database schema & rules)
 ├── src/
 │   ├── controllers/         (Core business logic)
 │   ├── middleware/          (JWT Authentication interceptors)
 │   ├── routes/              (API routing mapping to Express)
 │   └── index.ts             (Backend entrypoint)

/frontend
 ├── src/
 │   ├── components/          (Reusable Layout, Scanner Modal)
 │   ├── context/             (Auth Context & state management)
 │   ├── lib/                 (Axios interceptor API binding)
 │   ├── pages/               (Core module flows: Add Stock, Sell, etc.)
 │   └── App.tsx              (React Router & Protected routes)
```