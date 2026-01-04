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
  CircularProgress,
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
import { usePagination } from '../hooks/usePagination';
import { useSnackbar } from '../hooks/useSnackbar';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, paginateData } = usePagination();
  const [tabValue, setTabValue] = useState(0);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  
  // Send notification form
  const [notificationType, setNotificationType] = useState('sms');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  
  // Template form
  const [templateType, setTemplateType] = useState('payment_reminder');
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
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
      showSnackbar(t('notifications.sent'), 'success');
      handleCloseSendDialog(true);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/notifications/templates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      showSnackbar(t('notifications.templateCreated'), 'success');
      handleCloseTemplateDialog(true);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      showSnackbar(t('notifications.templateDeleted'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Retry notification mutation
  const retryNotification = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showSnackbar(t('notifications.retried'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const isSending = sendNotification.isPending;
  const isCreatingTemplate = createTemplate.isPending;

  const handleCloseSendDialog = (force?: boolean) => {
    if (isSending && !force) {
      return;
    }
    setSendDialogOpen(false);
    setNotificationType('sms');
    setRecipient('');
    setSubject('');
    setSelectedTemplate('');
    setMessage('');
  };

  const handleCloseTemplateDialog = (force?: boolean) => {
    if (isCreatingTemplate && !force) {
      return;
    }
    setTemplateDialogOpen(false);
    setTemplateType('payment_reminder');
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
  };

  const handleSendNotification = () => {
    if (!recipient || !message) {
      showSnackbar(t('common.fillRequired'), 'error');
      return;
    }

    sendNotification.mutate({
      type: notificationType,
      recipient,
      subject: notificationType === 'email' ? subject : undefined,
      message,
    });
  };

  const handleCreateTemplate = () => {
    if (!templateName || !templateBody) {
      showSnackbar(t('common.fillRequired'), 'error');
      return;
    }

    createTemplate.mutate({
      type: templateType,
      name: templateName,
      subject: templateSubject,
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setGuideDialogOpen(true)}>
            {t('notifications.setupGuideButton')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setSendDialogOpen(true)}
          >
            {t('notifications.sendNotification')}
          </Button>
        </Box>
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
                      onClick={() => setConfirmDelete({ open: true, id: template._id })}
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
                disabled={isSending}
                onChange={(e) => {
                  setNotificationType(e.target.value);
                  setSelectedTemplate('');
                  setMessage('');
                  setSubject('');
                }}
              >
                <MenuItem value="sms">📱 SMS</MenuItem>
                <MenuItem value="whatsapp">💬 WhatsApp</MenuItem>
                <MenuItem value="email">📧 Email</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('notifications.templates')}</InputLabel>
              <Select
                value={selectedTemplate}
                label={t('notifications.templates')}
                disabled={isSending}
                onChange={(e) => {
                  const templateId = e.target.value;
                  setSelectedTemplate(templateId);
                  const template = templates.find((t: any) => t._id === templateId);
                  if (template) {
                    setMessage(template.body);
                    if (notificationType === 'email' && template.subject) {
                      setSubject(template.subject);
                    }
                  }
                }}
              >
                <MenuItem value="">
                  <em>{t('common.none')}</em>
                </MenuItem>
                {templates
                  .filter((t: any) => t.channels.includes(notificationType))
                  .map((template: any) => (
                    <MenuItem key={template._id} value={template._id}>
                      {template.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <TextField
              label={t('notifications.recipient')}
              value={recipient}
              disabled={isSending}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={
                notificationType === 'email'
                  ? 'email@example.com'
                  : '+967 xxx xxx xxx'
              }
              fullWidth
            />

            {notificationType === 'email' && (
              <TextField
                label={t('notifications.subject')}
                value={subject}
                disabled={isSending}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
              />
            )}

            <TextField
              label={t('notifications.message')}
              value={message}
              disabled={isSending}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog} disabled={isSending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSendNotification} variant="contained" disabled={isSending}>
            {isSending ? <CircularProgress size={20} color="inherit" /> : t('notifications.send')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Setup Guide Dialog */}
      <Dialog open={guideDialogOpen} onClose={() => setGuideDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('notifications.setupGuideTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('notifications.setupGuideIntro')}
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2">
              {t('notifications.setupGuideSettings')}
            </Typography>
            <Typography component="li" variant="body2">
              {t('notifications.setupGuideSave')}
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1">{t('notifications.smsTitle')}</Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <Typography component="li" variant="body2">{t('notifications.smsStep1')}</Typography>
                <Typography component="li" variant="body2">{t('notifications.smsStep2')}</Typography>
                <Typography component="li" variant="body2">{t('notifications.smsStep3')}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1">{t('notifications.whatsappTitle')}</Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <Typography component="li" variant="body2">{t('notifications.whatsappStep1')}</Typography>
                <Typography component="li" variant="body2">{t('notifications.whatsappStep2')}</Typography>
                <Typography component="li" variant="body2">{t('notifications.whatsappStep3')}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1">{t('notifications.emailTitle')}</Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <Typography component="li" variant="body2">{t('notifications.emailStep1')}</Typography>
                <Typography component="li" variant="body2">{t('notifications.emailStep2')}</Typography>
                <Typography component="li" variant="body2">{t('notifications.emailStep3')}</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGuideDialogOpen(false)}>{t('common.close')}</Button>
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
                disabled={isCreatingTemplate}
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
              disabled={isCreatingTemplate}
              onChange={(e) => setTemplateName(e.target.value)}
              fullWidth
            />

            <TextField
              label={t('notifications.subject')}
              value={templateSubject}
              disabled={isCreatingTemplate}
              onChange={(e) => setTemplateSubject(e.target.value)}
              fullWidth
            />

            <TextField
              label={t('notifications.body')}
              value={templateBody}
              disabled={isCreatingTemplate}
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
          <Button onClick={handleCloseTemplateDialog} disabled={isCreatingTemplate}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateTemplate} variant="contained" disabled={isCreatingTemplate}>
            {isCreatingTemplate ? <CircularProgress size={20} color="inherit" /> : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        title={t('notifications.confirmDeleteTemplate')}
        message={t('notifications.deleteTemplateWarning')}
        onConfirm={() => confirmDelete.id && deleteTemplate.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        loading={deleteTemplate.isPending}
      />

      {SnackbarComponent}
    </Box>
  );
}
