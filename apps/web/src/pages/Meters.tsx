import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  FormControl, InputLabel, Select, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSnackbar } from '../hooks/useSnackbar';

export default function Meters() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMeter, setEditingMeter] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [formData, setFormData] = useState({
    meterNumber: '',
    type: 'unit',
    serviceId: '',
    buildingId: '',
    unitId: '',
    isActive: true,
  });

  const { data: meters = [], isLoading } = useQuery({
    queryKey: ['meters'],
    queryFn: async () => {
      const res = await api.get('/meters');
      return res.data.data || res.data || [];
    },
  });

  // ... (rest of the hooks) ...

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data.data || res.data || [];
    },
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const res = await api.get('/buildings');
      return res.data.data || res.data || [];
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await api.get('/units');
      return res.data.data || res.data || [];
    },
  });

  // ... (mutations and handlers) ...

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/meters', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      showSnackbar(t('meters.created'), 'success');
      handleCloseDialog();
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/meters/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      showSnackbar(t('meters.updated'), 'success');
      handleCloseDialog();
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/meters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
      showSnackbar(t('meters.deleted'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const handleOpenDialog = (meter?: any) => {
    if (meter) {
      setEditingMeter(meter);
      setFormData({
        meterNumber: meter.meterNumber,
        type: meter.type,
        serviceId: meter.serviceId?._id || '',
        buildingId: meter.buildingId?._id || '',
        unitId: meter.unitId?._id || '',
        isActive: meter.isActive,
      });
    } else {
      setEditingMeter(null);
      setFormData({
        meterNumber: '',
        type: 'unit',
        serviceId: '',
        buildingId: '',
        unitId: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMeter(null);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      buildingId: formData.type === 'building' ? formData.buildingId : undefined,
      unitId: formData.type === 'unit' ? formData.unitId : undefined,
    };

    if (editingMeter) {
      updateMutation.mutate({ id: editingMeter._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeleteMeter = () => {
    if (confirmDelete.id) {
      deleteMutation.mutate(confirmDelete.id);
    }
    setConfirmDelete({ open: false, id: null });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('meters.title')}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          {t('meters.addMeter')}
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('meters.meterNumber')}</TableCell>
              <TableCell>{t('meters.type')}</TableCell>
              <TableCell>{t('meters.service')}</TableCell>
              <TableCell>{t('meters.location')}</TableCell>
              <TableCell>{t('meters.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginateData(meters).map((meter: any) => (
              <TableRow key={meter._id}>
                <TableCell>{meter.meterNumber}</TableCell>
                <TableCell>
                  <Chip label={t(`meters.${meter.type}`)} size="small" />
                </TableCell>
                <TableCell>{meter.serviceId?.name}</TableCell>
                <TableCell>
                  {meter.type === 'building'
                    ? meter.buildingId?.name
                    : meter.unitId?.unitNumber}
                </TableCell>
                <TableCell>
                  <Chip
                    label={meter.isActive ? t('common.active') : t('common.inactive')}
                    color={meter.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenDialog(meter)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(meter._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={meters?.length || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage={t('settings.advanced.rowsPerPage')}
        />
      </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMeter ? t('meters.editMeter') : t('meters.addMeter')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label={t('meters.meterNumber')}
              value={formData.meterNumber}
              onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>{t('meters.type')}</InputLabel>
              <Select
                value={formData.type}
                label={t('meters.type')}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="building">{t('meters.building')}</MenuItem>
                <MenuItem value="unit">{t('meters.unit')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('meters.service')}</InputLabel>
              <Select
                value={formData.serviceId}
                label={t('meters.service')}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              >
                {services.map((service: any) => (
                  <MenuItem key={service._id} value={service._id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.type === 'building' && (
              <FormControl fullWidth>
                <InputLabel>{t('meters.building')}</InputLabel>
                <Select
                  value={formData.buildingId}
                  label={t('meters.building')}
                  onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                >
                  {buildings.map((building: any) => (
                    <MenuItem key={building._id} value={building._id}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {formData.type === 'unit' && (
              <FormControl fullWidth>
                <InputLabel>{t('meters.unit')}</InputLabel>
                <Select
                  value={formData.unitId}
                  label={t('meters.unit')}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                >
                  {units.map((unit: any) => (
                    <MenuItem key={unit._id} value={unit._id}>
                      {unit.unitNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMeter ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title={t('common.confirmDelete')}
        message={t('meters.confirmDeleteMessage')}
        onConfirm={confirmDeleteMeter}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        confirmText={t('common.delete')}
        confirmColor="error"
      />

      {SnackbarComponent}
    </Box>
  );
}
