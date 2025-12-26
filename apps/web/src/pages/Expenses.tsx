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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '../lib/api';
import { useSnackbar } from '../contexts/SnackbarContext';
import PageHeader  from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import {formatCurrency} from '../utils/format';

interface Expense {
  _id: string;
  date: string;
  amount: number;
  category: string;
  vendorId?: { _id: string; name: string };
  buildingId?: { _id: string; name: string };
  unitId?: { _id: string; unitNumber: string };
  description?: string;
  paymentMethod: string;
  recordedBy: { username: string };
}

const expenseCategories = [
  'Maintenance',
  'Utilities',
  'Salaries',
  'Insurance',
  'Legal',
  'Supplies',
  'Services',
  'Other',
];

const paymentMethods = ['cash', 'bank_transfer', 'check', 'credit_card'];

export default function Expenses() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const { control, handleSubmit, reset } = useForm<Partial<Expense>>();

  // Lookups
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/vendors');
      return response.data.data ?? response.data ?? [];
    },
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const response = await api.get('/buildings');
      return response.data.data ?? response.data ?? [];
    },
  });

  // Watch building change to filter units if needed (advanced) - simplistic for now.

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await api.get('/expenses');
      return response.data.data ?? response.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Expense>) => api.post('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      handleClose();
      showSnackbar(t('expenses.created'), 'success');
    },
  });

  const buildExpensePayload = (data: Partial<Expense>) => {
    const payload: Partial<Expense> = {};
    if (data.date !== undefined) payload.date = data.date;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.category !== undefined) payload.category = data.category;
    if (data.vendorId !== undefined) payload.vendorId = data.vendorId;
    if (data.buildingId !== undefined) payload.buildingId = data.buildingId;
    if (data.unitId !== undefined) payload.unitId = data.unitId;
    if (data.description !== undefined) payload.description = data.description;
    if (data.paymentMethod !== undefined) payload.paymentMethod = data.paymentMethod;
    return payload;
  };
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Expense>) => api.patch(`/expenses/${editId}`, buildExpensePayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      handleClose();
      showSnackbar(t('expenses.updated'), 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDeleteConfirm({ open: false, id: null });
      showSnackbar(t('expenses.deleted'), 'success');
    },
  });

  const handleOpen = (expense?: Expense) => {
    if (expense) {
      setEditId(expense._id);
      // Format date for input type=date
      const formData = {
        ...expense,
        date: new Date(expense.date).toISOString().split('T')[0],
        vendorId: expense.vendorId?._id as any,
        buildingId: expense.buildingId?._id as any,
        unitId: expense.unitId?._id as any,
      };
      reset(formData);
    } else {
      setEditId(null);
      reset({
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        category: 'Maintenance',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    reset({});
  };

  const onSubmit = (data: Partial<Expense>) => {
    if (editId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('expenses.title')}
        subtitle={t('dashboard.subtitle')}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('expenses.add')}
          </Button>
        }
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('expenses.date')}</TableCell>
              <TableCell>{t('expenses.category')}</TableCell>
              <TableCell>{t('expenses.vendor')}</TableCell>
              <TableCell>{t('expenses.building')}</TableCell>
              <TableCell>{t('expenses.amount')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : expenses?.map((expense: Expense) => (
              <TableRow key={expense._id}>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{t(`expenses.categories.${expense.category?.toLowerCase()}`, expense.category)}</TableCell>
                <TableCell>{expense.vendorId?.name || '-'}</TableCell>
                <TableCell>{expense.buildingId?.name || '-'}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(expense.amount)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(expense)} size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteConfirm({ open: true, id: expense._id })}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && expenses?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editId ? t('expenses.edit') : t('expenses.add')}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('expenses.date')}
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: true, min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('expenses.amount')}
                      type="number"
                      fullWidth
                      required
                      inputProps={{ min: 0, step: 0.01 }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>{t('expenses.category')}</InputLabel>
                      <Select {...field} label={t('expenses.category')}>
                        {expenseCategories.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {t(`expenses.categories.${cat.toLowerCase()}`)}                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                 <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>{t('expenses.paymentMethod')}</InputLabel>
                      <Select {...field} label={t('expenses.paymentMethod')}>
                        {paymentMethods.map((method) => (
                          <MenuItem key={method} value={method}>
                            {t(`expenses.methods.${method}`)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="vendorId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>{t('expenses.vendor')}</InputLabel>
                      <Select {...field} label={t('expenses.vendor')}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {vendors?.map((v: any) => (
                          <MenuItem key={v._id} value={v._id}>
                            {v.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="buildingId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>{t('expenses.building')}</InputLabel>
                      <Select {...field} label={t('expenses.building')}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {buildings?.map((b: any) => (
                          <MenuItem key={b._id} value={b._id}>
                            {b.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('expenses.description')}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained">
              {t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title={t('expenses.deleteConfirm')}
        message={t('expenses.deleteWarning')}
        onConfirm={() => deleteConfirm.id && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
