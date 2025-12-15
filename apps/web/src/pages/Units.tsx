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
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

interface Unit {
  _id: string;
  unitNumber: string;
  buildingId: string | { _id: string; name: string };
  furnishingStatus: 'furnished' | 'unfurnished';
  status: 'available' | 'occupied' | 'maintenance';
  defaultRentMonthly: number;
  defaultRentDaily?: number;
}

interface Building {
  _id: string;
  name: string;
}

export default function Units() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', furnishing: '' });
  const [formDialog, setFormDialog] = useState<{ open: boolean; unit?: Unit }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<any>();

  const { data: units, isLoading } = useQuery({
    queryKey: ['units', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.furnishing) params.append('furnishingStatus', filters.furnishing);
      const response = await api.get(`/units?${params.toString()}`);
      return response.data.data;
    },
  });

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const response = await api.get('/buildings');
      return response.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (formDialog.unit) {
        await api.put(`/units/${formDialog.unit._id}`, data);
      } else {
        await api.post('/units', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setFormDialog({ open: false });
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setDeleteDialog(null);
    },
  });

  const openForm = (unit?: Unit) => {
    if (unit) {
      const buildingId = typeof unit.buildingId === 'object' ? unit.buildingId._id : unit.buildingId;
      reset({
        ...unit,
        buildingId,
      });
    } else {
      reset({
        buildingId: '',
        unitNumber: '',
        furnishingStatus: 'furnished',
        defaultRentMonthly: 0,
        defaultRentDaily: 0,
      });
    }
    setFormDialog({ open: true, unit });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getFurnishingColor = (furnishing: string) => {
    return furnishing === 'furnished' ? 'primary' : 'secondary';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('units.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()}>
          {t('units.addUnit')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label={t('units.filterByStatus')}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="available">{t('units.available')}</MenuItem>
            <MenuItem value="occupied">{t('units.occupied')}</MenuItem>
            <MenuItem value="maintenance">{t('units.maintenance')}</MenuItem>
          </TextField>

          <TextField
            select
            label={t('units.filterByFurnishing')}
            value={filters.furnishing}
            onChange={(e) => setFilters({ ...filters, furnishing: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="furnished">{t('units.furnished')}</MenuItem>
            <MenuItem value="unfurnished">{t('units.unfurnished')}</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {isLoading ? (
        <Typography>{t('common.loading')}</Typography>
      ) : units?.length === 0 ? (
        <Alert severity="info">{t('units.noUnits')}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('units.unitNumber')}</TableCell>
                <TableCell>{t('units.building')}</TableCell>
                <TableCell>{t('units.furnishing')}</TableCell>
                <TableCell>{t('units.status')}</TableCell>
                <TableCell>{t('units.monthlyRent')}</TableCell>
                <TableCell>{t('units.dailyRent')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units?.map((unit: Unit) => (
                <TableRow key={unit._id}>
                  <TableCell>{unit.unitNumber}</TableCell>
                  <TableCell>
                    {typeof unit.buildingId === 'object' ? unit.buildingId.name : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`units.${unit.furnishingStatus}`)}
                      color={getFurnishingColor(unit.furnishingStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`units.${unit.status}`)}
                      color={getStatusColor(unit.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{unit.defaultRentMonthly}</TableCell>
                  <TableCell>{unit.defaultRentDaily || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openForm(unit)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog(unit._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={formDialog.open} onClose={() => setFormDialog({ open: false })} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))}>
          <DialogTitle>
            {formDialog.unit ? t('units.editUnit') : t('units.addUnit')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="buildingId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField {...field} select label={t('units.building')} fullWidth required>
                      {buildings?.map((building: Building) => (
                        <MenuItem key={building._id} value={building._id}>
                          {building.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="unitNumber"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField {...field} label={t('units.unitNumber')} fullWidth required />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="furnishingStatus"
                  control={control}
                  defaultValue="furnished"
                  render={({ field }) => (
                    <TextField {...field} select label={t('units.furnishing')} fullWidth required>
                      <MenuItem value="furnished">{t('units.furnished')}</MenuItem>
                      <MenuItem value="unfurnished">{t('units.unfurnished')}</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="defaultRentMonthly"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t('units.monthlyRent')}
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="defaultRentDaily"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField {...field} type="number" label={t('units.dailyRent')} fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormDialog({ open: false })}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained">
              {t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>{t('units.deleteConfirm')}</DialogTitle>
        <DialogContent>
          <Typography>{t('units.deleteWarning')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>{t('common.cancel')}</Button>
          <Button
            onClick={() => deleteDialog && deleteMutation.mutate(deleteDialog)}
            color="error"
            variant="contained"
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
