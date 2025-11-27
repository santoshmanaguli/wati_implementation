import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center px-4 text-xl font-bold text-blue-600">
                  WATI Invoice System
                </Link>
                <div className="flex space-x-4 ml-8">
                  <Link
                    to="/"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/customers"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Customers
                  </Link>
                  <Link
                    to="/invoices"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Invoices
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;



