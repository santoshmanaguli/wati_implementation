import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceApi, Invoice } from '../services/api';

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await invoiceApi.get(id!);
      setInvoice(response.data);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;

    try {
      const response = await invoiceApi.getPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.invoiceNumber || 'invoice'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!invoice) {
    return <div className="text-center py-12">Invoice not found</div>;
  }

  return (
    <div className="px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Download PDF
          </button>
          <Link
            to="/invoices"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back to Invoices
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice Number</h3>
            <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Date</h3>
            <p className="text-lg">{new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
          <p className="font-semibold">{invoice.customer.name}</p>
          {invoice.customer.email && <p className="text-gray-600">{invoice.customer.email}</p>}
          {invoice.customer.phone && <p className="text-gray-600">{invoice.customer.phone}</p>}
          <p className="text-gray-600">WhatsApp: {invoice.customer.whatsappNumber}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Items</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3">₹{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold">₹{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {invoice.watiMessages && invoice.watiMessages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Message Status</h3>
          {invoice.watiMessages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    message.status === 'sent' || message.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : message.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {message.status}
                </span>
              </div>
              {message.sentAt && (
                <div className="text-sm text-gray-600">
                  Sent at: {new Date(message.sentAt).toLocaleString()}
                </div>
              )}
              {message.deliveredAt && (
                <div className="text-sm text-gray-600">
                  Delivered at: {new Date(message.deliveredAt).toLocaleString()}
                </div>
              )}
              {message.error && (
                <div className="text-sm text-red-600">Error: {message.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



