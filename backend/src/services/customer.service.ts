import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  whatsappNumber: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
}

export class CustomerService {
  async createCustomer(input: CreateCustomerInput) {
    return prisma.customer.create({
      data: input,
    });
  }

  async getCustomer(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async listCustomers() {
    return prisma.customer.findMany({
      include: {
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCustomer(id: string, input: UpdateCustomerInput) {
    return prisma.customer.update({
      where: { id },
      data: input,
    });
  }

  async deleteCustomer(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  }
}

export const customerService = new CustomerService();
