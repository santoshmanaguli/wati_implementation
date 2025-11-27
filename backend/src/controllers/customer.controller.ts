import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().min(10),
});

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().min(10).optional(),
});

const customerController = {
  async create(req: Request, res: Response) {
    try {
      const data = createCustomerSchema.parse(req.body);
      const customer = await customerService.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Failed to create customer' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomer(id);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get customer' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const customers = await customerService.listCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list customers' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateCustomerSchema.parse(req.body);
      const customer = await customerService.updateCustomer(id, data);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Failed to update customer' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete customer' });
    }
  },
};

export { customerController };
