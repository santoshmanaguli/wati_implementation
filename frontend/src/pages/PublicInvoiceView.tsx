import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Invoice } from '../services/api';

export default function PublicInvoiceView() {
  const { token } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInvoice();
    }
  }, [token]);

  const fetchInvoice = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await axios.get(`${apiUrl}/public/invoices/${token}`);
      setInvoice(response.data);
    } catch (err: any) {
      console.error('Failed to fetch invoice:', err);
      setError(err.response?.data?.error || 'Invoice not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice?.pdfUrl) return;

    try {
      window.open(invoice.pdfUrl, '_blank');
    } catch (error) {
      console.error('Failed to open PDF:', error);
      alert('Failed to open PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-900 dark:text-gray-100 text-lg">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg mb-4">Invoice Not Found</div>
          <p className="text-gray-600 dark:text-gray-400">
            {error || 'The invoice you are looking for does not exist or has been removed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">INVOICE</h1>
              <p className="text-gray-600 dark:text-gray-400">Thank you for your business!</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
            >
              Download PDF
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Invoice Number</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Date</h3>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bill To</h3>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{invoice.customer.name}</p>
            {invoice.customer.email && (
              <p className="text-gray-600 dark:text-gray-400">{invoice.customer.email}</p>
            )}
            {invoice.customer.phone && (
              <p className="text-gray-600 dark:text-gray-400">{invoice.customer.phone}</p>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Items</h3>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.description}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.quantity}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Total Amount:</span>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{invoice.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          This is a public invoice view. Share this page with anyone who needs to see the invoice details.
        </div>
      </div>
    </div>
  );
}

