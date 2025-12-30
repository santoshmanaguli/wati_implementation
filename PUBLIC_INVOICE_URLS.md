# 📄 Public Invoice URLs - Quick Guide

## ✅ What's Ready

Your backend is deployed and ready to generate public invoice URLs! You can share these URLs with other developers or customers.

## 🚀 Quick Start

### Step 1: Get Your Backend URL

1. Go to Railway dashboard
2. Click on your `wati_implementation` service
3. Go to **Settings** → Find **"Public Domain"**
4. Copy the URL (e.g., `https://your-app.railway.app`)

### Step 2: Set BASE_URL (Important!)

1. In Railway → Your service → **Variables** tab
2. Add/Update: `BASE_URL` = Your Railway backend URL
3. This ensures public URLs are generated correctly

### Step 3: Create a Customer

```bash
curl -X POST https://your-backend-url.railway.app/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "whatsappNumber": "+1234567890"
  }'
```

**Response:**
```json
{
  "id": "customer-id-here",
  "name": "John Doe",
  ...
}
```

**Save the `id` - you'll need it for the next step!**

### Step 4: Create an Invoice

```bash
curl -X POST https://your-backend-url.railway.app/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-id-from-step-3",
    "items": [
      {
        "description": "Web Development Services",
        "quantity": 10,
        "price": 1500.00
      },
      {
        "description": "Design Services",
        "quantity": 5,
        "price": 800.00
      }
    ]
  }'
```

**Response:**
```json
{
  "id": "invoice-id",
  "invoiceNumber": "INV-1234567890-ABC123",
  "publicToken": "a1b2c3d4e5f6...",
  "publicUrl": "https://your-backend-url.railway.app/api/public/invoices/a1b2c3d4e5f6...",
  "pdfUrl": "https://your-backend-url.railway.app/api/invoices/invoice-id/pdf",
  "totalAmount": 19000.00,
  ...
}
```

### Step 5: Share the Public URL

You can share either:

**Option A: API Endpoint (JSON data)**
```
https://your-backend-url.railway.app/api/public/invoices/{publicToken}
```

**Option B: Direct PDF URL**
```
https://your-backend-url.railway.app/api/invoices/{invoice-id}/pdf
```

## 📋 Public API Endpoints

### Get Invoice by Public Token

```bash
GET https://your-backend-url.railway.app/api/public/invoices/{token}
```

**Response:**
```json
{
  "id": "invoice-id",
  "invoiceNumber": "INV-1234567890-ABC123",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 10,
      "price": 1500.00
    }
  ],
  "totalAmount": 19000.00,
  "pdfUrl": "https://your-backend-url.railway.app/api/invoices/invoice-id/pdf",
  "createdAt": "2025-12-29T..."
}
```

### Download PDF

```bash
GET https://your-backend-url.railway.app/api/invoices/{invoice-id}/pdf
```

This returns the PDF file directly (opens in browser or downloads).

## 🔗 Example URLs

Once you have your backend URL, here's what the URLs look like:

**Backend URL:** `https://wati-implementation-production.up.railway.app`

**Public Invoice API:**
```
https://wati-implementation-production.up.railway.app/api/public/invoices/a1b2c3d4e5f6...
```

**PDF Download:**
```
https://wati-implementation-production.up.railway.app/api/invoices/clx1234567890/pdf
```

## 📝 Complete Example Workflow

```bash
# 1. Create customer
CUSTOMER_RESPONSE=$(curl -X POST https://your-backend.railway.app/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"test@example.com","phone":"+1234567890","whatsappNumber":"+1234567890"}')

CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.id')

# 2. Create invoice
INVOICE_RESPONSE=$(curl -X POST https://your-backend.railway.app/api/invoices \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"items\":[{\"description\":\"Test Item\",\"quantity\":1,\"price\":100.00}]}")

# 3. Extract public URL
PUBLIC_URL=$(echo $INVOICE_RESPONSE | jq -r '.publicUrl')
echo "Public URL: $PUBLIC_URL"

# 4. Test public URL
curl $PUBLIC_URL
```

## 🎯 What to Share with Other Developers

Share these details:

1. **Backend Base URL:** `https://your-backend-url.railway.app`
2. **Public Invoice Endpoint:** `/api/public/invoices/{token}`
3. **PDF Endpoint:** `/api/invoices/{id}/pdf`
4. **Example:** Show them how to create an invoice and get the `publicToken`

## ⚠️ Important Notes

- **Public URLs don't require authentication** - anyone with the token can access
- **Tokens are unique and secure** - 64-character hex strings
- **PDFs are generated automatically** when invoices are created
- **BASE_URL must be set** in Railway for URLs to work correctly

## 🔍 Testing

Test your setup:

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 📚 Next Steps (Later)

When you're ready:
- Deploy frontend to show invoices in a nice UI
- Add authentication if needed
- Customize invoice PDF design
- Add email notifications

---

**That's it! You can now generate and share public invoice URLs! 🎉**

