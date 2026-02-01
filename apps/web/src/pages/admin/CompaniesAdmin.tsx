import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  MenuItem,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

type Company = {
  _id: string;
  name: string;
  slug?: string;
  phone?: string;
  address?: string;
  currency: string;
  defaultLanguage: string;
  mergeServicesWithRent: boolean;
  createdAt?: string;
};

const currencyOptions = [
  { value: 'YER', label: 'YER' },
  { value: 'SAR', label: 'SAR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const languageOptions = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

const CompaniesAdmin: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Company>>({
    name: '',
    phone: '',
    address: '',
    currency: 'YER',
    defaultLanguage: 'ar',
    mergeServicesWithRent: true,
  });
  const [selected, setSelected] = useState<Company | null>(null);

  const companiesQuery = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const res = await api.get('/companies');
      return res.data.data || res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Company>) => {
      const res = await api.post('/companies', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Company> }) => {
      const res = await api.patch(`/companies/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/companies/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setDeleteId(null);
    },
  });

  const rows: Company[] = companiesQuery.data || [];
  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const term = search.toLowerCase();
    return rows.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.slug?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: (t('admin.companies.name')), flex: 1, minWidth: 160 },
    { field: 'slug', headerName: (t('admin.companies.slug')), flex: 1, minWidth: 140 },
    { field: 'phone', headerName: (t('admin.companies.phone')), flex: 1, minWidth: 130 },
    { field: 'address', headerName: (t('admin.companies.address')), flex: 1.2, minWidth: 180 },
    { field: 'currency', headerName: (t('admin.companies.currency')), width: 110 },
    { field: 'defaultLanguage', headerName: (t('admin.companies.defaultLanguage')), width: 110 },
    {
      field: 'createdAt',
      headerName: (t('admin.companies.createdAt')),
      width: 160,
      valueGetter: (params) =>
        params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : '',
    },
    {
      field: 'actions',
      headerName: (t('admin.companies.actions')),
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => {
              setSelected(params.row);
              setForm({
                name: params.row.name,
                phone: params.row.phone,
                address: params.row.address,
                currency: params.row.currency,
                defaultLanguage: params.row.defaultLanguage,
                mergeServicesWithRent: params.row.mergeServicesWithRent,
              });
              setEditOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => setDeleteId(params.row._id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const handleSubmit = () => {
    if (createOpen) {
      createMutation.mutate(form);
    } else if (editOpen && selected) {
      updateMutation.mutate({ id: selected._id, payload: form });
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">{t('admin.companies.accessDenied')}</Typography>
        <Typography variant="body2">{t('admin.companies.superAdminOnly')}</Typography>
      </Box>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {t('admin.companies.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('admin.companies.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setForm({
              name: '',
              phone: '',
              address: '',
              currency: 'YER',
              defaultLanguage: 'ar',
              mergeServicesWithRent: true,
            });
            setCreateOpen(true);
          }}
        >
          {t('admin.companies.new')}
        </Button>
      </Stack>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {t('admin.companies.total')}
              </Typography>
              <Typography variant="h5">{rows.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <TextField
                fullWidth
                placeholder={t('admin.companies.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Box sx={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row._id}
              disableRowSelectionOnClick
              loading={companiesQuery.isLoading}
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={createOpen || editOpen}
        onClose={() => {
          if (!isSaving) {
            setCreateOpen(false);
            setEditOpen(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {createOpen ? t('admin.companies.createTitle') : t('admin.companies.editTitle')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label={t('admin.companies.name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label={t('admin.companies.phone')}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label={t('admin.companies.address')}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label={t('admin.companies.currency')}
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                fullWidth
              >
                {currencyOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t('admin.companies.language')}
                value={form.defaultLanguage}
                onChange={(e) =>
                  setForm({ ...form, defaultLanguage: e.target.value })
                }
                fullWidth
              >
                {languageOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form.mergeServicesWithRent}
                    onChange={(e) =>
                      setForm({ ...form, mergeServicesWithRent: e.target.checked })
                    }
                  />
                }
                label={t('admin.companies.merge')}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setCreateOpen(false);
                setEditOpen(false);
              }}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>{t('admin.companies.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t('admin.companies.deleteBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompaniesAdmin;
