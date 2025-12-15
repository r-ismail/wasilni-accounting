import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Sms as SmsIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch company settings
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const res = await api.get('/companies/my-company');
      return res.data.data || res.data;
    },
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    currency: 'YER',
    defaultLanguage: 'ar',
    mergeServicesWithRent: true,
    logo: undefined as string | undefined,
  });

  // Notifications form state
  const [notificationsForm, setNotificationsForm] = useState({
    smsEnabled: true,
    whatsappEnabled: true,
    emailEnabled: true,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update form when company data loads
  React.useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        currency: company.currency || 'YER',
        defaultLanguage: company.defaultLanguage || 'ar',
        mergeServicesWithRent: company.mergeServicesWithRent ?? true,
        logo: company.logo,
      });
    }
  }, [company]);

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch(`/companies/${company._id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success(t('settings.company.updated'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement backend endpoint
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast.success(t('settings.notifications.updated'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/change-password', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('settings.security.passwordChanged'));
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(companyForm);
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notificationsForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('settings.security.passwordMismatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(t('settings.security.passwordTooShort'));
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('nav.settings')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('settings.description')}
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            '& .MuiTab-root': {
              minHeight: 64,
            },
          }}
        >
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label={t('settings.company.title')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<LanguageIcon />}
            iconPosition="start"
            label={t('settings.language.title')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<NotificationsIcon />}
            iconPosition="start"
            label={t('settings.notifications.title')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<SecurityIcon />}
            iconPosition="start"
            label={t('settings.security.title')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* Company Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <form onSubmit={handleCompanySubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" icon={<InfoIcon />}>
                    {t('settings.company.info')}
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('settings.company.name')}
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('settings.company.currency')}
                    value={companyForm.currency}
                    onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                  >
                    <MenuItem value="YER">🇾🇪 YER - Yemeni Rial (ريال يمني)</MenuItem>
                    <MenuItem value="USD">🇺🇸 USD - US Dollar</MenuItem>
                    <MenuItem value="SAR">🇸🇦 SAR - Saudi Riyal</MenuItem>
                    <MenuItem value="AED">🇦🇪 AED - UAE Dirham</MenuItem>
                    <MenuItem value="EUR">🇪🇺 EUR - Euro</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('settings.company.defaultLanguage')}
                    value={companyForm.defaultLanguage}
                    onChange={(e) => setCompanyForm({ ...companyForm, defaultLanguage: e.target.value })}
                  >
                    <MenuItem value="ar">🇾🇪 العربية (Arabic)</MenuItem>
                    <MenuItem value="en">🇬🇧 English</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            🖼️ {t('settings.company.logo')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('settings.company.logoHelp')}
                          </Typography>
                        </Box>
                        {companyForm.logo && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <img src={companyForm.logo} alt="Company Logo" style={{ maxHeight: 100, maxWidth: 300, objectFit: 'contain' }} />
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<BusinessIcon />}
                        >
                          {companyForm.logo ? t('settings.company.changeLogo') : t('settings.company.uploadLogo')}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCompanyForm({ ...companyForm, logo: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </Button>
                        {companyForm.logo && (
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            onClick={() => setCompanyForm({ ...companyForm, logo: undefined })}
                          >
                            {t('settings.company.removeLogo')}
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={companyForm.mergeServicesWithRent}
                            onChange={(e) => setCompanyForm({ ...companyForm, mergeServicesWithRent: e.target.checked })}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {t('settings.company.mergeServices')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('settings.company.mergeServicesHelp')}
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={updateCompanyMutation.isPending}
                  >
                    {t('common.save')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </TabPanel>

        {/* Language Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" icon={<LanguageIcon />}>
                  {t('settings.language.info')}
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <LanguageIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{t('settings.language.current')}</Typography>
                          <Chip
                            label={i18n.language === 'ar' ? 'العربية' : 'English'}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {i18n.language === 'ar' 
                          ? 'التطبيق يعمل حالياً باللغة العربية مع دعم RTL'
                          : 'Application is currently running in English with LTR support'
                        }
                      </Typography>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const newLang = i18n.language === 'en' ? 'ar' : 'en';
                          i18n.changeLanguage(newLang);
                          document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                          toast.success(t('settings.language.changed'));
                        }}
                      >
                        {t('settings.language.switch')}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('settings.language.supported')}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="العربية (Arabic)"
                          secondary="Right-to-Left (RTL) Support"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="English"
                          secondary="Left-to-Right (LTR) Support"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Notifications Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <form onSubmit={handleNotificationsSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" icon={<NotificationsIcon />}>
                    {t('settings.notifications.info')}
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('settings.notifications.channels')}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      border: notificationsForm.smsEnabled ? 2 : 1,
                      borderColor: notificationsForm.smsEnabled ? 'primary.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <SmsIcon />
                          </Avatar>
                          <Typography variant="h6">SMS</Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {t('settings.notifications.smsDescription')}
                        </Typography>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationsForm.smsEnabled}
                              onChange={(e) => setNotificationsForm({ ...notificationsForm, smsEnabled: e.target.checked })}
                              color="primary"
                            />
                          }
                          label={t('settings.notifications.enable')}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      border: notificationsForm.whatsappEnabled ? 2 : 1,
                      borderColor: notificationsForm.whatsappEnabled ? 'success.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <WhatsAppIcon />
                          </Avatar>
                          <Typography variant="h6">WhatsApp</Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {t('settings.notifications.whatsappDescription')}
                        </Typography>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationsForm.whatsappEnabled}
                              onChange={(e) => setNotificationsForm({ ...notificationsForm, whatsappEnabled: e.target.checked })}
                              color="success"
                            />
                          }
                          label={t('settings.notifications.enable')}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      border: notificationsForm.emailEnabled ? 2 : 1,
                      borderColor: notificationsForm.emailEnabled ? 'warning.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <EmailIcon />
                          </Avatar>
                          <Typography variant="h6">Email</Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {t('settings.notifications.emailDescription')}
                        </Typography>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationsForm.emailEnabled}
                              onChange={(e) => setNotificationsForm({ ...notificationsForm, emailEnabled: e.target.checked })}
                              color="warning"
                            />
                          }
                          label={t('settings.notifications.enable')}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {t('common.save')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </TabPanel>

        {/* Security Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 3 }}>
            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="warning" icon={<SecurityIcon />}>
                    {t('settings.security.info')}
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'error.main' }}>
                            <LockIcon />
                          </Avatar>
                          <Typography variant="h6">{t('settings.security.changePassword')}</Typography>
                        </Box>

                        <TextField
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          label={t('settings.security.currentPassword')}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            ),
                          }}
                        />

                        <TextField
                          fullWidth
                          type={showNewPassword ? 'text' : 'password'}
                          label={t('settings.security.newPassword')}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          helperText={t('settings.security.passwordRequirements')}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            ),
                          }}
                        />

                        <TextField
                          fullWidth
                          type={showConfirmPassword ? 'text' : 'password'}
                          label={t('settings.security.confirmPassword')}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          error={passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword}
                          helperText={
                            passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword
                              ? t('settings.security.passwordMismatch')
                              : ''
                          }
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            ),
                          }}
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          startIcon={<LockIcon />}
                          disabled={changePasswordMutation.isPending}
                          color="error"
                        >
                          {t('settings.security.updatePassword')}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('settings.security.tips')}
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={t('settings.security.tip1')}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={t('settings.security.tip2')}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={t('settings.security.tip3')}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </form>
          </Box>
        </TabPanel>
      </Paper>

      {/* System Info Footer */}
      <Paper sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">
              {t('settings.system.version')}: 1.0.0
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">
              {t('settings.system.lastUpdate')}: {new Date().toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">
              © 2025 Wasilni Accounting
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Settings;
