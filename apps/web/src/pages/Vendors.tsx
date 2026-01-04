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
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
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
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';

interface Vendor {
  _id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  category: string;
  isActive: boolean;
}

const vendorCategories = [
  'Maintenance',
  'Utilities',
  'Legal',
  'Supplies',
  'Services',
  'Insurance',
  'Taxes',
  'Other',
];

export default function Vendors() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const { control, handleSubmit, reset } = useForm<Partial<Vendor>>();

  const buildVendorPayload = (data: Partial<Vendor>) => {
    const payload: Partial<Vendor> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.category !== undefined) payload.category = data.category;
    if (data.contactName !== undefined) payload.contactName = data.contactName;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.address !== undefined) payload.address = data.address;
    if (data.taxNumber !== undefined) payload.taxNumber = data.taxNumber;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    return payload;
  };

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/vendors');
      return response.data.data ?? response.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Vendor>) => api.post('/vendors', buildVendorPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      handleClose(true);
      showSnackbar(t('vendors.created'), 'success');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Vendor>) => api.patch(`/vendors/${editId}`, buildVendorPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      handleClose(true);
      showSnackbar(t('vendors.updated'), 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setDeleteConfirm({ open: false, id: null });
      showSnackbar(t('vendors.deleted'), 'success');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleOpen = (vendor?: Vendor) => {
    if (vendor) {
      setEditId(vendor._id);
      reset({
        name: vendor.name,
        category: vendor.category,
        contactName: vendor.contactName,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        taxNumber: vendor.taxNumber,
        isActive: vendor.isActive,
      });
    } else {
      setEditId(null);
      reset({ category: 'Maintenance' });
    }
    setOpen(true);
  };

  const handleClose = (force?: boolean) => {
    if (isSaving && !force) {
      return;
    }
    setOpen(false);
    setEditId(null);
    reset({});
  };

  const onSubmit = (data: Partial<Vendor>) => {
    if (editId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('vendors.title')}
        subtitle={t('settings.description')} // Reusing useful subtitle
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('vendors.add')}
          </Button>
        }
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('vendors.name')}</TableCell>
              <TableCell>{t('vendors.category')}</TableCell>
              <TableCell>{t('vendors.phone')}</TableCell>
              <TableCell>{t('vendors.contactName')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : vendors?.map((vendor: Vendor) => (
              <TableRow key={vendor._id}>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{t(`vendors.categories.${vendor.category.toLowerCase()}`, vendor.category)}</TableCell>
                <TableCell>{vendor.phone}</TableCell>
                <TableCell>{vendor.contactName || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(vendor)} size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteConfirm({ open: true, id: vendor._id })}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && vendors?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => handleClose()} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editId ? t('vendors.edit') : t('vendors.add')}</DialogTitle>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('vendors.name')}
                  fullWidth
                  margin="normal"
                  required
                />
              )}
            />
            <Controller
              name="category"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('vendors.category')}</InputLabel>
                  <Select {...field} label={t('vendors.category')}>
                    {vendorCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {t(`vendors.categories.${cat.toLowerCase()}`, cat)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="contactName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('vendors.contactName')}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('vendors.phone')}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('vendors.email')}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="taxNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('vendors.taxNumber')}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('vendors.address')}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              )}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => handleClose()} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? <CircularProgress size={20} color="inherit" /> : t('common.save')}
            </Button>
        </DialogActions>
      </form>
    </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title={t('vendors.deleteConfirm')}
        message={t('vendors.deleteWarning')}
        onConfirm={() => deleteConfirm.id && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
