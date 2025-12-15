import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl,
  InputLabel, Select, Chip
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

export default function MeterReadings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
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
      return res.data;
    },
  });

  const { data: meters = [] } = useQuery({
    queryKey: ['meters'],
    queryFn: async () => {
      const res = await api.get('/meters');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/meters/readings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
      toast.success(t('readings.created'));
      handleCloseDialog();
    },
    onError: () => {
      toast.error(t('readings.error'));
    },
  });

  const handleOpenDialog = () => {
    setFormData({
      meterId: '',
      readingDate: new Date().toISOString().split('T')[0],
      currentReading: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = () => {
    if (!formData.meterId || !formData.currentReading) {
      toast.error(t('readings.fillRequired'));
      return;
    }
    createMutation.mutate(formData);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG');
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
            </TableRow>
          </TableHead>
          <TableBody>
            {readings.map((reading: any) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('readings.addReading')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('readings.selectMeter')}</InputLabel>
              <Select
                value={formData.meterId}
                label={t('readings.selectMeter')}
                onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
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
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
