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
import { usePagination } from '../hooks/usePagination';

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
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
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
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('units.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {units?.length || 0} {t('units.totalUnits')}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => openForm()}
            size="large"
            sx={{ px: 3, py: 1.5, fontWeight: 600 }}
          >
            {t('units.addUnit')}
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
          {t('common.filters')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            label={t('units.filterByStatus')}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            sx={{ minWidth: 220 }}
            size="small"
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
            sx={{ minWidth: 220 }}
            size="small"
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
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>{t('units.unitNumber')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('units.building')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('units.furnishing')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('units.status')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('units.monthlyRent')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('units.dailyRent')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginateData(units).map((unit: Unit) => (
                <TableRow key={unit._id}>
                  <TableCell sx={{  }}>{unit.unitNumber}</TableCell>
                  <TableCell sx={{  }}>
                    {typeof unit.buildingId === 'object' ? unit.buildingId.name : '-'}
                  </TableCell>
                  <TableCell sx={{  }}>
                    <Chip
                      label={t(`units.${unit.furnishingStatus}`)}
                      color={getFurnishingColor(unit.furnishingStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{  }}>
                    <Chip
                      label={t(`units.${unit.status}`)}
                      color={getStatusColor(unit.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{  }}>{unit.defaultRentMonthly}</TableCell>
                  <TableCell sx={{  }}>{unit.defaultRentDaily || '-'}</TableCell>
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
          <TablePagination
            component="div"
            count={units?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage={t('settings.advanced.rowsPerPage')}
          />
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
              
              {/* Additional Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                  {t('units.additionalDetails')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="number" label={t('units.area')} fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="bedrooms"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="number" label={t('units.bedrooms')} fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="bathrooms"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="number" label={t('units.bathrooms')} fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="floor"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label={t('units.floor')} fullWidth />
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
                      label={t('units.description')} 
                      fullWidth 
                      multiline 
                      rows={3}
                    />
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
