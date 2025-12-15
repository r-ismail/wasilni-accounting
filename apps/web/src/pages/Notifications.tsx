import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  IconButton,
  Chip,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Delete, Refresh, Send } from '@mui/icons-material';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { usePagination } from '../hooks/usePagination';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [tabValue, setTabValue] = useState(0);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Send notification form
  const [notificationType, setNotificationType] = useState('sms');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  
  // Template form
  const [templateType, setTemplateType] = useState('payment_reminder');
  const [templateName, setTemplateName] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data.data;
    },
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const response = await api.get('/notifications/templates');
      return response.data.data;
    },
  });

  // Send notification mutation
  const sendNotification = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/notifications', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('notifications.sent'));
      handleCloseSendDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/notifications/templates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success(t('notifications.templateCreated'));
      handleCloseTemplateDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success(t('notifications.templateDeleted'));
    },
  });

  // Retry notification mutation
  const retryNotification = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('notifications.retried'));
    },
  });

  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
    setNotificationType('sms');
    setRecipient('');
    setMessage('');
  };

  const handleCloseTemplateDialog = () => {
    setTemplateDialogOpen(false);
    setTemplateType('payment_reminder');
    setTemplateName('');
    setTemplateBody('');
  };

  const handleSendNotification = () => {
    if (!recipient || !message) {
      toast.error(t('common.fillRequired'));
      return;
    }

    sendNotification.mutate({
      type: notificationType,
      recipient,
      message,
    });
  };

  const handleCreateTemplate = () => {
    if (!templateName || !templateBody) {
      toast.error(t('common.fillRequired'));
      return;
    }

    createTemplate.mutate({
      type: templateType,
      name: templateName,
      body: templateBody,
      channels: [notificationType],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return '📱';
      case 'whatsapp':
        return '💬';
      case 'email':
        return '📧';
      default:
        return '📨';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('nav.notifications')}</Typography>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={() => setSendDialogOpen(true)}
        >
          {t('notifications.sendNotification')}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t('notifications.total')}
            </Typography>
            <Typography variant="h5">{notifications.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t('notifications.sent')}
            </Typography>
            <Typography variant="h5">
              {notifications.filter((n: any) => n.status === 'sent').length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t('notifications.pending')}
            </Typography>
            <Typography variant="h5">
              {notifications.filter((n: any) => n.status === 'pending').length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t('notifications.failed')}
            </Typography>
            <Typography variant="h5">
              {notifications.filter((n: any) => n.status === 'failed').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label={t('notifications.history')} />
          <Tab label={t('notifications.templates')} />
        </Tabs>
      </Box>

      {/* Notifications History Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('notifications.type')}</TableCell>
                <TableCell>{t('notifications.recipient')}</TableCell>
                <TableCell>{t('notifications.message')}</TableCell>
                <TableCell>{t('notifications.statusLabel')}</TableCell>
                <TableCell>{t('notifications.sentAt')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginateData(notifications).map((notification: any) => (
                <TableRow key={notification._id}>
                  <TableCell>
                    {getTypeIcon(notification.type)} {notification.type.toUpperCase()}
                  </TableCell>
                  <TableCell>{notification.recipient}</TableCell>
                  <TableCell>
                    {notification.message.substring(0, 50)}
                    {notification.message.length > 50 && '...'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`notifications.status.${notification.status}`)}
                      color={getStatusColor(notification.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {notification.sentAt
                      ? new Date(notification.sentAt).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {notification.status === 'failed' && (
                      <IconButton
                        size="small"
                        onClick={() => retryNotification.mutate(notification._id)}
                      >
                        <Refresh />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={notifications?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage={t('settings.advanced.rowsPerPage')}
          />
        </TableContainer>
      </TabPanel>

      {/* Templates Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            {t('notifications.addTemplate')}
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('notifications.templateName')}</TableCell>
                <TableCell>{t('notifications.templateType')}</TableCell>
                <TableCell>{t('notifications.body')}</TableCell>
                <TableCell>{t('notifications.isDefault')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginateData(templates).map((template: any) => (
                <TableRow key={template._id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>
                    <Chip label={template.type} size="small" />
                  </TableCell>
                  <TableCell>
                    {template.body.substring(0, 60)}
                    {template.body.length > 60 && '...'}
                  </TableCell>
                  <TableCell>
                    {template.isDefault ? (
                      <Chip label={t('common.yes')} color="primary" size="small" />
                    ) : (
                      <Chip label={t('common.no')} size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!template.isDefault && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('notifications.confirmDeleteTemplate'))) {
                            deleteTemplate.mutate(template._id);
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={templates?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage={t('settings.advanced.rowsPerPage')}
          />
        </TableContainer>
      </TabPanel>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogOpen} onClose={handleCloseSendDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('notifications.sendNotification')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('notifications.type')}</InputLabel>
              <Select
                value={notificationType}
                label={t('notifications.type')}
                onChange={(e) => setNotificationType(e.target.value)}
              >
                <MenuItem value="sms">📱 SMS</MenuItem>
                <MenuItem value="whatsapp">💬 WhatsApp</MenuItem>
                <MenuItem value="email">📧 Email</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('notifications.recipient')}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={
                notificationType === 'email'
                  ? 'email@example.com'
                  : '+967 xxx xxx xxx'
              }
              fullWidth
            />

            <TextField
              label={t('notifications.message')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSendNotification} variant="contained">
            {t('notifications.send')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={templateDialogOpen} onClose={handleCloseTemplateDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('notifications.addTemplate')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('notifications.templateType')}</InputLabel>
              <Select
                value={templateType}
                label={t('notifications.templateType')}
                onChange={(e) => setTemplateType(e.target.value)}
              >
                <MenuItem value="payment_reminder">{t('notifications.types.paymentReminder')}</MenuItem>
                <MenuItem value="payment_received">{t('notifications.types.paymentReceived')}</MenuItem>
                <MenuItem value="invoice_generated">{t('notifications.types.invoiceGenerated')}</MenuItem>
                <MenuItem value="contract_expiring">{t('notifications.types.contractExpiring')}</MenuItem>
                <MenuItem value="overdue_notice">{t('notifications.types.overdueNotice')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('notifications.templateName')}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              fullWidth
            />

            <TextField
              label={t('notifications.body')}
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              multiline
              rows={6}
              fullWidth
              helperText={t('notifications.variablesHelp')}
            />

            <Typography variant="caption" color="textSecondary">
              {t('notifications.availableVariables')}: customerName, invoiceNumber, amount, dueDate, unitNumber, overdueDays
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleCreateTemplate} variant="contained">
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
