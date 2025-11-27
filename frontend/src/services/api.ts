import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsappNumber: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  totalAmount: number;
  status: string;
  pdfPath?: string;
  items: InvoiceItem[];
  createdAt: string;
  watiMessages?: Array<{
    id: string;
    status: string;
    sentAt?: string;
    deliveredAt?: string;
    error?: string;
  }>;
}

export const customerApi = {
  list: () => api.get<Customer[]>('/customers'),
  get: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: Omit<Customer, 'id' | 'createdAt'>) => api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const invoiceApi = {
  list: () => api.get<Invoice[]>('/invoices'),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  create: (data: { customerId: string; items: Omit<InvoiceItem, 'id'>[] }) =>
    api.post<Invoice>('/invoices', data),
  getPDF: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export default api;



