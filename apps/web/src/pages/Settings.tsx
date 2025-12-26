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

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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
  Palette as PaletteIcon,

  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  FormatListNumbered as FormatListNumberedIcon,

  NotificationsActive as NotificationsActiveIcon,
  Description as DescriptionIcon,
  Timer as TimerIcon,


  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationCity as LocationCityIcon,
} from '@mui/icons-material';
import api from '../lib/api';
import { useSnackbar } from '../hooks/useSnackbar';
import ServiceFormDialog from '../components/ServiceFormDialog';
import BuildingSettings from '../components/BuildingSettings';

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
  const { showSnackbar, SnackbarComponent } = useSnackbar();
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

  // Fetch services
  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data;
    },
  });
  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const res = await api.get('/buildings');
      return res.data.data || res.data || [];
    },
  });
  const buildingOptions = React.useMemo(() => {
    const raw = buildings as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    return [];
  }, [buildings]);

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    phone: '',
    address: '',
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
    // Advanced Notification Settings
    smsApiKey: '',
    smsSenderId: '',
    whatsappApiKey: '',
    whatsappPhoneNumber: '',
    emailSmtpHost: '',
    emailSmtpPort: 587,
    emailSmtpUser: '',
    emailSmtpPassword: '',
    emailFromAddress: '',
    emailFromName: '',
    // Sending Schedule
    sendingStartTime: '08:00',
    sendingEndTime: '20:00',
    enableQuietHours: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    // Retry Settings
    maxRetries: 3,
    retryIntervalMinutes: 30,
    failureAction: 'log', // 'log' | 'email_admin' | 'disable'
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Customization form state
  const [, setCustomizationForm] = useState({
    primaryColor: '#19d238ff',
    secondaryColor: '#0b00dcff',
    accentColor: '#c77913ff',
    invoiceTemplate: 'modern',
    showInvoiceLogo: true,
    showInvoiceColors: true,
    invoiceLogoPosition: 'right',
  });

  // Invoice Settings form state
  const [invoiceForm, setInvoiceForm] = useState({
    // Display Options
    showInvoiceHeader: true,
    showInvoiceFooter: true,
    showCustomerDetails: true,
    showUnitDetails: true,
    showContractDetails: false,
    showPaymentTerms: false,
    showTaxBreakdown: true,
    // Tax & Discount
    defaultTaxRate: 0,
    enableDiscount: false,
    defaultDiscountPercent: 0,
    // Custom Text
    invoiceHeaderText: '',
    invoiceFooterText: '',
    invoiceNotes: '',
    paymentInstructions: '',
    // Page Settings
    invoicePageSize: 'A4',
    invoiceOrientation: 'portrait',
  });

  // Services & Meters Settings form state
  const [servicesForm, setServicesForm] = useState({
    // Meter Pricing
    electricityPricePerUnit: 0,
    waterPricePerUnit: 0,
    enableTieredPricing: false,
    electricityTiers: [] as Array<{min: number, max: number, price: number}>,
    waterTiers: [] as Array<{min: number, max: number, price: number}>,
    electricityFixedCharge: 0,
    waterFixedCharge: 0,
    // Meter Settings
    meterReadingUnit: 'unit',
    requireApprovalForServices: false,
    allowNegativeReadings: false,
    maxConsumptionLimit: 0,
    serviceBuildingIds: [] as string[],
  });

  // Advanced Settings form state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const [advancedForm, setAdvancedForm] = useState({
    // Invoice Customization
    mergedServices: [] as string[],
    showServiceDetails: true,
    invoiceItemOrder: 'service-rent-meter',
    customInvoiceDescription: '',
    // Number & Date Formatting
    dateFormat: 'DD/MM/YYYY',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    currencyPosition: 'before',
    // Automatic Notifications
    autoSendInvoice: true,
    reminderDaysBefore: 3,
    overdueNotificationDays: 1,
    sendPaymentConfirmation: true,
    // Contract Settings
    autoRenewContracts: false,
    contractExpiryNoticeDays: 30,
    defaultRenewalIncreasePercent: 0,
    // System Preferences
    defaultPageSize: 25,
    defaultLandingPage: '/dashboard',
    sessionTimeoutMinutes: 480,
  });

  // Update form when company data loads
  React.useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        phone: company.phone || '',
        address: company.address || '',
        currency: company.currency || 'YER',
        defaultLanguage: company.defaultLanguage || 'ar',
        mergeServicesWithRent: company.mergeServicesWithRent ?? true,
        logo: company.logo,
      });
      setCustomizationForm({
        primaryColor: company.primaryColor || '#1976d2',
        secondaryColor: company.secondaryColor || '#dc004e',
        accentColor: company.accentColor || '#2e7d32',
        invoiceTemplate: company.invoiceTemplate || 'modern',
        showInvoiceLogo: company.showInvoiceLogo ?? true,
        showInvoiceColors: company.showInvoiceColors ?? true,
        invoiceLogoPosition: company.invoiceLogoPosition || 'right',
      });
      setInvoiceForm({
        // Display Options
        showInvoiceHeader: company.showInvoiceHeader ?? true,
        showInvoiceFooter: company.showInvoiceFooter ?? true,
        showCustomerDetails: company.showCustomerDetails ?? true,
        showUnitDetails: company.showUnitDetails ?? true,
        showContractDetails: company.showContractDetails ?? false,
        showPaymentTerms: company.showPaymentTerms ?? false,
        showTaxBreakdown: company.showTaxBreakdown ?? true,
        // Tax & Discount
        defaultTaxRate: company.defaultTaxRate ?? 0,
        enableDiscount: company.enableDiscount ?? false,
        defaultDiscountPercent: company.defaultDiscountPercent ?? 0,
        // Custom Text
        invoiceHeaderText: company.invoiceHeaderText || '',
        invoiceFooterText: company.invoiceFooterText || '',
        invoiceNotes: company.invoiceNotes || '',
        paymentInstructions: company.paymentInstructions || '',
        // Page Settings
        invoicePageSize: company.invoicePageSize || 'A4',
        invoiceOrientation: company.invoiceOrientation || 'portrait',
      });
      setServicesForm({
        // Meter Pricing
        electricityPricePerUnit: company.electricityPricePerUnit ?? 0,
        waterPricePerUnit: company.waterPricePerUnit ?? 0,
        enableTieredPricing: company.enableTieredPricing ?? false,
        electricityTiers: company.electricityTiers || [],
        waterTiers: company.waterTiers || [],
        electricityFixedCharge: company.electricityFixedCharge ?? 0,
        waterFixedCharge: company.waterFixedCharge ?? 0,
        // Meter Settings
        meterReadingUnit: company.meterReadingUnit || 'unit',
        requireApprovalForServices: company.requireApprovalForServices ?? false,
        allowNegativeReadings: company.allowNegativeReadings ?? false,
        maxConsumptionLimit: company.maxConsumptionLimit ?? 0,
        serviceBuildingIds: [],
      });
      setAdvancedForm({
        // Invoice Customization
        mergedServices: company.mergedServices || [],
        showServiceDetails: company.showServiceDetails ?? true,
        invoiceItemOrder: company.invoiceItemOrder || 'service-rent-meter',
        customInvoiceDescription: company.customInvoiceDescription || '',
        // Number & Date Formatting
        dateFormat: company.dateFormat || 'DD/MM/YYYY',
        thousandsSeparator: company.thousandsSeparator || ',',
        decimalPlaces: company.decimalPlaces ?? 2,
        currencyPosition: company.currencyPosition || 'before',
        // Automatic Notifications
        autoSendInvoice: company.autoSendInvoice ?? true,
        reminderDaysBefore: company.reminderDaysBefore ?? 3,
        overdueNotificationDays: company.overdueNotificationDays ?? 1,
        sendPaymentConfirmation: company.sendPaymentConfirmation ?? true,
        // Contract Settings
        autoRenewContracts: company.autoRenewContracts ?? false,
        contractExpiryNoticeDays: company.contractExpiryNoticeDays ?? 30,
        defaultRenewalIncreasePercent: company.defaultRenewalIncreasePercent ?? 0,
        // System Preferences
        defaultPageSize: company.defaultPageSize ?? 25,
        defaultLandingPage: company.defaultLandingPage || '/dashboard',
        sessionTimeoutMinutes: company.sessionTimeoutMinutes ?? 480,
      });
    }
  }, [company]);

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch('/companies/my-company', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      showSnackbar(t('settings.company.updated'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (_data: any) => {
      // TODO: Implement backend endpoint
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      showSnackbar(t('settings.notifications.updated'), 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/change-password', data);
      return res.data;
    },
    onSuccess: () => {
      showSnackbar(t('settings.security.passwordChanged'), 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  // Service CRUD mutations
  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/services', data);
      return res.data;
    },
    onSuccess: () => {
      showSnackbar(t('services.created'), 'success');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setServiceDialogOpen(false);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/services/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      showSnackbar(t('services.updated'), 'success');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setServiceDialogOpen(false);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/services/${id}`);
      return res.data;
    },
    onSuccess: () => {
      showSnackbar(t('services.deleted'), 'success');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setDeleteConfirmOpen(false);
      setDeletingServiceId(null);
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || t('common.error'), 'error');
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
      showSnackbar(t('settings.security.passwordMismatch'), 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showSnackbar(t('settings.security.passwordTooShort'), 'error');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleDeleteService = (id: string) => {
    setDeletingServiceId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteService = () => {
    if (deletingServiceId) {
      deleteServiceMutation.mutate(deletingServiceId);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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
            icon={<LocationCityIcon />}
            iconPosition="start"
            label={t('settings.buildings.title')}
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
          <Tab
            icon={<PaletteIcon />}
            iconPosition="start"
            label={t('settings.customization.title')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<ReceiptIcon />}
            iconPosition="start"
            label={t('settings.invoice.title')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<SettingsIcon />}
            iconPosition="start"
            label={t('settings.services.title')}
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
                    label={t('settings.company.phone')}
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('settings.company.address')}
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
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
                            <img src={companyForm.logo} alt={t('settings.language.companyLogo')} style={{ maxHeight: 100, maxWidth: 300, objectFit: 'contain' }} />
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

        {/* Buildings Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <BuildingSettings />
        </TabPanel>

        {/* Language Settings Tab */}
        <TabPanel value={tabValue} index={2}>
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
                          ? t('settings.language.currentStatus')
                          : t('settings.language.currentStatusEn')
                        }
                      </Typography>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          const newLang = i18n.language === 'en' ? 'ar' : 'en';
                          i18n.changeLanguage(newLang);
                          document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                          showSnackbar(t('settings.language.changed'), 'success');
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
                          primary={t('settings.language.arabicName')}
                          secondary={t('settings.language.arabicSupport')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('settings.language.englishName')}
                          secondary={t('settings.language.englishSupport')}
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
        <TabPanel value={tabValue} index={3}>
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

                {/* Advanced Notification Settings */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    {t('settings.notifications.advanced.title')}
                  </Typography>
                </Grid>

                {/* 1. Channel Configuration */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <SettingsIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {t('settings.notifications.advanced.channelConfig')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('settings.notifications.advanced.channelConfigDesc')}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        {/* SMS Configuration */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            {t('settings.notifications.advanced.smsConfig')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.smsApiKey')}
                            value={notificationsForm.smsApiKey}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, smsApiKey: e.target.value })}
                            type="password"
                            disabled={!notificationsForm.smsEnabled}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.smsSenderId')}
                            value={notificationsForm.smsSenderId}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, smsSenderId: e.target.value })}
                            disabled={!notificationsForm.smsEnabled}
                          />
                        </Grid>

                        {/* WhatsApp Configuration */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                            {t('settings.notifications.advanced.whatsappConfig')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.whatsappApiKey')}
                            value={notificationsForm.whatsappApiKey}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, whatsappApiKey: e.target.value })}
                            type="password"
                            disabled={!notificationsForm.whatsappEnabled}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.whatsappPhone')}
                            value={notificationsForm.whatsappPhoneNumber}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, whatsappPhoneNumber: e.target.value })}
                            disabled={!notificationsForm.whatsappEnabled}
                            placeholder="+967xxxxxxxxx"
                          />
                        </Grid>

                        {/* Email Configuration */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                            {t('settings.notifications.advanced.emailConfig')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.emailSmtpHost')}
                            value={notificationsForm.emailSmtpHost}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, emailSmtpHost: e.target.value })}
                            disabled={!notificationsForm.emailEnabled}
                            placeholder="smtp.gmail.com"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label={t('settings.notifications.advanced.emailSmtpPort')}
                            value={notificationsForm.emailSmtpPort}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, emailSmtpPort: parseInt(e.target.value) || 587 })}
                            disabled={!notificationsForm.emailEnabled}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.emailSmtpUser')}
                            value={notificationsForm.emailSmtpUser}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, emailSmtpUser: e.target.value })}
                            disabled={!notificationsForm.emailEnabled}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type="password"
                            label={t('settings.notifications.advanced.emailSmtpPassword')}
                            value={notificationsForm.emailSmtpPassword}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, emailSmtpPassword: e.target.value })}
                            disabled={!notificationsForm.emailEnabled}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.emailFromAddress')}
                            value={notificationsForm.emailFromAddress}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, emailFromAddress: e.target.value })}
                            disabled={!notificationsForm.emailEnabled}
                            placeholder="noreply@example.com"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label={t('settings.notifications.advanced.emailFromName')}
                            value={notificationsForm.emailFromName}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, emailFromName: e.target.value })}
                            disabled={!notificationsForm.emailEnabled}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 2. Sending Schedule */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                          <TimerIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {t('settings.notifications.advanced.sendingSchedule')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('settings.notifications.advanced.sendingScheduleDesc')}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type="time"
                            label={t('settings.notifications.advanced.sendingStartTime')}
                            value={notificationsForm.sendingStartTime}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, sendingStartTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type="time"
                            label={t('settings.notifications.advanced.sendingEndTime')}
                            value={notificationsForm.sendingEndTime}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, sendingEndTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={notificationsForm.enableQuietHours}
                                onChange={(e) => setNotificationsForm({ ...notificationsForm, enableQuietHours: e.target.checked })}
                              />
                            }
                            label={t('settings.notifications.advanced.enableQuietHours')}
                          />
                        </Grid>
                        {notificationsForm.enableQuietHours && (
                          <>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                type="time"
                                label={t('settings.notifications.advanced.quietHoursStart')}
                                value={notificationsForm.quietHoursStart}
                                onChange={(e) => setNotificationsForm({ ...notificationsForm, quietHoursStart: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                type="time"
                                label={t('settings.notifications.advanced.quietHoursEnd')}
                                value={notificationsForm.quietHoursEnd}
                                onChange={(e) => setNotificationsForm({ ...notificationsForm, quietHoursEnd: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 3. Retry Settings */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                          <NotificationsActiveIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {t('settings.notifications.advanced.retrySettings')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('settings.notifications.advanced.retrySettingsDesc')}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label={t('settings.notifications.advanced.maxRetries')}
                            value={notificationsForm.maxRetries}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, maxRetries: parseInt(e.target.value) || 0 })}
                            inputProps={{ min: 0, max: 10 }}
                            helperText={t('settings.notifications.advanced.maxRetriesHelp')}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label={t('settings.notifications.advanced.retryInterval')}
                            value={notificationsForm.retryIntervalMinutes}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, retryIntervalMinutes: parseInt(e.target.value) || 0 })}
                            inputProps={{ min: 1, max: 1440 }}
                            helperText={t('settings.notifications.advanced.retryIntervalHelp')}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            select
                            label={t('settings.notifications.advanced.failureAction')}
                            value={notificationsForm.failureAction}
                            onChange={(e) => setNotificationsForm({ ...notificationsForm, failureAction: e.target.value })}
                          >
                            <MenuItem value="log">{t('settings.notifications.advanced.failureActionLog')}</MenuItem>
                            <MenuItem value="email_admin">{t('settings.notifications.advanced.failureActionEmail')}</MenuItem>
                            <MenuItem value="disable">{t('settings.notifications.advanced.failureActionDisable')}</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setNotificationsForm({
                          smsEnabled: true,
                          whatsappEnabled: true,
                          emailEnabled: true,
                          smsApiKey: '',
                          smsSenderId: '',
                          whatsappApiKey: '',
                          whatsappPhoneNumber: '',
                          emailSmtpHost: '',
                          emailSmtpPort: 587,
                          emailSmtpUser: '',
                          emailSmtpPassword: '',
                          emailFromAddress: '',
                          emailFromName: '',
                          sendingStartTime: '08:00',
                          sendingEndTime: '20:00',
                          enableQuietHours: true,
                          quietHoursStart: '22:00',
                          quietHoursEnd: '08:00',
                          maxRetries: 3,
                          retryIntervalMinutes: 30,
                          failureAction: 'log',
                        });
                      }}
                    >
                      {t('common.reset')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<SaveIcon />}
                      disabled={updateNotificationsMutation.isPending}
                    >
                      {t('common.save')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </TabPanel>

        {/* Security Settings Tab */}
        <TabPanel value={tabValue} index={4}>
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

        {/* Advanced Customization Tab */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {t('settings.advanced.title')}
            </Typography>

            {/* 1. Invoice Customization Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('settings.advanced.invoiceCustomization')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.advanced.invoiceCustomizationDesc')}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.advanced.invoiceItemOrder')}
                      value={advancedForm.invoiceItemOrder}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, invoiceItemOrder: e.target.value })}
                    >
                      <MenuItem value="service-rent-meter">{t('settings.advanced.orderServiceRentMeter')}</MenuItem>
                      <MenuItem value="rent-service-meter">{t('settings.advanced.orderRentServiceMeter')}</MenuItem>
                      <MenuItem value="meter-service-rent">{t('settings.advanced.orderMeterServiceRent')}</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advancedForm.showServiceDetails}
                          onChange={(e) => setAdvancedForm({ ...advancedForm, showServiceDetails: e.target.checked })}
                        />
                      }
                      label={t('settings.advanced.showServiceDetails')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('settings.advanced.customInvoiceDescription')}
                      value={advancedForm.customInvoiceDescription}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, customInvoiceDescription: e.target.value })}
                      placeholder={t('settings.advanced.customInvoiceDescPlaceholder')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 2. Number & Date Formatting Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <FormatListNumberedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('settings.advanced.numberDateFormat')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.advanced.numberDateFormatDesc')}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.advanced.dateFormat')}
                      value={advancedForm.dateFormat}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, dateFormat: e.target.value })}
                    >
                      <MenuItem value="DD/MM/YYYY">{t('settings.advanced.dateFormatDMY')}</MenuItem>
                      <MenuItem value="MM/DD/YYYY">{t('settings.advanced.dateFormatMDY')}</MenuItem>
                      <MenuItem value="YYYY-MM-DD">{t('settings.advanced.dateFormatYMD')}</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.advanced.thousandsSeparator')}
                      value={advancedForm.thousandsSeparator}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, thousandsSeparator: e.target.value })}
                    >
                      <MenuItem value=",">{t('settings.advanced.separatorComma')}</MenuItem>
                      <MenuItem value=".">{t('settings.advanced.separatorPeriod')}</MenuItem>
                      <MenuItem value=" ">{t('settings.advanced.separatorSpace')}</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('settings.advanced.decimalPlaces')}
                      value={advancedForm.decimalPlaces}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, decimalPlaces: parseInt(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 4 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.advanced.currencyPosition')}
                      value={advancedForm.currencyPosition}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, currencyPosition: e.target.value })}
                    >
                      <MenuItem value="before">{t('settings.advanced.currencyBefore')} (YER 1,000)</MenuItem>
                      <MenuItem value="after">{t('settings.advanced.currencyAfter')} (1,000 YER)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 3. Automatic Notifications Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <NotificationsActiveIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('settings.advanced.autoNotifications')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.advanced.autoNotificationsDesc')}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advancedForm.autoSendInvoice}
                          onChange={(e) => setAdvancedForm({ ...advancedForm, autoSendInvoice: e.target.checked })}
                        />
                      }
                      label={t('settings.advanced.autoSendInvoice')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advancedForm.sendPaymentConfirmation}
                          onChange={(e) => setAdvancedForm({ ...advancedForm, sendPaymentConfirmation: e.target.checked })}
                        />
                      }
                      label={t('settings.advanced.sendPaymentConfirmation')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('settings.advanced.reminderDaysBefore')}
                      value={advancedForm.reminderDaysBefore}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, reminderDaysBefore: parseInt(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 30 }}
                      helperText={t('settings.advanced.reminderDaysBeforeHelp')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('settings.advanced.overdueNotificationDays')}
                      value={advancedForm.overdueNotificationDays}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, overdueNotificationDays: parseInt(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 30 }}
                      helperText={t('settings.advanced.overdueNotificationDaysHelp')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 4. Contract Settings Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('settings.advanced.contractSettings')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.advanced.contractSettingsDesc')}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advancedForm.autoRenewContracts}
                          onChange={(e) => setAdvancedForm({ ...advancedForm, autoRenewContracts: e.target.checked })}
                        />
                      }
                      label={t('settings.advanced.autoRenewContracts')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('settings.advanced.contractExpiryNoticeDays')}
                      value={advancedForm.contractExpiryNoticeDays}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, contractExpiryNoticeDays: parseInt(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 90 }}
                      helperText={t('settings.advanced.contractExpiryNoticeDaysHelp')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('settings.advanced.defaultRenewalIncreasePercent')}
                      value={advancedForm.defaultRenewalIncreasePercent}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, defaultRenewalIncreasePercent: parseInt(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 100 }}
                      helperText={t('settings.advanced.defaultRenewalIncreasePercentHelp')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 5. System Preferences Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <SettingsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t('settings.advanced.systemPreferences')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.advanced.systemPreferencesDesc')}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.advanced.defaultPageSize')}
                      value={advancedForm.defaultPageSize}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, defaultPageSize: parseInt(e.target.value) })}
                    >
                      <MenuItem value={10}>10 {t('settings.advanced.rowsPerPage')}</MenuItem>
                      <MenuItem value={25}>25 {t('settings.advanced.rowsPerPage')}</MenuItem>
                      <MenuItem value={50}>50 {t('settings.advanced.rowsPerPage')}</MenuItem>
                      <MenuItem value={100}>100 {t('settings.advanced.rowsPerPage')}</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.advanced.defaultLandingPage')}
                      value={advancedForm.defaultLandingPage}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, defaultLandingPage: e.target.value })}
                    >
                      <MenuItem value="/dashboard">{t('nav.dashboard')}</MenuItem>
                      <MenuItem value="/units">{t('nav.units')}</MenuItem>
                      <MenuItem value="/contracts">{t('nav.contracts')}</MenuItem>
                      <MenuItem value="/invoices">{t('nav.invoices')}</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('settings.advanced.sessionTimeoutMinutes')}
                      value={advancedForm.sessionTimeoutMinutes}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, sessionTimeoutMinutes: parseInt(e.target.value) || 0 })}
                      inputProps={{ min: 30, max: 1440 }}
                      helperText={t('settings.advanced.sessionTimeoutMinutesHelp')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (company) {
                    setAdvancedForm({
                      mergedServices: company.mergedServices || [],
                      showServiceDetails: company.showServiceDetails ?? true,
                      invoiceItemOrder: company.invoiceItemOrder || 'service-rent-meter',
                      customInvoiceDescription: company.customInvoiceDescription || '',
                      dateFormat: company.dateFormat || 'DD/MM/YYYY',
                      thousandsSeparator: company.thousandsSeparator || ',',
                      decimalPlaces: company.decimalPlaces ?? 2,
                      currencyPosition: company.currencyPosition || 'before',
                      autoSendInvoice: company.autoSendInvoice ?? true,
                      reminderDaysBefore: company.reminderDaysBefore ?? 3,
                      overdueNotificationDays: company.overdueNotificationDays ?? 1,
                      sendPaymentConfirmation: company.sendPaymentConfirmation ?? true,
                      autoRenewContracts: company.autoRenewContracts ?? false,
                      contractExpiryNoticeDays: company.contractExpiryNoticeDays ?? 30,
                      defaultRenewalIncreasePercent: company.defaultRenewalIncreasePercent ?? 0,
                      defaultPageSize: company.defaultPageSize ?? 25,
                      defaultLandingPage: company.defaultLandingPage || '/dashboard',
                      sessionTimeoutMinutes: company.sessionTimeoutMinutes ?? 480,
                    });
                  }
                }}
              >
                {t('common.reset')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => updateCompanyMutation.mutate(advancedForm)}
                disabled={updateCompanyMutation.isPending}
                size="large"
              >
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Invoice Customization Tab */}
        <TabPanel value={tabValue} index={6}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {t('settings.invoice.title')}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('settings.invoice.description')}
            </Alert>

            {/* Invoice Display Options */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" />
                  {t('settings.invoice.displayOptions')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.showInvoiceHeader} 
                          onChange={(e) => setInvoiceForm({...invoiceForm, showInvoiceHeader: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.showHeader')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.showInvoiceFooter} 
                          onChange={(e) => setInvoiceForm({...invoiceForm, showInvoiceFooter: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.showFooter')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.showCustomerDetails} 
                          onChange={(e) => setInvoiceForm({...invoiceForm, showCustomerDetails: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.showCustomerDetails')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.showUnitDetails} 
                          onChange={(e) => setInvoiceForm({...invoiceForm, showUnitDetails: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.showUnitDetails')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.showContractDetails} 
                          onChange={(e) => setInvoiceForm({...invoiceForm, showContractDetails: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.showContractDetails')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.showPaymentTerms} 
                          onChange={(e) => setInvoiceForm({...invoiceForm, showPaymentTerms: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.showPaymentTerms')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tax & Discount Settings */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="primary" />
                  {t('settings.invoice.taxAndDiscount')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('settings.invoice.defaultTaxRate')}
                      type="number"
                      value={invoiceForm.defaultTaxRate}
                      onChange={(e) => setInvoiceForm({...invoiceForm, defaultTaxRate: parseFloat(e.target.value) || 0})}
                      InputProps={{ endAdornment: '%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.enableDiscount}
                          onChange={(e) => setInvoiceForm({...invoiceForm, enableDiscount: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.enableDiscount')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('settings.invoice.defaultDiscountPercent')}
                      type="number"
                      value={invoiceForm.defaultDiscountPercent}
                      onChange={(e) => setInvoiceForm({...invoiceForm, defaultDiscountPercent: parseFloat(e.target.value) || 0})}
                      InputProps={{ endAdornment: '%' }}
                      disabled={!invoiceForm.enableDiscount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={invoiceForm.showTaxBreakdown}
                          onChange={(e) => setInvoiceForm({...invoiceForm, showTaxBreakdown: e.target.checked})}
                        />
                      }
                      label={t('settings.invoice.showTaxBreakdown')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Custom Text Fields */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="primary" />
                  {t('settings.invoice.customText')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('settings.invoice.headerText')}
                      multiline
                      rows={2}
                      value={invoiceForm.invoiceHeaderText}
                      onChange={(e) => setInvoiceForm({...invoiceForm, invoiceHeaderText: e.target.value})}
                      placeholder={t('settings.invoice.headerTextPlaceholder')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('settings.invoice.footerText')}
                      multiline
                      rows={2}
                      value={invoiceForm.invoiceFooterText}
                      onChange={(e) => setInvoiceForm({...invoiceForm, invoiceFooterText: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('settings.invoice.notes')}
                      multiline
                      rows={3}
                      value={invoiceForm.invoiceNotes}
                      onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNotes: e.target.value})}
                      placeholder={t('settings.invoice.notesPlaceholder')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('settings.invoice.paymentInstructions')}
                      multiline
                      rows={3}
                      value={invoiceForm.paymentInstructions}
                      onChange={(e) => setInvoiceForm({...invoiceForm, paymentInstructions: e.target.value})}
                      placeholder={t('settings.invoice.paymentInstructionsPlaceholder')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Page Settings */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="primary" />
                  {t('settings.invoice.pageSettings')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.invoice.pageSize')}
                      value={invoiceForm.invoicePageSize}
                      onChange={(e) => setInvoiceForm({...invoiceForm, invoicePageSize: e.target.value})}
                    >
                      <MenuItem value="A4">A4</MenuItem>
                      <MenuItem value="Letter">Letter</MenuItem>
                      <MenuItem value="A5">A5</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label={t('settings.invoice.orientation')}
                      value={invoiceForm.invoiceOrientation}
                      onChange={(e) => setInvoiceForm({...invoiceForm, invoiceOrientation: e.target.value})}
                    >
                      <MenuItem value="portrait">{t('settings.invoice.portrait')}</MenuItem>
                      <MenuItem value="landscape">{t('settings.invoice.landscape')}</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => {
                  if (company) {
                    setInvoiceForm({
                      showInvoiceHeader: company.showInvoiceHeader ?? true,
                      showInvoiceFooter: company.showInvoiceFooter ?? true,
                      showCustomerDetails: company.showCustomerDetails ?? true,
                      showUnitDetails: company.showUnitDetails ?? true,
                      showContractDetails: company.showContractDetails ?? false,
                      showPaymentTerms: company.showPaymentTerms ?? false,
                      showTaxBreakdown: company.showTaxBreakdown ?? true,
                      defaultTaxRate: company.defaultTaxRate ?? 0,
                      enableDiscount: company.enableDiscount ?? false,
                      defaultDiscountPercent: company.defaultDiscountPercent ?? 0,
                      invoiceHeaderText: company.invoiceHeaderText || '',
                      invoiceFooterText: company.invoiceFooterText || '',
                      invoiceNotes: company.invoiceNotes || '',
                      paymentInstructions: company.paymentInstructions || '',
                      invoicePageSize: company.invoicePageSize || 'A4',
                      invoiceOrientation: company.invoiceOrientation || 'portrait',
                    });
                  }
                }}
              >
                {t('common.reset')}
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />} 
                size="large"
                onClick={() => updateCompanyMutation.mutate(invoiceForm)}
                disabled={updateCompanyMutation.isPending}
              >
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Services Management Tab */}
        <TabPanel value={tabValue} index={7}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {t('settings.services.title')}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('settings.services.description')}
            </Alert>

            {/* Meter Pricing
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon color="primary" />
                  {t('settings.services.meterPricing')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      ⚡ {t('settings.services.electricity')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('settings.services.electricityPricePerUnit')}
                      type="number"
                      value={servicesForm.electricityPricePerUnit}
                      onChange={(e) => setServicesForm({...servicesForm, electricityPricePerUnit: parseFloat(e.target.value) || 0})}
                      InputProps={{ endAdornment: t('settings.services.perUnit') }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('settings.services.fixedCharge')}
                      type="number"
                      value={servicesForm.electricityFixedCharge}
                      onChange={(e) => setServicesForm({...servicesForm, electricityFixedCharge: parseFloat(e.target.value) || 0})}
                      InputProps={{ endAdornment: t('common.currency') }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      💧 {t('settings.services.water')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('settings.services.waterPricePerUnit')}
                      type="number"
                      value={servicesForm.waterPricePerUnit}
                      onChange={(e) => setServicesForm({...servicesForm, waterPricePerUnit: parseFloat(e.target.value) || 0})}
                      InputProps={{ endAdornment: t('settings.services.perUnit') }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('settings.services.fixedCharge')}
                      type="number"
                      value={servicesForm.waterFixedCharge}
                      onChange={(e) => setServicesForm({...servicesForm, waterFixedCharge: parseFloat(e.target.value) || 0})}
                      InputProps={{ endAdornment: t('common.currency') }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={servicesForm.enableTieredPricing}
                          onChange={(e) => setServicesForm({...servicesForm, enableTieredPricing: e.target.checked})}
                        />
                      }
                      label={t('settings.services.enableTieredPricing')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card> */}

            {/* Custom Services CRUD */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" />
                    {t('settings.services.customServices')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => {
                      setServiceDialogOpen(true);
                      setEditingService(null);
                      setServicesForm((prev) => ({ ...prev, serviceBuildingIds: [] }));
                    }}
                  >
                    {t('settings.services.addService')}
                  </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('settings.services.customServicesDescription')}
                </Typography>
                
                {/* Service List */}
                {servicesQuery.isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : servicesQuery.data?.data?.length === 0 ? (
                  <Alert severity="info">
                    {t('settings.services.noCustomServices')}
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('services.name')}</TableCell>
                          <TableCell>{t('services.type')}</TableCell>
                          <TableCell>{t('services.defaultPrice')}</TableCell>
                          <TableCell>{t('services.status')}</TableCell>
                          <TableCell align="right">{t('common.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {servicesQuery.data?.data?.map((service: any) => (
                          <TableRow key={service._id}>
                            <TableCell>{service.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={t(`services.types.${service.type}`)} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{service.defaultPrice}</TableCell>
                            <TableCell>
                              <Chip 
                                label={service.isActive ? t('common.active') : t('common.inactive')} 
                                size="small" 
                                color={service.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setEditingService(service);
                                  const fromService = (service as any).buildingIds || [];
                                  const derived =
                                    fromService.length > 0
                                      ? fromService
                                      : buildingOptions
                                          .filter((b: any) =>
                                            (b?.services || []).some((s: any) => (s?._id ?? s) === service._id),
                                          )
                                          .map((b: any) => b._id);
                                  setServicesForm((prev) => ({
                                    ...prev,
                                    serviceBuildingIds: derived,
                                  }));
                                  setServiceDialogOpen(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteService(service._id)}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => {
                  if (company) {
                    setServicesForm({
                      electricityPricePerUnit: company.electricityPricePerUnit ?? 0,
                      waterPricePerUnit: company.waterPricePerUnit ?? 0,
                      enableTieredPricing: company.enableTieredPricing ?? false,
                      electricityTiers: company.electricityTiers || [],
                      waterTiers: company.waterTiers || [],
                      electricityFixedCharge: company.electricityFixedCharge ?? 0,
                      waterFixedCharge: company.waterFixedCharge ?? 0,
                      meterReadingUnit: company.meterReadingUnit || 'unit',
                      requireApprovalForServices: company.requireApprovalForServices ?? false,
                      allowNegativeReadings: company.allowNegativeReadings ?? false,
                      maxConsumptionLimit: company.maxConsumptionLimit ?? 0,
                      serviceBuildingIds: [],
                    });
                  }
                }}
              >
                {t('common.reset')}
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />} 
                size="large"
                onClick={() => updateCompanyMutation.mutate(servicesForm)}
                disabled={updateCompanyMutation.isPending}
              >
                {t('common.save')}
              </Button>
            </Box>
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
              © 2025 {company?.name || 'Aqarat Property Management'}
            </Typography>
          </Grid>
        </Grid>
       </Paper>

      {/* Service Form Dialog */}
      <ServiceFormDialog
        open={serviceDialogOpen}
        onClose={() => {
          setServiceDialogOpen(false);
          setEditingService(null);
          setServicesForm((prev) => ({ ...prev, serviceBuildingIds: [] }));
        }}
        onSubmit={(data) => {
          if (editingService) {
            updateServiceMutation.mutate({
              id: editingService._id,
              data: { ...data, buildingIds: servicesForm.serviceBuildingIds },
            });
          } else {
            createServiceMutation.mutate({
              ...data,
              buildingIds: servicesForm.serviceBuildingIds,
            });
          }
        }}
        initialData={editingService ? {
          name: editingService.name || '',
          description: editingService.description || '',
          type: editingService.type || 'fixed_fee',
          defaultPrice: editingService.defaultPrice || 0,
          unit: editingService.unit || 'month',
          category: editingService.category || 'utilities',
          taxRate: editingService.taxRate || 0,
          isActive: editingService.isActive ?? true,
          requiresApproval: editingService.requiresApproval ?? false,
        } : null}
        isLoading={createServiceMutation.isPending || updateServiceMutation.isPending}
        buildings={buildingOptions}
        selectedBuildingIds={servicesForm.serviceBuildingIds}
        onChangeBuildings={(ids) =>
          setServicesForm((prev) => ({ ...prev, serviceBuildingIds: ids || [] }))
        }
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingServiceId(null);
        }}
      >
        <DialogTitle>{t('services.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('services.deleteConfirmMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeletingServiceId(null);
            }}
            disabled={deleteServiceMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={confirmDeleteService}
            color="error"
            variant="contained"
            disabled={deleteServiceMutation.isPending}
          >
            {deleteServiceMutation.isPending ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {SnackbarComponent}
    </Box>
  );
};
export default Settings;
