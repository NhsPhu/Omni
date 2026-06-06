import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import OrderList from './pages/orders/OrderList';
import VoucherList from './pages/vouchers/VoucherList';
import Wallet from './pages/finance/Wallet';
import Reviews from './pages/reviews/Reviews';
import Analytics from './pages/analytics/Analytics';
import ShopSettings from './pages/settings/ShopSettings';
import FlashSaleRegister from './pages/flashsale/FlashSaleRegister';
import ChatInbox from './pages/chat/ChatInbox';
import Login from './pages/Login';

import SuperAdminLayout from './components/layout/SuperAdminLayout';
import Users from './pages/admin/Users';
import Vendors from './pages/admin/Vendors';
import Categories from './pages/admin/Categories';
import Disputes from './pages/admin/Disputes';
import PlatformVouchers from './pages/admin/PlatformVouchers';
import Withdrawals from './pages/admin/Withdrawals';
import Reports from './pages/admin/Reports';
import FlashSales from './pages/admin/FlashSales';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="vouchers" element={<VoucherList />} />
          <Route path="finance" element={<Wallet />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="flash-sale" element={<FlashSaleRegister />} />
          <Route path="chat" element={<ChatInbox />} />
          <Route path="settings" element={<ShopSettings />} />
        </Route>
        
        <Route path="/admin" element={<SuperAdminLayout />}>
          <Route index element={<Reports />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="categories" element={<Categories />} />
          <Route path="disputes" element={<Disputes />} />
          <Route path="vouchers" element={<PlatformVouchers />} />
          <Route path="flash-sale" element={<FlashSales />} />
          <Route path="withdrawals" element={<Withdrawals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
