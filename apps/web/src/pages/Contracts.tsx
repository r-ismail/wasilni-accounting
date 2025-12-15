import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
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
  IconButton,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import { useSnackbar } from '../hooks/useSnackbar';
import ConfirmDialog from '../components/ConfirmDialog';

interface Contract {
  _id: string;
  unitId: { _id: string; unitNumber: string };
  customerId: { _id: string; name: string };
  rentType: 'monthly' | 'daily';
  baseRentAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Unit {
  _id: string;
  unitNumber: string;
  status: string;
  defaultRentMonthly: number;
  defaultRentDaily?: number;
}

interface Customer {
  _id: string;
  name: string;
}

export default function Contracts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [formDialog, setFormDialog] = useState<{ open: boolean; contract?: Contract }>({
    open: false,
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [confirmTerminate, setConfirmTerminate] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const { control, handleSubmit, reset, watch, setValue } = useForm<any>();

  const selectedUnitId = watch('unitId');
  const rentType = watch('rentType');

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await api.get('/contracts');
      return response.data.data;
    },
  });

  const { data: units } = useQuery({
    queryKey: ['units', 'available'],
    queryFn: async () => {
      const response = await api.get('/units?status=available');
      return response.data.data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/customers');
      return response.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (formDialog.contract) {
        await api.put(`/contracts/${formDialog.contract._id}`, data);
      } else {
        await api.post('/contracts', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setFormDialog({ open: false });
      reset();
      showSnackbar(
        formDialog.contract ? t('contracts.contractUpdated') : t('contracts.contractCreated'),
        'success'
      );
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setConfirmDelete({ open: false, id: null });
      showSnackbar(t('contracts.contractDeleted'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const terminateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/contracts/${id}/terminate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setConfirmTerminate({ open: false, id: null });
      showSnackbar(t('contracts.contractTerminated'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const openForm = (contract?: Contract) => {
    if (contract) {
      reset({
        unitId: contract.unitId._id,
        customerId: contract.customerId._id,
        rentType: contract.rentType,
        baseRentAmount: contract.baseRentAmount,
        startDate: contract.startDate.split('T')[0],
        endDate: contract.endDate.split('T')[0],
      });
    } else {
      reset({
        unitId: '',
        customerId: '',
        rentType: 'monthly',
        baseRentAmount: 0,
        startDate: '',
        endDate: '',
      });
    }
    setFormDialog({ open: true, contract });
  };

  const handleUnitChange = (unitId: string) => {
    const unit = units?.find((u: Unit) => u._id === unitId);
    if (unit) {
      const amount =
        rentType === 'monthly' ? unit.defaultRentMonthly : unit.defaultRentDaily || 0;
      setValue('baseRentAmount', amount);
    }
  };

  const handleRentTypeChange = (type: string) => {
    if (selectedUnitId) {
      const unit = units?.find((u: Unit) => u._id === selectedUnitId);
      if (unit) {
        const amount = type === 'monthly' ? unit.defaultRentMonthly : unit.defaultRentDaily || 0;
        setValue('baseRentAmount', amount);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('contracts.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()}>
          {t('contracts.addContract')}
        </Button>
      </Box>

      {isLoading ? (
        <Typography>{t('common.loading')}</Typography>
      ) : contracts?.length === 0 ? (
        <Alert severity="info">{t('contracts.noContracts')}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('contracts.unit')}</TableCell>
                <TableCell>{t('contracts.customer')}</TableCell>
                <TableCell>{t('contracts.rentType')}</TableCell>
                <TableCell>{t('contracts.amount')}</TableCell>
                <TableCell>{t('contracts.startDate')}</TableCell>
                <TableCell>{t('contracts.endDate')}</TableCell>
                <TableCell>{t('contracts.status')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginateData(contracts).map((contract: any) => (
                <TableRow key={contract._id}>
                  <TableCell>{contract.unitId.unitNumber}</TableCell>
                  <TableCell>{contract.customerId.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`contracts.${contract.rentType}`)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{contract.baseRentAmount}</TableCell>
                  <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={contract.isActive ? t('common.active') : t('common.inactive')}
                      color={contract.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openForm(contract)}>
                      <EditIcon />
                    </IconButton>
                    {contract.isActive && (
                      <IconButton
                      size="small"
                      color="warning"
                      onClick={() => setConfirmTerminate({ open: true, id: contract._id })}
                    >
                      <BlockIcon />
                      </IconButton>
                    )}
                    <IconButton
                    size="small"
                    color="error"
                    onClick={() => setConfirmDelete({ open: true, id: contract._id })}
                  >
                    <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={contracts?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage={t('settings.advanced.rowsPerPage')}
          />
        </TableContainer>
      )}

      <Dialog
        open={formDialog.open}
        onClose={() => setFormDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))}>
          <DialogTitle>
            {formDialog.contract ? t('contracts.editContract') : t('contracts.addContract')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="unitId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t('contracts.selectUnit')}
                      fullWidth
                      required
                      disabled={!!formDialog.contract}
                      onChange={(e) => {
                        field.onChange(e);
                        handleUnitChange(e.target.value);
                      }}
                    >
                      {units?.map((unit: Unit) => (
                        <MenuItem key={unit._id} value={unit._id}>
                          {unit.unitNumber}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="customerId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t('contracts.selectCustomer')}
                      fullWidth
                      required
                      disabled={!!formDialog.contract}
                    >
                      {customers?.map((customer: Customer) => (
                        <MenuItem key={customer._id} value={customer._id}>
                          {customer.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="rentType"
                  control={control}
                  defaultValue="monthly"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t('contracts.rentType')}
                      fullWidth
                      required
                      onChange={(e) => {
                        field.onChange(e);
                        handleRentTypeChange(e.target.value);
                      }}
                    >
                      <MenuItem value="monthly">{t('contracts.monthly')}</MenuItem>
                      <MenuItem value="daily">{t('contracts.daily')}</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="baseRentAmount"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t('contracts.amount')}
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label={t('contracts.startDate')}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="endDate"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label={t('contracts.endDate')}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormDialog({ open: false })} disabled={saveMutation.isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmTerminate.open}
        title={t('contracts.terminateConfirm')}
        message={t('contracts.terminateWarning')}
        onConfirm={() => confirmTerminate.id && terminateMutation.mutate(confirmTerminate.id)}
        onCancel={() => setConfirmTerminate({ open: false, id: null })}
        loading={terminateMutation.isPending}
        confirmColor="warning"
      />

      <ConfirmDialog
        open={confirmDelete.open}
        title={t('contracts.deleteConfirm')}
        message={t('contracts.deleteWarning')}
        onConfirm={() => confirmDelete.id && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        loading={deleteMutation.isPending}
      />

      {SnackbarComponent}
    </Box>
  );
}
