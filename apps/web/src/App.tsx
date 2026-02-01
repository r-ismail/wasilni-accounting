import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { getTheme } from './theme/theme';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Units from './pages/Units';
import Contracts from './pages/Contracts';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import ContractPrint from './pages/ContractPrint';
import Users from './pages/Users';
import Meters from './pages/Meters';
import MeterReadings from './pages/MeterReadings';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Vendors from './pages/Vendors';
import Expenses from './pages/Expenses';
import CompaniesAdmin from './pages/admin/CompaniesAdmin';
import Onboarding from './pages/admin/Onboarding';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const theme = getTheme(i18n.language);

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <BrowserRouter>
            <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/units" element={<Units />} />
                        <Route path="/contracts" element={<Contracts />} />
                        <Route path="/contracts/:id/print" element={<ContractPrint />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/customers/:id" element={<CustomerProfile />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/vendors" element={<Vendors />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/meters" element={<Meters />} />
                        <Route path="/readings" element={<MeterReadings />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/admin/companies" element={<CompaniesAdmin />} />
                        <Route path="/admin/onboarding" element={<Onboarding />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            </AuthProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
