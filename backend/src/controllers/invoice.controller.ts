import { Request, Response } from 'express';
import { invoiceService } from '../services/invoice.service';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const createInvoiceSchema = z.object({
  customerId: z.string(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1),
});

const invoiceController = {
  async create(req: Request, res: Response) {
    try {
      const data = createInvoiceSchema.parse(req.body);
      const invoice = await invoiceService.createInvoice(data);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      console.error('Invoice creation error:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getInvoice(id);
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      const port = process.env.PORT || '3000';
      const backendUrl = process.env.BASE_URL || `http://localhost:${port}`;
      // Public URL points to backend API endpoint (works without frontend)
      const publicUrl = invoice.publicToken ? `${backendUrl}/api/public/invoices/${invoice.publicToken}` : null;
      const pdfUrl = `${backendUrl}/api/invoices/${invoice.id}/pdf`;

      res.json({
        ...invoice,
        publicUrl,
        pdfUrl,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get invoice' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const invoices = await invoiceService.listInvoices();
      const port = process.env.PORT || '3000';
      const backendUrl = process.env.BASE_URL || `http://localhost:${port}`;
      
      const invoicesWithUrls = invoices.map((invoice) => ({
        ...invoice,
        // Public URL points to backend API endpoint (works without frontend)
        publicUrl: invoice.publicToken ? `${backendUrl}/api/public/invoices/${invoice.publicToken}` : null,
        pdfUrl: `${backendUrl}/api/invoices/${invoice.id}/pdf`,
      }));

      res.json(invoicesWithUrls);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list invoices' });
    }
  },

  async getPDF(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getInvoice(id);
      
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
        res.status(404).json({ error: 'PDF not found' });
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
      fs.createReadStream(invoice.pdfPath).pipe(res);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get PDF' });
    }
  },

  async getByPublicToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const invoice = await invoiceService.getInvoiceByPublicToken(token);
      
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      const port = process.env.PORT || '3000';
      const backendUrl = process.env.BASE_URL || `http://localhost:${port}`;
      const pdfUrl = `${backendUrl}/api/invoices/${invoice.id}/pdf`;

      // Redirect to PDF instead of returning JSON
      res.redirect(pdfUrl);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get invoice' });
    }
  },
};

export { invoiceController };
