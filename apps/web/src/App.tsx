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
import SetupCheck from './components/SetupCheck';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Units from './pages/Units';
import Contracts from './pages/Contracts';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Meters from './pages/Meters';
import MeterReadings from './pages/MeterReadings';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import SetupWizard from './pages/Setup/SetupWizard';
import Vendors from './pages/Vendors';
import Expenses from './pages/Expenses';

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
                path="/setup"
                element={
                  <ProtectedRoute>
                    <SetupCheck>
                      <SetupWizard />
                    </SetupCheck>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <SetupCheck>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/units" element={<Units />} />
                          <Route path="/contracts" element={<Contracts />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/payments" element={<Payments />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/vendors" element={<Vendors />} />
                          <Route path="/expenses" element={<Expenses />} />
                          <Route path="/meters" element={<Meters />} />
                          <Route path="/readings" element={<MeterReadings />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Layout>
                    </SetupCheck>
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
