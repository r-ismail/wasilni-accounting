import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

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

import { formatCurrency } from '../utils/format';
import { exportMultipleSheets } from '../utils/export';
import { generateReportHtml } from '../utils/report-print.helper';

export default function Reports() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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
        revenue: revenueQuery.data,
        occupancy: occupancyQuery.data,
        overdue: overdueQuery.data,
        customers: customersQuery.data,
        units: unitsQuery.data,
        fromDate,
        toDate,
      },
      t,
      formatCurrency
    );

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const sheets = [
        {
          name: 'Summary',
          data: [
            { Metric: t('reports.totalInvoiced'), Value: formatCurrency(revenueQuery.data?.totalInvoiced) },
            { Metric: t('reports.totalPaid'), Value: formatCurrency(revenueQuery.data?.totalPaid) },
            { Metric: t('reports.totalUnpaid'), Value: formatCurrency(revenueQuery.data?.totalUnpaid) },
            { Metric: t('reports.occupancyRate'), Value: (occupancyQuery.data?.occupancyRate || 0).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 }) },
            { Metric: t('reports.overdueCount'), Value: overdueQuery.data?.overdueCount || 0 },
            { Metric: t('reports.overdueAmount'), Value: formatCurrency(overdueQuery.data?.overdueAmount) },
          ]
        },
        {
          name: 'Revenue',
          data: revenueQuery.data?.monthly?.map(m => ({
             Year: m.year,
             Month: m.month,
             Invoiced: m.invoiced,
             Paid: m.paid
          })) || []
        },
        {
          name: 'Customer Level',
          data: customersQuery.data?.map(c => ({
            Customer: c.name,
            'Total Invoiced': c.totalInvoiced,
            'Total Paid': c.totalPaid,
            Balance: c.balance,
            'Invoice Count': c.invoiceCount
          })) || []
        },
        {
          name: 'Unit Level',
          data: unitsQuery.data?.map(u => ({
            Unit: u.unitNumber,
            'Total Invoiced': u.totalInvoiced,
            'Total Paid': u.totalPaid,
            Balance: u.balance,
            'Invoice Count': u.invoiceCount
          })) || []
        },
        {
          name: 'Occupancy',
          data: occupancyQuery.data?.perBuilding?.map(b => ({
            Building: b.buildingName,
            'Total Units': b.totalUnits,
            'Occupied': b.occupiedUnits,
            'Occupancy Rate': b.occupancyRate
          })) || []
        },
        {
          name: 'Overdue Invoices',
          data: overdueQuery.data?.topOverdue?.map(o => ({
            'Invoice #': o.invoiceNumber,
            'Customer': o.customerName,
            'Unit': o.unitNumber,
            'Due Date': new Date(o.dueDate).toLocaleDateString(),
            'Remaining Amount': o.remainingAmount
          })) || []
        }
      ];

      exportMultipleSheets(sheets, `Reports_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const loading = revenueQuery.isLoading || occupancyQuery.isLoading || overdueQuery.isLoading || customersQuery.isLoading || unitsQuery.isLoading;

  const monthLabel = (year: number, month: number) =>
    `${year}-${String(month).padStart(2, '0')}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('reports.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('reports.subtitle')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', '@media print': { display: 'none' } }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              {t('common.print')}
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={isExporting || loading}
            >
              {isExporting ? t('common.exporting') : t('common.exportExcel')}
            </Button>
          </Stack>
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
      </Box>

      {loading ? (
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
                    {formatCurrency(revenueQuery.data?.totalInvoiced)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('reports.totalPaid')}: {formatCurrency(revenueQuery.data?.totalPaid)}
                  </Typography>
                  <Chip
                    label={`${t('reports.totalUnpaid')}: ${formatCurrency(revenueQuery.data?.totalUnpaid)}`}
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
                    {t('reports.overdueAmount')}: {formatCurrency(overdueQuery.data?.overdueAmount)}
                  </Typography>
                  <Chip
                    label={t('reports.overdueLabel')}
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                  />
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
                            <TableRow key={monthLabel(row.year, row.month)}>
                              <TableCell>{monthLabel(row.year, row.month)}</TableCell>
                              <TableCell>{formatCurrency(row.invoiced)}</TableCell>
                              <TableCell>{formatCurrency(row.paid)}</TableCell>
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
                        {customersQuery.data?.slice(0, 10).map((row) => (
                          <TableRow key={row._id}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{formatCurrency(row.totalInvoiced)}</TableCell>
                            <TableCell sx={{ color: row.balance > 0 ? 'error.main' : 'inherit', fontWeight: 'bold' }}>
                              {formatCurrency(row.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
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
                        {unitsQuery.data?.slice(0, 10).map((row) => (
                          <TableRow key={row._id}>
                            <TableCell>{row.unitNumber}</TableCell>
                            <TableCell>{formatCurrency(row.totalInvoiced)}</TableCell>
                            <TableCell sx={{ color: row.balance > 0 ? 'error.main' : 'inherit', fontWeight: 'bold' }}>
                              {formatCurrency(row.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
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
                          <TableCell>{new Date(row.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{formatCurrency(row.remainingAmount)}</TableCell>
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
  );
}
