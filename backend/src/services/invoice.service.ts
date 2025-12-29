import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface CreateInvoiceInput {
  customerId: string;
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
}

export class InvoiceService {
  async createInvoice(input: CreateInvoiceInput) {
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const publicToken = crypto.randomBytes(32).toString('hex');

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        totalAmount,
        publicToken,
        items: {
          create: input.items,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    const pdfPath = await this.generatePDF(invoice);
    
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfPath },
    });

    const port = process.env.PORT || '3000';
    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:5173`;
    const backendUrl = process.env.BASE_URL || `http://localhost:${port}`;
    const publicUrl = `${frontendUrl}/public/invoices/${publicToken}`;
    const pdfUrl = `${backendUrl}/api/invoices/${invoice.id}/pdf`;

    return {
      ...invoice,
      pdfPath,
      publicUrl,
      pdfUrl,
    };
  }

  async getInvoice(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async getInvoiceByPublicToken(publicToken: string) {
    return prisma.invoice.findUnique({
      where: { publicToken },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async listInvoices() {
    return prisma.invoice.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generatePDF(invoice: any): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const pdfPath = path.join(uploadsDir, `${invoice.invoiceNumber}.pdf`);
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.text('Bill To:', { underline: true });
    doc.text(`Name: ${invoice.customer.name}`);
    if (invoice.customer.email) {
      doc.text(`Email: ${invoice.customer.email}`);
    }
    if (invoice.customer.phone) {
      doc.text(`Phone: ${invoice.customer.phone}`);
    }
    doc.moveDown();

    doc.text('Items:', { underline: true });
    doc.moveDown(0.5);

    let yPosition = doc.y;
    doc.text('Description', 50, yPosition);
    doc.text('Qty', 300, yPosition);
    doc.text('Price', 350, yPosition);
    doc.text('Total', 450, yPosition);
    
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    invoice.items.forEach((item: any) => {
      doc.text(item.description, 50, yPosition);
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(`₹${item.price.toFixed(2)}`, 350, yPosition);
      doc.text(`₹${(item.quantity * item.price).toFixed(2)}`, 450, yPosition);
      yPosition += 25;
    });

    yPosition += 10;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 20;

    doc.fontSize(14).text(`Total Amount: ₹${invoice.totalAmount.toFixed(2)}`, 350, yPosition, {
      align: 'right',
    });

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(pdfPath));
      doc.on('error', reject);
    });
  }
}

export const invoiceService = new InvoiceService();

