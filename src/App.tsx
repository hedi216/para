import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from './components/RequireRole';
import { AuthProvider } from './contexts/auth-context';
import { CartProvider } from './contexts/cart-context';
import { PublicLayout } from './components/PublicLayout';
import AccountPage from './pages/AccountPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminStockPage from './pages/AdminStockPage';
import CartPage from './pages/CartPage';
import CataloguePage from './pages/CataloguePage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import PosCustomersPage from './pages/PosCustomersPage';
import PosInvoicesPage from './pages/PosInvoicesPage';
import PosOrdersPage from './pages/PosOrdersPage';
import PosPage from './pages/PosPage';
import PosStockPage from './pages/PosStockPage';
import ProductPage from './pages/ProductPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="catalogue" element={<CataloguePage />} />
              <Route path="produit/:id" element={<ProductPage />} />
              <Route path="panier" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="compte" element={<AccountPage />} />
            </Route>
            <Route path="admin" element={<RequireRole roles={['ADMIN']}><AdminDashboardPage /></RequireRole>} />
            <Route path="admin/produits" element={<RequireRole roles={['ADMIN']}><AdminProductsPage /></RequireRole>} />
            <Route path="admin/stock" element={<RequireRole roles={['ADMIN']}><AdminStockPage /></RequireRole>} />
            <Route path="admin/commandes" element={<RequireRole roles={['ADMIN']}><AdminOrdersPage /></RequireRole>} />
            <Route path="admin/clients" element={<RequireRole roles={['ADMIN']}><AdminClientsPage /></RequireRole>} />
            <Route path="pos" element={<RequireRole roles={['EMPLOYEE', 'ADMIN']}><PosPage /></RequireRole>} />
            <Route path="pos/orders" element={<RequireRole roles={['EMPLOYEE', 'ADMIN']}><PosOrdersPage /></RequireRole>} />
            <Route path="pos/stock" element={<RequireRole roles={['EMPLOYEE', 'ADMIN']}><PosStockPage /></RequireRole>} />
            <Route path="pos/customers" element={<RequireRole roles={['EMPLOYEE', 'ADMIN']}><PosCustomersPage /></RequireRole>} />
            <Route path="pos/invoices" element={<RequireRole roles={['EMPLOYEE', 'ADMIN']}><PosInvoicesPage /></RequireRole>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
