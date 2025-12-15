import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { usePagination } from '../hooks/usePagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSnackbar } from '../contexts/SnackbarContext';

export default function Payments() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [filterInvoiceId, setFilterInvoiceId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Fetch unpaid invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', 'unpaid'],
    queryFn: async () => {
      const response = await api.get('/invoices');
      return response.data.data.filter((inv: any) => inv.status !== 'paid');
    },
  });

  // Fetch payments
  const { data: payments = [] } = useQuery({
    queryKey: ['payments', filterInvoiceId],
    queryFn: async () => {
      const url = filterInvoiceId 
        ? `/payments?invoiceId=${filterInvoiceId}`
        : '/payments';
      const response = await api.get(url);
      return response.data.data;
    },
  });

  // Create payment mutation
  const createPayment = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/payments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showSnackbar(t('payments.paymentRecorded'), 'success');
      handleCloseDialog();
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Delete payment mutation
  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showSnackbar(t('payments.paymentDeleted'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInvoiceId('');
    setAmount('');
    setNotes('');
    setPaymentDate(new Date());
  };

  const handleSubmit = () => {
    if (!selectedInvoiceId || !amount) {
      toast.error(t('common.fillRequired'));
      return;
    }

    createPayment.mutate({
      invoiceId: selectedInvoiceId,
      amount: parseFloat(amount),
      paymentDate,
      notes,
    });
  };

  const handleDelete = (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeletePayment = () => {
    if (confirmDelete.id) {
      deletePayment.mutate(confirmDelete.id);
    }
    setConfirmDelete({ open: false, id: null });
  };

  const getInvoiceInfo = (invoiceId: string) => {
    const invoice = invoices.find((inv: any) => inv._id === invoiceId);
    if (!invoice) return '-';
    return `${invoice.invoiceNumber} - ${invoice.contractId?.customerId?.name}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('nav.payments')}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          {t('payments.recordPayment')}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t('payments.totalPayments')}
            </Typography>
            <Typography variant="h5">
              {payments.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t('payments.paymentsCount')}
            </Typography>
            <Typography variant="h5">{payments.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t('payments.unpaidInvoices')}
            </Typography>
            <Typography variant="h5">{invoices.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>{t('payments.filterByInvoice')}</InputLabel>
          <Select
            value={filterInvoiceId}
            label={t('payments.filterByInvoice')}
            onChange={(e) => setFilterInvoiceId(e.target.value)}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            {invoices.map((invoice: any) => (
              <MenuItem key={invoice._id} value={invoice._id}>
                {invoice.invoiceNumber} - {invoice.contractId?.customerId?.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('payments.invoice')}</TableCell>
              <TableCell>{t('payments.amount')}</TableCell>
              <TableCell>{t('payments.paymentDate')}</TableCell>
              <TableCell>{t('payments.notes')}</TableCell>
              <TableCell>{t('payments.recordedBy')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginateData(payments).map((payment: any) => (
              <TableRow key={payment._id}>
                <TableCell>{getInvoiceInfo(payment.invoiceId)}</TableCell>
                <TableCell>{payment.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{payment.notes || '-'}</TableCell>
                <TableCell>{payment.recordedBy?.username || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(payment._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={payments?.length || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage={t('settings.advanced.rowsPerPage')}
        />
      </TableContainer>

      {/* Record Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('payments.recordPayment')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('payments.selectInvoice')}</InputLabel>
              <Select
                value={selectedInvoiceId}
                label={t('payments.selectInvoice')}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
              >
                {invoices.map((invoice: any) => (
                  <MenuItem key={invoice._id} value={invoice._id}>
                    {invoice.invoiceNumber} - {invoice.contractId?.customerId?.name} - 
                    {t('common.remaining')}: {(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('payments.amount')}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('payments.paymentDate')}
                value={paymentDate}
                onChange={(date) => setPaymentDate(date || new Date())}
              />
            </LocalizationProvider>

            <TextField
              label={t('payments.notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={createPayment.isPending}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createPayment.isPending}
          >
            {createPayment.isPending ? t('common.saving') : t('payments.record')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title={t('common.confirmDelete')}
        message={t('payments.confirmDeleteMessage')}
        onConfirm={confirmDeletePayment}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        confirmText={t('common.delete')}
        confirmColor="error"
      />
    </Box>
  );
}
