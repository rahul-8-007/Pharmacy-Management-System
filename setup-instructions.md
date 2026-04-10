# Setup and Run Instructions

This repository contains two completely isolated projects: The Node.js Backend and the React Frontend.

### Prerequisites
1. Node.js `v18+`
2. Accessible PostgreSQL Database (local or cloud)

### Step 1: Run the Backend

1. Navigate to the `backend` directory.
   ```bash
   cd backend
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Initialize the database connection.
   Copy the `.env.example` to `.env` and fill in your actual `DATABASE_URL` pointing to your running PostgreSQL server.
   ```env
   # Example
   DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/pharmacy"
   ```
4. Push Prisma schema to the DB.
   ```bash
   npx prisma db push
   # Or npx prisma migrate dev --name init
   ```
5. Start the backend developer server.
   ```bash
   npm run dev
   ```
   *The server will run on port 5000.*

### Step 2: Run the Frontend

1. Navigate to the `frontend` directory.
   ```bash
   cd frontend
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Start the Vite developer server.
   ```bash
   npm run dev
   ```
   *The frontend will run on port 3000.*

Navigate to `http://localhost:3000` to interact with the application. Register a test pharmacist, log in, and begin adding stock!
