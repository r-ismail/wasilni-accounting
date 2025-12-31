import React, { useState } from 'react';
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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import api from '../lib/api';
import { exportMultipleSheets } from '../utils/export';
import { generateReportHtml } from '../utils/report-print.helper';

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

interface RevenueReport {
  totalInvoiced: number;
  totalPaid: number;
  totalUnpaid: number;
  monthly: { year: number; month: number; invoiced: number; paid: number }[];
}

interface CustomerReport {
  _id: string;
  name: string;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  invoiceCount: number;
}

interface UnitReport {
  _id: string;
  unitNumber: string;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  invoiceCount: number;
}

interface OccupancyReport {
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  activeContracts: number;
  perBuilding: {
    buildingId: string;
    buildingName: string;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
  }[];
}

interface OverdueReport {
  overdueCount: number;
  overdueAmount: number;
  topOverdue: {
    id: string;
    invoiceNumber: string;
    dueDate: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    customerName?: string;
    unitNumber?: string;
  }[];
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const formatCurrencyEn = (value?: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
  const formatDateEn = (value: string | Date) => new Date(value).toLocaleDateString('en-GB');

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

  const revenueQuery = useQuery<RevenueReport>({
    queryKey: ['reports', 'revenue', fromDate, toDate],
    queryFn: async () => {
      const response = await api.get('/reports/revenue', {
        params: {
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      });
      return response.data.data;
    },
  });

  const occupancyQuery = useQuery<OccupancyReport>({
    queryKey: ['reports', 'occupancy'],
    queryFn: async () => {
      const response = await api.get('/reports/occupancy');
      return response.data.data;
    },
  });

  const overdueQuery = useQuery<OverdueReport>({
    queryKey: ['reports', 'overdue'],
    queryFn: async () => {
      const response = await api.get('/reports/overdue');
      return response.data.data;
    },
  });

  const customersQuery = useQuery<CustomerReport[]>({
    queryKey: ['reports', 'customers'],
    queryFn: async () => (await api.get('/reports/customers')).data.data,
  });

  const unitsQuery = useQuery<UnitReport[]>({
    queryKey: ['reports', 'units'],
    queryFn: async () => (await api.get('/reports/units')).data.data,
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateReportHtml(
      {
        stats: stats || undefined,
        revenue: revenueQuery.data,
        occupancy: occupancyQuery.data,
        overdue: overdueQuery.data,
        customers: customersQuery.data,
        units: unitsQuery.data,
        fromDate,
        toDate,
      },
      t,
      formatCurrencyEn,
    );

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const generatedAt = new Date().toISOString();
      const dateRange = fromDate || toDate ? `${fromDate || '-'} → ${toDate || '-'}` : t('reports.allTime');
      const sheets = [
        {
          name: t('reports.exportOverview'),
          data: [
            { Metric: t('reports.reportName'), Value: t('reports.title') },
            { Metric: t('reports.generatedAt'), Value: generatedAt },
            { Metric: t('reports.dateRange'), Value: dateRange },
            { Metric: t('dashboard.totalUnits'), Value: stats?.totalUnits || 0 },
            { Metric: t('dashboard.available'), Value: stats?.availableUnits || 0 },
            { Metric: t('dashboard.occupied'), Value: stats?.occupiedUnits || 0 },
            { Metric: t('dashboard.totalCustomers'), Value: stats?.totalCustomers || 0 },
            { Metric: t('dashboard.activeContracts'), Value: stats?.activeContracts || 0 },
            { Metric: t('dashboard.totalInvoices'), Value: stats?.totalInvoices || 0 },
            { Metric: t('dashboard.totalRevenue'), Value: stats?.totalRevenue || 0 },
            { Metric: t('dashboard.paid'), Value: stats?.totalPaid || 0 },
            { Metric: t('dashboard.unpaidAmount'), Value: stats?.totalUnpaid || 0 },
          ],
        },
        {
          name: t('reports.summary'),
          data: [
            { Metric: t('reports.totalInvoiced'), Value: formatCurrencyEn(revenueQuery.data?.totalInvoiced) },
            { Metric: t('reports.totalPaid'), Value: formatCurrencyEn(revenueQuery.data?.totalPaid) },
            { Metric: t('reports.totalUnpaid'), Value: formatCurrencyEn(revenueQuery.data?.totalUnpaid) },
            { Metric: t('reports.occupancyRate'), Value: (occupancyQuery.data?.occupancyRate || 0).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1 }) },
            { Metric: t('reports.overdueCount'), Value: overdueQuery.data?.overdueCount || 0 },
            { Metric: t('reports.overdueAmount'), Value: formatCurrencyEn(overdueQuery.data?.overdueAmount) },
          ],
        },
        {
          name: t('reports.revenue'),
          data: revenueQuery.data?.monthly?.map(m => ({
            [t('reports.year')]: m.year,
            [t('reports.month')]: m.month,
            [t('reports.invoiced')]: m.invoiced,
            [t('reports.paid')]: m.paid,
          })) || [],
        },
        {
          name: t('reports.customers'),
          data: customersQuery.data?.map(c => ({
            [t('reports.customer')]: c.name,
            [t('reports.totalBilled')]: c.totalInvoiced,
            [t('reports.totalPaid')]: c.totalPaid,
            [t('reports.balance')]: c.balance,
            [t('reports.invoices')]: c.invoiceCount,
          })) || [],
        },
        {
          name: t('reports.units'),
          data: unitsQuery.data?.map(u => ({
            [t('reports.unit')]: u.unitNumber,
            [t('reports.totalBilled')]: u.totalInvoiced,
            [t('reports.totalPaid')]: u.totalPaid,
            [t('reports.balance')]: u.balance,
            [t('reports.invoices')]: u.invoiceCount,
          })) || [],
        },
        {
          name: t('reports.occupancy'),
          data: occupancyQuery.data?.perBuilding?.map(b => ({
            [t('reports.building')]: b.buildingName,
            [t('reports.units')]: b.totalUnits,
            [t('reports.occupied')]: b.occupiedUnits,
            [t('reports.occupancyRate')]: b.occupancyRate,
          })) || [],
        },
        {
          name: t('reports.overdue'),
          data: overdueQuery.data?.topOverdue?.map(o => ({
            [t('reports.invoiceNumber')]: o.invoiceNumber,
            [t('reports.customer')]: o.customerName,
            [t('reports.unit')]: o.unitNumber,
            [t('reports.dueDate')]: formatDateEn(o.dueDate),
            [t('reports.remaining')]: o.remainingAmount,
          })) || [],
        },
      ];

      exportMultipleSheets(sheets, `Reports_${new Date().toISOString().split('T')[0]}`);
    } finally {
      setIsExporting(false);
    }
  };

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

  const reportsLoading =
    revenueQuery.isLoading ||
    occupancyQuery.isLoading ||
    overdueQuery.isLoading ||
    customersQuery.isLoading ||
    unitsQuery.isLoading;

  const statCards = [
    {
      title: t('dashboard.totalUnits'),
      value: stats?.totalUnits || 0,
      subtitle: `${stats?.availableUnits || 0} ${t('dashboard.available')} | ${stats?.occupiedUnits || 0} ${t('dashboard.occupied')}`,
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
      subtitle: `${stats?.paidInvoices || 0} ${t('dashboard.paid')} | ${stats?.unpaidInvoices || 0} ${t('dashboard.unpaid')}`,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
    },
    {
      title: t('dashboard.totalRevenue'),
      value: formatCurrencyEn(stats?.totalRevenue),
      subtitle: `${t('dashboard.paid')}: ${formatCurrencyEn(stats?.totalPaid)}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe',
    },
    {
      title: t('dashboard.overdueInvoices'),
      value: stats?.overdueInvoices || 0,
      subtitle: `${t('dashboard.unpaidAmount')}: ${formatCurrencyEn(stats?.totalUnpaid)}`,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          '@media print': { display: 'none' },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.subtitle')}
          </Typography>
        </Box>
        <Paper sx={{ p: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ minWidth: 120 }}>
                {t('common.print')}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={isExporting || reportsLoading}
                sx={{ minWidth: 140 }}
              >
                {isExporting ? t('common.exporting') : t('common.exportExcel')}
              </Button>
            </Box>
            <TextField
              label={t('reports.fromDate')}
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t('reports.toDate')}
              type="date"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 2,
                  borderColor: 'transparent',
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

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('reports.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('reports.subtitle')}
        </Typography>

        {reportsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t('reports.totalInvoiced')}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrencyEn(revenueQuery.data?.totalInvoiced)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('reports.totalPaid')}: {formatCurrencyEn(revenueQuery.data?.totalPaid)}
                    </Typography>
                    <Chip
                      label={`${t('reports.totalUnpaid')}: ${formatCurrencyEn(revenueQuery.data?.totalUnpaid)}`}
                      color="warning"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t('reports.occupancy')}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {(occupancyQuery.data?.occupancyRate || 0).toLocaleString(undefined, {
                        style: 'percent',
                        minimumFractionDigits: 1,
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('reports.occupiedUnits', {
                        occupied: occupancyQuery.data?.occupiedUnits || 0,
                        total: occupancyQuery.data?.totalUnits || 0,
                      })}
                    </Typography>
                    <Chip
                      label={`${t('reports.activeContracts')}: ${occupancyQuery.data?.activeContracts || 0}`}
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t('reports.overdue')}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {overdueQuery.data?.overdueCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('reports.overdueAmount')}: {formatCurrencyEn(overdueQuery.data?.overdueAmount)}
                  </Typography>
                    <Chip label={t('reports.overdueLabel')} color="error" size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('reports.monthlyBreakdown')}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('reports.month')}</TableCell>
                            <TableCell>{t('reports.invoiced')}</TableCell>
                            <TableCell>{t('reports.paid')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {revenueQuery.data?.monthly?.length ? (
                            revenueQuery.data.monthly.map((row) => (
                              <TableRow key={`${row.year}-${row.month}`}>
                                <TableCell>{`${row.year}-${String(row.month).padStart(2, '0')}`}</TableCell>
                                <TableCell>{formatCurrencyEn(row.invoiced)}</TableCell>
                                <TableCell>{formatCurrencyEn(row.paid)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3}>{t('reports.noData')}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('reports.occupancyByBuilding')}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('reports.building')}</TableCell>
                            <TableCell>{t('reports.units')}</TableCell>
                            <TableCell>{t('reports.occupied')}</TableCell>
                            <TableCell>{t('reports.occupancyRate')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {occupancyQuery.data?.perBuilding?.length ? (
                            occupancyQuery.data.perBuilding.map((row) => (
                              <TableRow key={row.buildingId || row.buildingName}>
                                <TableCell>{row.buildingName}</TableCell>
                                <TableCell>{row.totalUnits}</TableCell>
                                <TableCell>{row.occupiedUnits}</TableCell>
                                <TableCell>
                                  {(row.occupancyRate || 0).toLocaleString(undefined, {
                                    style: 'percent',
                                    minimumFractionDigits: 1,
                                  })}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4}>{t('reports.noData')}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('reports.customers')}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('reports.customer')}</TableCell>
                            <TableCell>{t('reports.totalBilled')}</TableCell>
                            <TableCell>{t('reports.balance')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {customersQuery.data?.length ? (
                          customersQuery.data.slice(0, 10).map((row) => (
                            <TableRow key={row._id}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{formatCurrencyEn(row.totalInvoiced)}</TableCell>
                              <TableCell sx={{ color: row.balance > 0 ? 'error.main' : 'inherit', fontWeight: 'bold' }}>
                                {formatCurrencyEn(row.balance)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3}>{t('reports.noData')}</TableCell>
                          </TableRow>
                        )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('reports.units')}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('reports.unit')}</TableCell>
                            <TableCell>{t('reports.totalBilled')}</TableCell>
                            <TableCell>{t('reports.balance')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {unitsQuery.data?.length ? (
                          unitsQuery.data.slice(0, 10).map((row) => (
                            <TableRow key={row._id}>
                              <TableCell>{row.unitNumber}</TableCell>
                              <TableCell>{formatCurrencyEn(row.totalInvoiced)}</TableCell>
                              <TableCell sx={{ color: row.balance > 0 ? 'error.main' : 'inherit', fontWeight: 'bold' }}>
                                {formatCurrencyEn(row.balance)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3}>{t('reports.noData')}</TableCell>
                          </TableRow>
                        )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('reports.topOverdue')}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('reports.invoiceNumber')}</TableCell>
                        <TableCell>{t('reports.customer')}</TableCell>
                        <TableCell>{t('reports.unit')}</TableCell>
                        <TableCell>{t('reports.dueDate')}</TableCell>
                        <TableCell>{t('reports.remaining')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {overdueQuery.data?.topOverdue?.length ? (
                        overdueQuery.data.topOverdue.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.invoiceNumber}</TableCell>
                            <TableCell>{row.customerName || '-'}</TableCell>
                            <TableCell>{row.unitNumber || '-'}</TableCell>
                            <TableCell>{formatDateEn(row.dueDate)}</TableCell>
                            <TableCell>{formatCurrencyEn(row.remainingAmount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5}>{t('reports.noData')}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
