import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

interface Unit {
  _id: string;
  unitNumber: string;
  buildingId: { _id: string; name: string };
  furnishingStatus: 'furnished' | 'unfurnished';
  status: 'available' | 'occupied' | 'maintenance';
  defaultRentMonthly: number;
  defaultRentDaily?: number;
}

export default function Units() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', furnishing: '' });
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setDeleteDialog(null);
    },
  });

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
                  <TableCell>{unit.buildingId?.name || '-'}</TableCell>
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
                    <IconButton size="small" color="primary">
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
