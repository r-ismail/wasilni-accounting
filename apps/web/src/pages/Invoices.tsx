import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { usePagination } from '../hooks/usePagination';

export default function Invoices() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/invoices${params}`);
      return res.data.data;
    },
  });

  // Fetch contracts for generate dialog
  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const res = await api.get('/contracts?isActive=true');
      return res.data.data;
    },
  });

  // Generate invoice mutation
  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/invoices/generate', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setGenerateOpen(false);
    },
  });

  // Delete invoice mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const handlePrint = async (invoiceId: string) => {
    try {
      // Open print view in new window
      const printUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/invoices/${invoiceId}/print`;
      window.open(printUrl, '_blank');
    } catch (error) {
      console.error('Error opening print view:', error);
    }
  };

  const handleViewDetails = async (invoice: any) => {
    const res = await api.get(`/invoices/${invoice._id}/lines`);
    setSelectedInvoice({ ...invoice, lines: res.data.data });
    setDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'posted': return 'info';
      case 'paid': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('invoices.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setGenerateOpen(true)}
        >
          {t('invoices.generate')}
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          select
          label={t('invoices.filterByStatus')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
          size="small"
        >
          <MenuItem value="">{t('common.all')}</MenuItem>
          <MenuItem value="draft">{t('invoices.status.draft')}</MenuItem>
          <MenuItem value="posted">{t('invoices.status.posted')}</MenuItem>
          <MenuItem value="paid">{t('invoices.status.paid')}</MenuItem>
          <MenuItem value="cancelled">{t('invoices.status.cancelled')}</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('invoices.invoiceNumber')}</TableCell>
                <TableCell>{t('invoices.customer')}</TableCell>
                <TableCell>{t('invoices.unit')}</TableCell>
                <TableCell>{t('invoices.issueDate')}</TableCell>
                <TableCell>{t('invoices.dueDate')}</TableCell>
                <TableCell>{t('invoices.totalAmount')}</TableCell>
                <TableCell>{t('invoices.paidAmount')}</TableCell>
                <TableCell>{t('invoices.remainingAmount')}</TableCell>
                <TableCell>{t('invoices.statusLabel')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginateData(invoices).map((invoice: any) => (
                <TableRow key={invoice._id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.contractId?.customerId?.name}</TableCell>
                  <TableCell>{invoice.contractId?.unitId?.unitNumber}</TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.paidAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                    {invoice.isOverdue && (
                      <Chip
                        label={`${t('invoices.overdue')} (${invoice.overdueDays} ${t('invoices.days')})`}
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`invoices.status.${invoice.status}`)}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleViewDetails(invoice)} size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handlePrint(invoice._id)} size="small">
                      <PrintIcon />
                    </IconButton>
                    {invoice.status === 'draft' && (
                      <IconButton
                        onClick={() => deleteMutation.mutate(invoice._id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={invoices?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage={t('settings.advanced.rowsPerPage')}
          />
        </TableContainer>
      )}

      {/* Generate Invoice Dialog */}
      <GenerateInvoiceDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        contracts={contracts}
        onGenerate={(data: any) => generateMutation.mutate(data)}
        loading={generateMutation.isPending}
      />

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <InvoiceDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          invoice={selectedInvoice}
        />
      )}
    </Box>
  );
}

function GenerateInvoiceDialog({ open, onClose, contracts, onGenerate, loading }: any) {
  const { t } = useTranslation();
  const [contractId, setContractId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const handleSubmit = () => {
    onGenerate({ contractId, periodStart, periodEnd });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('invoices.generateInvoice')}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            select
            label={t('invoices.contract')}
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            fullWidth
          >
            {contracts.map((contract: any) => (
              <MenuItem key={contract._id} value={contract._id}>
                {contract.customerId?.name} - {contract.unitId?.unitNumber}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label={t('invoices.periodStart')}
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            type="date"
            label={t('invoices.periodEnd')}
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : t('invoices.generate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InvoiceDetailsDialog({ open, onClose, invoice }: any) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('invoices.invoiceDetails')}</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="subtitle2">{t('invoices.invoiceNumber')}: {invoice.invoiceNumber}</Typography>
          <Typography variant="subtitle2">{t('invoices.statusLabel')}: {invoice.status}</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('invoices.description')}</TableCell>
                <TableCell align="right">{t('invoices.quantity')}</TableCell>
                <TableCell align="right">{t('invoices.unitPrice')}</TableCell>
                <TableCell align="right">{t('invoices.amount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.lines?.map((line: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{line.description}</TableCell>
                  <TableCell align="right">{line.quantity}</TableCell>
                  <TableCell align="right">{line.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">{line.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right"><strong>{t('invoices.total')}</strong></TableCell>
                <TableCell align="right"><strong>{invoice.totalAmount.toFixed(2)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
