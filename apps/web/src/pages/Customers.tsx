import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, TextField, MenuItem, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

interface Customer {
  _id: string;
  type: 'individual' | 'company';
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
}

export default function Customers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formDialog, setFormDialog] = useState<{ open: boolean; customer?: Customer }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<Customer>();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await api.get(`/customers?${params.toString()}`);
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      if (formDialog.customer) {
        await api.put(`/customers/${formDialog.customer._id}`, data);
      } else {
        await api.post('/customers', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFormDialog({ open: false });
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteDialog(null);
    },
  });

  const openForm = (customer?: Customer) => {
    reset(customer || { type: 'individual', isActive: true });
    setFormDialog({ open: true, customer });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('customers.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()}>
          {t('customers.addCustomer')}
        </Button>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField fullWidth label={t('customers.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>
      {isLoading ? <Typography>{t('common.loading')}</Typography> : customers?.length === 0 ? (
        <Alert severity="info">{t('customers.noCustomers')}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('customers.name')}</TableCell>
                <TableCell>{t('customers.type')}</TableCell>
                <TableCell>{t('customers.phone')}</TableCell>
                <TableCell>{t('customers.email')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers?.map((customer: Customer) => (
                <TableRow key={customer._id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell><Chip label={t(`customers.${customer.type}`)} size="small" /></TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openForm(customer)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteDialog(customer._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={formDialog.open} onClose={() => setFormDialog({ open: false })} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
          <DialogTitle>{formDialog.customer ? t('customers.editCustomer') : t('customers.addCustomer')}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller name="type" control={control} defaultValue="individual" render={({ field }) => (
                  <TextField {...field} select label={t('customers.type')} fullWidth required>
                    <MenuItem value="individual">{t('customers.individual')}</MenuItem>
                    <MenuItem value="company">{t('customers.company')}</MenuItem>
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="name" control={control} defaultValue="" render={({ field }) => (
                  <TextField {...field} label={t('customers.name')} fullWidth required />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="phone" control={control} defaultValue="" render={({ field }) => (
                  <TextField {...field} label={t('customers.phone')} fullWidth required />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="email" control={control} defaultValue="" render={({ field }) => (
                  <TextField {...field} label={t('customers.email')} type="email" fullWidth />
                )} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormDialog({ open: false })}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained">{t('common.save')}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>{t('customers.deleteConfirm')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>{t('common.cancel')}</Button>
          <Button onClick={() => deleteDialog && deleteMutation.mutate(deleteDialog)} color="error" variant="contained">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
