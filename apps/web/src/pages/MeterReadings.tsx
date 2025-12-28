import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl,
  InputLabel, Select, Chip, IconButton
} from '@mui/material';
import { Add, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import { useSnackbar } from '../hooks/useSnackbar';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MeterReadings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReading, setEditingReading] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [formData, setFormData] = useState({
    meterId: '',
    readingDate: new Date().toISOString().split('T')[0],
    currentReading: '',
    notes: '',
  });

  const { data: readings = [] } = useQuery({
    queryKey: ['meter-readings'],
    queryFn: async () => {
      const res = await api.get('/meters/readings/list');
      return res.data.data || res.data || [];
    },
  });

  const { data: meters = [] } = useQuery({
    queryKey: ['meters'],
    queryFn: async () => {
      const res = await api.get('/meters');
      return res.data.data || res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/meters/readings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
      showSnackbar(t('readings.created'), 'success');
      handleCloseDialog();
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('readings.error'), 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/meters/readings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
      showSnackbar(t('readings.updated'), 'success');
      handleCloseDialog();
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('readings.error'), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/meters/readings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
      setConfirmDelete({ open: false, id: null });
      showSnackbar(t('readings.deleted'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('readings.error'), 'error');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleOpenDialog = () => {
    setEditingReading(null);
    setFormData({
      meterId: '',
      readingDate: new Date().toISOString().split('T')[0],
      currentReading: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (reading: any) => {
    setEditingReading(reading);
    setFormData({
      meterId: reading.meterId?._id || reading.meterId || '',
      readingDate: new Date(reading.readingDate).toISOString().split('T')[0],
      currentReading: reading.currentReading?.toString() || '',
      notes: reading.notes || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReading(null);
  };

  const handleSubmit = () => {
    if (!formData.meterId || !formData.currentReading) {
      showSnackbar(t('readings.fillRequired'), 'error');
      return;
    }

    const payload = {
      readingDate: formData.readingDate,
      currentReading: formData.currentReading,
      notes: formData.notes,
    };

    if (editingReading) {
      updateMutation.mutate({ id: editingReading._id, data: payload });
    } else {
      createMutation.mutate({ ...payload, meterId: formData.meterId });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('readings.title')}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          {t('readings.addReading')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('readings.date')}</TableCell>
              <TableCell>{t('readings.meter')}</TableCell>
              <TableCell>{t('readings.service')}</TableCell>
              <TableCell>{t('readings.location')}</TableCell>
              <TableCell align="right">{t('readings.previous')}</TableCell>
              <TableCell align="right">{t('readings.current')}</TableCell>
              <TableCell align="right">{t('readings.consumption')}</TableCell>
              <TableCell>{t('readings.notes')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginateData(readings).map((reading: any) => (
              <TableRow key={reading._id}>
                <TableCell>{formatDate(reading.readingDate)}</TableCell>
                <TableCell>{reading.meterId?.meterNumber}</TableCell>
                <TableCell>{reading.meterId?.serviceId?.name}</TableCell>
                <TableCell>
                  {reading.meterId?.type === 'building'
                    ? reading.meterId?.buildingId?.name
                    : reading.meterId?.unitId?.unitNumber}
                </TableCell>
                <TableCell align="right">{reading.previousReading || 0}</TableCell>
                <TableCell align="right">
                  <strong>{reading.currentReading}</strong>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={reading.consumption || 0}
                    color={reading.consumption > 0 ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{reading.notes || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => handleOpenEdit(reading)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setConfirmDelete({ open: true, id: reading._id })}
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
          count={readings?.length || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage={t('settings.advanced.rowsPerPage')}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingReading ? t('readings.editReading') : t('readings.addReading')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('readings.selectMeter')}</InputLabel>
              <Select
                value={formData.meterId}
                label={t('readings.selectMeter')}
                onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                disabled={!!editingReading}
              >
                {meters.map((meter: any) => (
                  <MenuItem key={meter._id} value={meter._id}>
                    {meter.meterNumber} - {meter.serviceId?.name} (
                    {meter.type === 'building'
                      ? meter.buildingId?.name
                      : meter.unitId?.unitNumber}
                    )
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('readings.date')}
              type="date"
              value={formData.readingDate}
              onChange={(e) => setFormData({ ...formData, readingDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label={t('readings.currentReading')}
              type="number"
              value={formData.currentReading}
              onChange={(e) => setFormData({ ...formData, currentReading: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label={t('readings.notes')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
            {isSaving ? t('common.saving') : editingReading ? t('common.save') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title={t('readings.deleteConfirm')}
        message={t('readings.deleteWarning')}
        onConfirm={() => confirmDelete.id && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        loading={deleteMutation.isPending}
      />

      {SnackbarComponent}
    </Box>
  );
}
