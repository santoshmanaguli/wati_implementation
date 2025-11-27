# WATI Integration - Invoice Management System

A full-stack application that integrates with WATI (WhatsApp API) to automatically send WhatsApp template messages to customers when invoices are generated.

## Features

- Customer Management (CRUD operations)
- Invoice Generation with PDF export
- Automatic WhatsApp notifications via WATI API
- Message delivery status tracking
- Modern React frontend with Tailwind CSS
- RESTful API backend with Express.js
- Type-safe database with Prisma ORM

## Technology Stack

### Backend
- Node.js with Express.js
- TypeScript
- Prisma ORM with SQLite
- PDFKit for invoice PDF generation
- Axios for WATI API integration

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- React Router

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- WATI API account and credentials

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
WATI_API_ENDPOINT=https://live-mt-server.wati.io/472997/api/v1
WATI_API_TOKEN=your_api_token_here
WATI_WHATSAPP_NUMBER=your_whatsapp_number
WATI_CHANNEL_PHONE_NUMBER=your_channel_phone_number
WATI_INVOICE_TEMPLATE_NAME=invoice_notification
WATI_TEST_PDF_URL=https://example.com/test.pdf
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

### 3. WATI Configuration

1. Sign up for a WATI account at [https://wati.io](https://wati.io)
2. Get your API token from the WATI dashboard
3. Configure your WhatsApp Business number
4. Create a template message in WATI dashboard (see Template Setup below)
5. Update the `.env` file with your credentials

## Template Setup

Create a template message in WATI dashboard with the following structure:

**Template Name:** `invoice_notification`

**Header (Document):**
- Type: Document
- Variable: `{{url}}` (for PDF URL)

**Body:**
```
Hello {{name}}!

Your invoice has been generated:
Invoice Number: {{invoice}}
Total Amount: {{amount}}

Thank you for your business!
```

**Parameters:**
- `{{url}}` - PDF URL (for header/document)
- `{{name}}` - Customer Name
- `{{invoice}}` - Invoice Number
- `{{amount}}` - Total Amount

After creating the template, submit it for approval. Once approved, update `WATI_INVOICE_TEMPLATE_NAME` in your `.env` file.

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
- `POST /api/invoices` - Create invoice (triggers WhatsApp)

### WATI
- `POST /api/wati/webhook` - Receive delivery status updates

### Test
- `GET /api/test/templates` - Get available WATI templates
- `POST /api/test/test-template` - Test template message sending

## Usage

1. **Create a Customer**: Navigate to Customers → Add Customer
   - Enter customer details including WhatsApp number (with country code)

2. **Create an Invoice**: Navigate to Invoices → Create Invoice
   - Select a customer
   - Add invoice items (description, quantity, price)
   - Click "Create Invoice & Send WhatsApp"
   - The system will:
     - Generate the invoice
     - Create a PDF
     - Send WhatsApp template message to customer
     - Track message status

3. **View Invoice**: Click on any invoice to view details and download PDF

4. **Check WhatsApp Status**: View message delivery status in invoice details

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
- `DATABASE_URL` - Database connection string
- `WATI_API_ENDPOINT` - WATI API endpoint URL
- `WATI_API_TOKEN` - WATI API authentication token
- `WATI_WHATSAPP_NUMBER` - WhatsApp number for sending messages
- `WATI_CHANNEL_PHONE_NUMBER` - Channel phone number

### Optional
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)
- `BASE_URL` - Base URL for PDF generation
- `WATI_INVOICE_TEMPLATE_NAME` - Template name for invoice notifications
- `WATI_TEST_PDF_URL` - Test PDF URL (for development)

## Troubleshooting

1. **WATI API Errors**: Check your API token and endpoint URL in `.env`
2. **Database Issues**: Run `npm run prisma:migrate` to reset database
3. **PDF Generation**: Ensure `uploads/invoices` directory has write permissions
4. **Template Not Found**: Verify template name matches `WATI_INVOICE_TEMPLATE_NAME` and template is approved
5. **PDF URL Issues**: For localhost development, use `WATI_TEST_PDF_URL` with a publicly accessible PDF URL

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
