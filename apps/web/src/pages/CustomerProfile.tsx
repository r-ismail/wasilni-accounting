import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

interface CustomerProfileData {
  customer: any;
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    outstanding: number;
    openInvoices: number;
    activeContracts: number;
    overdueInvoices: number;
    overdueAmount: number;
    lastPayment: {
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      invoiceId?: any;
    } | null;
  };
  contracts: any[];
  invoices: any[];
  payments: any[];
}

export default function CustomerProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const formatCurrencyEn = (value?: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
  const formatDateEn = (value: string | Date) => new Date(value).toLocaleDateString('en-GB');

  const { data, isLoading } = useQuery({
    queryKey: ['customer-profile', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get(`/customers/${id}/profile`);
      return response.data.data as CustomerProfileData;
    },
  });

  const summaryCards = useMemo(
    () => [
      { label: t('customers.totalInvoiced'), value: formatCurrencyEn(data?.summary.totalInvoiced) },
      { label: t('customers.totalPaid'), value: formatCurrencyEn(data?.summary.totalPaid) },
      { label: t('customers.outstanding'), value: formatCurrencyEn(data?.summary.outstanding) },
      { label: t('customers.activeContracts'), value: data?.summary.activeContracts ?? 0 },
      { label: t('customers.openInvoices'), value: data?.summary.openInvoices ?? 0 },
      { label: t('customers.overdueInvoices'), value: data?.summary.overdueInvoices ?? 0 },
      { label: t('customers.overdueAmount'), value: formatCurrencyEn(data?.summary.overdueAmount) },
    ],
    [data, t],
  );

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <Typography>{t('common.loading')}</Typography>;
  }

  if (!data?.customer) {
    return <Alert severity="warning">{t('common.noData')}</Alert>;
  }

  const customer = data.customer;

  return (
    <Box>
      <style>
        {`@media print {
          @page { size: A4; margin: 12mm; }
          .print-hidden { display: none !important; }
          .MuiDrawer-root, .MuiAppBar-root { display: none !important; }
          html, body { width: 100% !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
          #root { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          main { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          #root > .MuiBox-root { display: block !important; width: 100% !important; margin: 0 !important; }
        }`}
      </style>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">{t('customers.profileTitle')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {customer.name}
          </Typography>
        </Box>
        <Box className="print-hidden" sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/customers')}>
            {t('customers.backToCustomers')}
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
            {t('customers.print')}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('customers.profile')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">{t('customers.type')}</Typography>
            <Typography>{t(`customers.${customer.type}`)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">{t('customers.phone')}</Typography>
            <Typography>{customer.phone || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">{t('customers.email')}</Typography>
            <Typography>{customer.email || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">{t('customers.address')}</Typography>
            <Typography>{customer.address || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">{t('customers.idNumber')}</Typography>
            <Typography>{customer.idNumber || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">{t('customers.taxNumber')}</Typography>
            <Typography>{customer.taxNumber || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">{t('common.status')}</Typography>
            <Chip
              label={customer.isActive ? t('common.active') : t('common.inactive')}
              size="small"
              color={customer.isActive ? 'success' : 'default'}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6">{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {data.summary.lastPayment ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('customers.lastPayment')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">{t('payments.amount')}</Typography>
              <Typography>{formatCurrencyEn(data.summary.lastPayment.amount)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">{t('payments.paymentDate')}</Typography>
              <Typography>{formatDateEn(data.summary.lastPayment.paymentDate)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">{t('payments.paymentMethod')}</Typography>
              <Typography>{data.summary.lastPayment.paymentMethod}</Typography>
            </Grid>
          </Grid>
        </Paper>
      ) : null}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('customers.contracts')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {data.contracts.length === 0 ? (
          <Alert severity="info">{t('customers.noContracts')}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('contracts.unit')}</TableCell>
                  <TableCell>{t('contracts.building')}</TableCell>
                  <TableCell>{t('contracts.rentType')}</TableCell>
                  <TableCell>{t('contracts.amount')}</TableCell>
                  <TableCell>{t('contracts.startDate')}</TableCell>
                  <TableCell>{t('contracts.endDate')}</TableCell>
                  <TableCell>{t('contracts.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.contracts.map((contract: any) => (
                  <TableRow key={contract._id}>
                    <TableCell>{contract.unitId?.unitNumber || '-'}</TableCell>
                    <TableCell>{contract.unitId?.buildingId?.name || '-'}</TableCell>
                    <TableCell>{t(`contracts.${contract.rentType}`)}</TableCell>
                    <TableCell>{formatCurrencyEn(contract.baseRentAmount)}</TableCell>
                    <TableCell>{formatDateEn(contract.startDate)}</TableCell>
                    <TableCell>{formatDateEn(contract.endDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={contract.isActive ? t('common.active') : t('common.inactive')}
                        size="small"
                        color={contract.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('customers.invoices')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {data.invoices.length === 0 ? (
          <Alert severity="info">{t('customers.noInvoices')}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('invoices.invoiceNumber')}</TableCell>
                  <TableCell>{t('invoices.issueDate')}</TableCell>
                  <TableCell>{t('invoices.dueDate')}</TableCell>
                  <TableCell>{t('invoices.totalAmount')}</TableCell>
                  <TableCell>{t('invoices.paidAmount')}</TableCell>
                  <TableCell>{t('invoices.remainingAmount')}</TableCell>
                  <TableCell>{t('invoices.statusLabel')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.invoices.map((invoice: any) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDateEn(invoice.issueDate)}</TableCell>
                    <TableCell>{formatDateEn(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrencyEn(invoice.totalAmount)}</TableCell>
                    <TableCell>{formatCurrencyEn(invoice.paidAmount)}</TableCell>
                    <TableCell>{formatCurrencyEn(invoice.remainingAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(`invoices.status.${invoice.status}`)}
                        size="small"
                        color={invoice.status === 'paid' ? 'success' : invoice.status === 'cancelled' ? 'default' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('customers.overdueInvoices')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {data.invoices.filter((invoice: any) =>
          !['paid', 'cancelled'].includes(invoice.status) &&
          new Date(invoice.dueDate) < new Date(),
        ).length === 0 ? (
          <Alert severity="info">{t('customers.noOverdueInvoices')}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('invoices.invoiceNumber')}</TableCell>
                  <TableCell>{t('invoices.dueDate')}</TableCell>
                  <TableCell>{t('invoices.totalAmount')}</TableCell>
                  <TableCell>{t('invoices.remainingAmount')}</TableCell>
                  <TableCell>{t('invoices.statusLabel')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.invoices
                  .filter((invoice: any) =>
                    !['paid', 'cancelled'].includes(invoice.status) &&
                    new Date(invoice.dueDate) < new Date(),
                  )
                  .map((invoice: any) => (
                    <TableRow key={invoice._id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDateEn(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrencyEn(invoice.totalAmount)}</TableCell>
                      <TableCell>{formatCurrencyEn(invoice.remainingAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`invoices.status.${invoice.status}`)}
                          size="small"
                          color="warning"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('customers.payments')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {data.payments.length === 0 ? (
          <Alert severity="info">{t('customers.noPayments')}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('payments.paymentDate')}</TableCell>
                  <TableCell>{t('payments.amount')}</TableCell>
                  <TableCell>{t('payments.paymentMethod')}</TableCell>
                  <TableCell>{t('payments.invoice')}</TableCell>
                  <TableCell>{t('payments.notes')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.payments.map((payment: any) => (
                  <TableRow key={payment._id}>
                    <TableCell>{formatDateEn(payment.paymentDate)}</TableCell>
                    <TableCell>{formatCurrencyEn(payment.amount)}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{payment.invoiceId?.invoiceNumber || '-'}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
