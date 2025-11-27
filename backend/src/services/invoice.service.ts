import { PrismaClient } from '@prisma/client';
import { watiService } from './wati.service';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

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

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        totalAmount,
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
    const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
    const testPdfUrl = process.env.WATI_TEST_PDF_URL;
    const pdfUrl = testPdfUrl || `${baseUrl}/api/invoices/${invoice.id}/pdf`;
    
    if (baseUrl.includes('localhost') && !testPdfUrl) {
      console.warn('WARNING: Using localhost URL. WATI cannot access localhost URLs. Set WATI_TEST_PDF_URL in .env or use ngrok for public URL.');
    }
    
    const watiMessage = await watiService.sendInvoiceNotification(
      invoice.customer.whatsappNumber,
      {
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.name,
        totalAmount: invoice.totalAmount,
        pdfUrl,
      }
    );

    await prisma.wATIMessage.create({
      data: {
        invoiceId: invoice.id,
        messageId: watiMessage.messageId || undefined,
        status: watiMessage.result ? 'sent' : 'failed',
        sentAt: watiMessage.result ? new Date() : undefined,
        error: watiMessage.error || undefined,
      },
    });

    return {
      ...invoice,
      pdfPath,
      messageStatus: {
        sent: watiMessage.result,
        messageId: watiMessage.messageId,
        error: watiMessage.error,
      },
    };
  }

  async getInvoice(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        watiMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async listInvoices() {
    return prisma.invoice.findMany({
      include: {
        customer: true,
        items: true,
        watiMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
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

