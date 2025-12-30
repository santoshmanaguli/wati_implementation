# Invoice Management System

A full-stack invoice management application with public URL sharing for customers.

## Features

- Customer Management (CRUD operations)
- Invoice Generation with PDF export
- Public invoice URLs for easy sharing
- PDF download functionality
- Modern React frontend with Tailwind CSS and dark mode
- RESTful API backend with Express.js
- Type-safe database with Prisma ORM (PostgreSQL)

## Technology Stack

### Backend
- Node.js with Express.js
- TypeScript
- Prisma ORM with PostgreSQL
- PDFKit for invoice PDF generation

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS with dark mode
- React Router

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (for production)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

Initialize the database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Database Setup

For development (SQLite):
- The database file will be created automatically at `backend/prisma/dev.db`

For production (PostgreSQL):
- Update `backend/prisma/schema.prisma` to use `postgresql` provider
- Set `DATABASE_URL` to your PostgreSQL connection string

## Project Structure

```
wati_implementation/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── app.ts           # Express app setup
│   │   └── index.ts        # Server entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── services/       # API client
│   │   ├── contexts/       # React contexts (theme)
│   │   ├── components/     # React components
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## API Endpoints

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices` - Create invoice

### Public
- `GET /api/public/invoices/:token` - Get invoice by public token (no auth required)

## Usage

1. **Create a Customer**: Navigate to Customers → Add Customer
   - Enter customer details including WhatsApp number (with country code)

2. **Create an Invoice**: Navigate to Invoices → Create Invoice
   - Select a customer
   - Add invoice items (description, quantity, price)
   - Click "Create Invoice"
   - The system will:
     - Generate the invoice
     - Create a PDF
     - Generate a public URL for sharing

3. **View Invoice**: Click on any invoice to view details and download PDF

4. **Share Invoice**: Copy the public URL from invoice details and share with customers
   - Customers can access the invoice without login
   - Public URL format: `{FRONTEND_URL}/public/invoices/{token}`

## Development

### Backend
```bash
cd backend
npm run dev        # Start development server
npm run build      # Build for production
npm run prisma:studio  # Open Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
```

## Environment Variables

### Required
- `DATABASE_URL` - Database connection string (SQLite for dev, PostgreSQL for production)

### Optional
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `BASE_URL` - Backend base URL
- `FRONTEND_URL` - Frontend base URL (for public invoice links)

## DevOps & CI/CD

### CI/CD Pipeline

This project includes automated CI/CD pipelines using GitHub Actions:

- **CI Pipeline** (`.github/workflows/ci-cd.yml`): Runs on every push/PR
  - Builds backend and frontend
  - Runs tests
  - Lints code
  
- **CD Pipeline** (`.github/workflows/deploy-railway.yml`): Auto-deploys to Railway on main branch

- **Security Scanning** (`.github/workflows/security.yml`): Automated security checks
  - Dependency vulnerability scanning
  - CodeQL analysis
  - Docker image scanning

- **Test Automation** (`.github/workflows/test.yml`): Automated testing with coverage

- **Dependabot** (`.github/dependabot.yml`): Auto-updates dependencies

### Docker & Containerization

- **Docker Compose** (`docker-compose.yml`): Local development environment
  ```bash
  docker-compose up          # Start all services
  docker-compose down        # Stop all services
  ```

- **Dockerfile**: Production-ready containerization
- **Health Endpoints**: `/health`, `/ready`, `/metrics` for monitoring

### Deployment

#### Railway Deployment

1. Push code to GitHub
2. Create Railway project and deploy from GitHub
3. Set Root Directory to `backend`
4. Set Builder to `Dockerfile`
5. Add PostgreSQL database
6. Configure environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `BASE_URL` (Railway provides this)
   - `FRONTEND_URL` (your frontend URL)
7. Add `RAILWAY_TOKEN` to GitHub Secrets for auto-deployment

#### Stopping Railway Services

- **Backend**: Railway Dashboard → Service → Settings → Delete Service
- **Database**: Railway Dashboard → PostgreSQL → Settings → Delete Service
- **Note**: Deleting services removes all data

### Monitoring

- Health check: `GET /health`
- Readiness check: `GET /ready` (for Kubernetes)
- Metrics: `GET /metrics` (system metrics)

## Troubleshooting

1. **Database Issues**: Run `npm run prisma:migrate` to reset database
2. **PDF Generation**: Ensure `uploads/invoices` directory has write permissions
3. **Public URLs Not Working**: Verify `FRONTEND_URL` is set correctly in environment variables
4. **CORS Errors**: Check that `FRONTEND_URL` in backend matches your frontend domain

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
