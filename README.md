# ChainMind AI - Supply Chain Intelligence Platform

> **Predict. Monitor. Optimize.**

ChainMind AI is a modern AI-powered Supply Chain Intelligence Platform designed for manufacturing, retail, logistics, and distribution organizations. The platform enables organizations to monitor and manage suppliers, products, warehouses, stock levels, purchase orders, and shipments while providing automated intelligence, supplier performance scores, stockout risk detection, rule-based shipment delay scoring, statistical demand forecasting, and an AI supply chain assistant.

---

## Key Features

- **Executive Dashboard**: Top operational KPI metrics, supply chain health index gauge, shipment status distribution, and recent risk alerts.
- **Supplier Performance Scoring**: Automated rating calculation based on on-time delivery rates, delay histories, and quality ratings.
- **Inventory Intelligence**: Formula-based available stock tracking (`availableStock = currentStock - reservedStock`), stockout risk triggers (`HIGH_STOCKOUT_RISK`, `LOW_STOCK`), manual adjustments, and audit stock movements.
- **Purchase Order Workflow**: Complete state machine (`DRAFT` → `SUBMITTED` → `APPROVED` → `CONFIRMED` → `PARTIALLY_RECEIVED` → `COMPLETED` / `CANCELLED`) with transaction-safe item receiving and automatic inventory updates.
- **Shipment Delay Risk Engine**: Explainable rule-based risk calculation combining supplier delay history (30%), carrier performance (20%), route corridor risk (20%), and timeline factors (30%).
- **Statistical Demand Forecasting**: Weighted moving average and exponential trend projections for inventory optimization.
- **AI Operational Insights & Assistant**: Conversational AI assistant supporting Gemini / OpenAI APIs with graceful fallback when unconfigured.
- **Security & Multi-Tenancy**: JWT authentication, BCrypt password hashing, role-based authorization (`ORGANIZATION_ADMIN`, `SUPPLY_CHAIN_MANAGER`, `WAREHOUSE_MANAGER`, `ANALYST`), and organization-level data isolation.

---

## Default Demo Credentials

Log in with pre-seeded demo organization credentials:

- **Email**: `admin@novatech.com`
- **Password**: `Admin@12345`
- **Organization**: NovaTech Supply Solutions (`NOVATECH`)

---

## Tech Stack

### Backend
- **Java**: 21
- **Framework**: Spring Boot 3.3.3
- **Security**: Spring Security + JWT (Access & Refresh tokens) + BCrypt
- **Database**: MySQL 8.0 with Flyway migrations (`V1__initial_schema.sql`, `V2__seed_data.sql`)
- **Documentation**: Springdoc OpenAPI / Swagger UI
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18 / 19, Vite, TypeScript (Strict mode)
- **Styling**: Tailwind CSS (with Dark/Light mode theme switching)
- **State & Data**: Redux Toolkit, Axios with JWT refresh interceptors
- **Routing**: React Router DOM v6
- **Validation & Charts**: React Hook Form, Zod, Recharts, Lucide React Icons, date-fns

### DevOps
- **Containerization**: Docker Compose (`frontend`, `backend`, `mysql`)

---

## Directory Structure

```
chainmind-ai/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/chainmind/
│       │   │   ├── config/ (Spring Security, JWT, UserPrincipal)
│       │   │   ├── common/ (ApiResponse, GlobalExceptionHandler)
│       │   │   ├── auth/ (Authentication, JWT Tokens)
│       │   │   ├── organization/
│       │   │   ├── user/
│       │   │   ├── supplier/
│       │   │   ├── product/
│       │   │   ├── warehouse/
│       │   │   ├── inventory/ (Stock adjustments, Movements)
│       │   │   ├── purchase/ (PO workflow & Item Receiving)
│       │   │   ├── shipment/ (Tracking & Delay Risk Scoring Engine)
│       │   │   ├── analytics/ (Demand forecasting, Health Score)
│       │   │   ├── ai/ (Gemini/OpenAI abstraction & Assistant)
│       │   │   ├── notification/
│       │   │   └── audit/
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/ (Flyway schema & seed scripts)
│       └── test/
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── app/ (Redux store)
        ├── components/ (Layout, Modals, Status Badges, Pagination, Skeletons)
        ├── pages/ (Dashboard, Suppliers, Products, Warehouses, Inventory, POs, Shipments, Analytics, AI)
        ├── services/ (Axios client & API abstractions)
        └── types/ (TypeScript definitions)
```

---

## Running with Docker Compose (Recommended)

To launch the complete application stack (MySQL 8, Spring Boot backend, React frontend):

```bash
# Clone the repository and navigate into directory
cd chainmind-ai

# Start all services
docker compose up --build
```

Access the applications:
- **Frontend App**: `http://localhost:5173` (or `http://localhost:80`)
- **Backend REST API**: `http://localhost:8080/api`
- **Swagger API Docs**: `http://localhost:8080/swagger-ui.html`

To stop and remove containers:
```bash
docker compose down
```

To remove database volumes:
```bash
docker compose down -v
```

---

## Local Development Setup

### Backend Setup
1. Ensure Java 21 is installed.
2. Start MySQL database or run MySQL container:
   ```bash
   docker run -d --name chainmind-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=chainmind_db mysql:8.0
   ```
3. Navigate to backend directory and run Spring Boot:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in browser.

---

## AI Configuration (Optional)

ChainMind AI features a provider abstraction supporting **Google Gemini API** or **OpenAI-compatible APIs**.

Set environment variables in `.env` or system environment:

```env
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
```

> **Note**: If `AI_API_KEY` is omitted, the application operates in deterministic rule-based calculation mode and will not throw errors or crash.

---

## License & Copyright

© 2026 ChainMind AI Systems. Built for enterprise supply chain intelligence.
