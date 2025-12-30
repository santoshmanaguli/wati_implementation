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

  const handleCopyPublicUrl = () => {
    if (invoice?.publicUrl) {
      navigator.clipboard.writeText(invoice.publicUrl);
      alert('Public URL copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (!invoice) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Invoice not found</div>;
  }

  return (
    <div className="px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Invoice Details</h1>
        <div className="flex space-x-4">
          {invoice.publicUrl && (
            <button
              onClick={handleCopyPublicUrl}
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Copy Public URL
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
          >
            Download PDF
          </button>
          <Link
            to="/invoices"
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Invoices
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Invoice Number</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Date</h3>
            <p className="text-lg text-gray-900 dark:text-gray-100">{new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bill To</h3>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{invoice.customer.name}</p>
          {invoice.customer.email && <p className="text-gray-600 dark:text-gray-400">{invoice.customer.email}</p>}
          {invoice.customer.phone && <p className="text-gray-600 dark:text-gray-400">{invoice.customer.phone}</p>}
          <p className="text-gray-600 dark:text-gray-400">WhatsApp: {invoice.customer.whatsappNumber}</p>
        </div>

        {invoice.publicUrl && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Public Invoice URL</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={invoice.publicUrl}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleCopyPublicUrl}
                className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
              Share this URL with your customer to allow them to view the invoice online.
            </p>
          </div>
        )}

        <div className="mb-6">
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
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">₹{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Amount:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}



