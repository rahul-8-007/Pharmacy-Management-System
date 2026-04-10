# Architecture and Business Logic Mapping

As requested, this document contains an explanation of exactly how the core code models the required system flow diagram, and how data isolation is reliably enforced across all pharmacists.

## 1. Flow Diagram Execution Mappings

### Flow 1: Add New Stock
- **Requirement:** Scan QR -> Check DB -> Found: update quantity / Not found: fill new -> Check expiry alert.
- **Implementation Mapping:**
  - `ScannerModal.tsx`: Instantiates the `html5-qrcode` library, capturing the camera feed and returning decoded batch text strings to `AddStock.tsx`.
  - `AddStock.tsx` calls `GET /api/medicines/batch/:batchNo`. The controller uses logic `if (batchNo.startsWith('EXT'))` to act as an external API "mock" and return mock payload data for unregistered medicines. 
  - `stockController.ts.addStock` creates the actual PostgreSQL record or uses an atomic update (`quantityAvailable: medicine.quantityAvailable + Number(quantityAdded)`) if it already exists, avoiding duplicate records for the same pharmacist.

### Flow 2: Sell Tablets
- **Requirement:** Scan QR -> Enter QTY -> Check Stock -> Valid: deduuct and save sale -> Invalid: error lock -> Check low stock.
- **Implementation Mapping:**
  - `saleController.ts.sellTablets` enforces transaction safety by performing the logic within a `prisma.$transaction`. This prevents race conditions where stock may jump negative. 
  - The controller actively compares `qty` against `medicine.quantityAvailable` strictly before committing. A "lowStockAlert" boolean flag triggers frontend UI states automatically when passing under the integer defined in `process.env.LOW_STOCK_THRESHOLD`.

### Flow 3: View Predictions
- **Requirement:** Show next month stock requirement estimate + seasonal insights.
- **Implementation Mapping:**
  - Designed in `predictionController.ts` mapped to Recharts UI in `Predictions.tsx`. 
  - The backend aggregates sum quantity movement on the `Sale` table over the last 30 days. It creates predictive buffers (`Math.ceil(totalSoldLast30Days * 1.1)`) yielding an AI-style restock logic recommendation matrix.

---

## 2. Pharmacist Data Isolation Enforcement

Multi-tenant architecture in this application strongly enforces data isolation via dual-layer verification:

### Layer A: Route Scope Middleware
`authMiddleware.ts` interceptors validate incoming HTTP Headers (`Authorization: Bearer <token>`), extracting the cryptographic `id` payload attached during registration. It overrides the generic request via `req.pharmacistId = user.id`. This effectively secures the endpoints. Only perfectly signed requests are allowed past `Router.use(authenticateJWT)`.

### Layer B: ORM Hard Constraints
Inside Database execution layers (via Prisma), all models strongly correlate back to the root `Pharmacist` table using relational `references: [id]`.
To assure privacy, *no database query executes universally*. Example in `medicineController.ts`:

```typescript
const medicines = await prisma.medicine.findMany({
  where: { pharmacistId: req.pharmacistId } // Strictly Bound execution!
});
```
This guarantees that **Pharmacist A** can solely operate on Medicine nodes explicitly injected with their unique Primary Key. Even maliciously guessing a valid batch string scanned by another pharmacist will block lookup checks due to composite uniqueness configurations (`@@unique([batchNo, pharmacistId])`).
