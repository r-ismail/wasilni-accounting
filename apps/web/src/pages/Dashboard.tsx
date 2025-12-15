import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import api from '../lib/api';

interface Stats {
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  totalCustomers: number;
  activeContracts: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalUnpaid: number;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch all data in parallel
      const [unitsRes, customersRes, contractsRes, invoicesRes] = await Promise.all([
        api.get('/units').then(res => res.data),
        api.get('/customers').then(res => res.data),
        api.get('/contracts').then(res => res.data),
        api.get('/invoices').then(res => res.data),
        // api.get('/payments').then(res => res.data),
      ]);

      // Extract data arrays from API response format {success: true, data: [...]}
      const units = Array.isArray(unitsRes?.data) ? unitsRes.data : (Array.isArray(unitsRes) ? unitsRes : []);
      const customers = Array.isArray(customersRes?.data) ? customersRes.data : (Array.isArray(customersRes) ? customersRes : []);
      const contracts = Array.isArray(contractsRes?.data) ? contractsRes.data : (Array.isArray(contractsRes) ? contractsRes : []);
      const invoices = Array.isArray(invoicesRes?.data) ? invoicesRes.data : (Array.isArray(invoicesRes) ? invoicesRes : []);
      // const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []);

      // Calculate statistics
      const totalUnits = units.length;
      const availableUnits = units.filter((u: any) => u.status === 'available').length;
      const occupiedUnits = units.filter((u: any) => u.status === 'occupied').length;
      
      const totalCustomers = customers.length;
      const activeContracts = contracts.filter((c: any) => c.isActive).length;
      
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter((i: any) => i.status === 'paid').length;
      const unpaidInvoices = invoices.filter((i: any) => i.status !== 'paid').length;
      const overdueInvoices = invoices.filter((i: any) => {
        if (i.status === 'paid') return false;
        const dueDate = new Date(i.dueDate);
        return dueDate < new Date();
      }).length;

      const totalRevenue = invoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);
      const totalPaid = invoices.reduce((sum: number, i: any) => sum + (i.paidAmount || 0), 0);
      const totalUnpaid = totalRevenue - totalPaid;

      return {
        totalUnits,
        availableUnits,
        occupiedUnits,
        totalCustomers,
        activeContracts,
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        totalRevenue,
        totalPaid,
        totalUnpaid,
      };
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {t('common.error')}: {(error as Error).message}
      </Alert>
    );
  }

  const statCards = [
    {
      title: t('dashboard.totalUnits'),
      value: stats?.totalUnits || 0,
      subtitle: `${stats?.availableUnits || 0} ${t('dashboard.available')} • ${stats?.occupiedUnits || 0} ${t('dashboard.occupied')}`,
      icon: <ApartmentIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: t('dashboard.totalCustomers'),
      value: stats?.totalCustomers || 0,
      subtitle: t('dashboard.registeredCustomers'),
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: t('dashboard.activeContracts'),
      value: stats?.activeContracts || 0,
      subtitle: t('dashboard.currentlyActive'),
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
    {
      title: t('dashboard.totalInvoices'),
      value: stats?.totalInvoices || 0,
      subtitle: `${stats?.paidInvoices || 0} ${t('dashboard.paid')} • ${stats?.unpaidInvoices || 0} ${t('dashboard.unpaid')}`,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
    },
    {
      title: t('dashboard.totalRevenue'),
      value: (stats?.totalRevenue || 0).toLocaleString(),
      subtitle: `${t('dashboard.paid')}: ${(stats?.totalPaid || 0).toLocaleString()}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe',
    },
    {
      title: t('dashboard.overdueInvoices'),
      value: stats?.overdueInvoices || 0,
      subtitle: `${t('dashboard.unpaidAmount')}: ${(stats?.totalUnpaid || 0).toLocaleString()}`,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        {t('dashboard.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('dashboard.subtitle')}
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: card.bgColor,
                      color: card.color,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: card.color }}>
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
