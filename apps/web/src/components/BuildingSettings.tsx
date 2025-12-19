import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import api from '../lib/api';
import { useSnackbar } from '../hooks/useSnackbar';
import BuildingFormDialog from './BuildingFormDialog';

const BuildingSettings: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingBuildingId, setDeletingBuildingId] = useState<string | null>(null);

  // Fetch buildings
  const { data: buildings, isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const res = await api.get('/buildings');
      return res.data.data || res.data;
    },
  });

  // Create mutation
  const createBuildingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/buildings', data);
      return res.data;
    },
    onSuccess: () => {
      showSnackbar(t('buildings.created'), 'success');
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setFormDialogOpen(false);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Update mutation
  const updateBuildingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/buildings/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      showSnackbar(t('buildings.updated'), 'success');
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setFormDialogOpen(false);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Delete mutation
  const deleteBuildingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/buildings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      showSnackbar(t('buildings.deleted'), 'success');
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setDeleteConfirmOpen(false);
      setDeletingBuildingId(null);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const handleSubmit = (data: any) => {
    if (editingBuilding) {
      updateBuildingMutation.mutate({ id: editingBuilding._id, data });
    } else {
      createBuildingMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingBuildingId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deletingBuildingId) {
      deleteBuildingMutation.mutate(deletingBuildingId);
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {t('settings.buildings.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('settings.buildings.description')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingBuilding(null);
            setFormDialogOpen(true);
          }}
        >
          {t('buildings.addBuilding')}
        </Button>
      </Box>

      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !buildings || buildings.length === 0 ? (
            <Alert severity="info">
              {t('buildings.noBuildings')}
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('buildings.name')}</TableCell>
                    <TableCell>{t('buildings.address')}</TableCell>
                    <TableCell>{t('buildings.type')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buildings.map((building: any) => (
                    <TableRow key={building._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon color="action" />
                          <Typography variant="body2" fontWeight={500}>
                            {building.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{building.address || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={t(`buildings.types.${building.buildingType}`)} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingBuilding(building);
                            setFormDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(building._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <BuildingFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setEditingBuilding(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingBuilding}
        isLoading={createBuildingMutation.isPending || updateBuildingMutation.isPending}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingBuildingId(null);
        }}
      >
        <DialogTitle>{t('buildings.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('buildings.deleteConfirmMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeletingBuildingId(null);
            }}
            disabled={deleteBuildingMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteBuildingMutation.isPending}
          >
            {deleteBuildingMutation.isPending ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      {SnackbarComponent}
    </Box>
  );
};

export default BuildingSettings;
