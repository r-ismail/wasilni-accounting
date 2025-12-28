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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { usePagination } from '../hooks/usePagination';
import { useSnackbar } from '../hooks/useSnackbar';
import ConfirmDialog from '../components/ConfirmDialog';

interface User {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export default function Users() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [formDialog, setFormDialog] = useState<{ open: boolean; user?: User }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const { control, handleSubmit, reset } = useForm<any>();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (formDialog.user) {
        const payload: any = {
          username: data.username,
          role: data.role,
          isActive: data.isActive,
        };
        if (data.password) {
          payload.password = data.password;
        }
        await api.put(`/users/${formDialog.user._id}`, payload);
      } else {
        await api.post('/users', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormDialog({ open: false });
      reset();
      showSnackbar(
        formDialog.user ? t('users.userUpdated') : t('users.userCreated'),
        'success'
      );
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setConfirmDelete({ open: false, id: null });
      showSnackbar(t('users.userDeleted'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const openForm = (user?: User) => {
    if (user) {
      reset({
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        password: '',
      });
    } else {
      reset({
        username: '',
        role: 'user',
        isActive: true,
        password: '',
      });
    }
    setFormDialog({ open: true, user });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('users.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()}>
          {t('users.addUser')}
        </Button>
      </Box>

      {isLoading ? (
        <Typography>{t('common.loading')}</Typography>
      ) : users?.length === 0 ? (
        <Alert severity="info">{t('users.noUsers')}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.username')}</TableCell>
                <TableCell>{t('users.role')}</TableCell>
                <TableCell>{t('users.status')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(paginateData(users as User[])).map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Chip label={t(`users.roles.${user.role}`)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? t('common.active') : t('common.inactive')}
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openForm(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setConfirmDelete({ open: true, id: user._id })}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={users?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage={t('settings.advanced.rowsPerPage')}
          />
        </TableContainer>
      )}

      <Dialog open={formDialog.open} onClose={() => setFormDialog({ open: false })} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
          <DialogTitle>{formDialog.user ? t('users.editUser') : t('users.addUser')}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="username"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField {...field} label={t('users.username')} fullWidth required />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={formDialog.user ? t('users.newPassword') : t('users.password')}
                      type="password"
                      fullWidth
                      required={!formDialog.user}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="role"
                  control={control}
                  defaultValue="user"
                  render={({ field }) => (
                    <TextField {...field} select label={t('users.role')} fullWidth required>
                      <MenuItem value="admin">{t('users.roles.admin')}</MenuItem>
                      <MenuItem value="user">{t('users.roles.user')}</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="isActive"
                  control={control}
                  defaultValue={true}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label={t('users.isActive')}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormDialog({ open: false })} disabled={createMutation.isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title={t('users.deleteConfirm')}
        message={t('users.deleteWarning')}
        onConfirm={() => confirmDelete.id && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        loading={deleteMutation.isPending}
      />

      {SnackbarComponent}
    </Box>
  );
}
