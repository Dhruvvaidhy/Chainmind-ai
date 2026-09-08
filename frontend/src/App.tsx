import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Suppliers } from './pages/Suppliers';
import { Products } from './pages/Products';
import { Warehouses } from './pages/Warehouses';
import { InventoryPage } from './pages/Inventory';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { Shipments } from './pages/Shipments';
import { Analytics } from './pages/Analytics';
import { AiAssistantPage } from './pages/AiAssistant';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai-insights" element={<AiInsightsPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Role Restricted Routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN']} />}>
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
