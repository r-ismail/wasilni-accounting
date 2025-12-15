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
} from '@mui/material';
import {
  Business as BusinessIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
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
  });

  // Update form when company data loads
  React.useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        currency: company.currency || 'YER',
        defaultLanguage: company.defaultLanguage || 'ar',
        mergeServicesWithRent: company.mergeServicesWithRent ?? true,
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

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(companyForm);
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('nav.settings')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('settings.description')}
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
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
        </Tabs>

        {/* Company Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <form onSubmit={handleCompanySubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
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
                    <MenuItem value="YER">YER - Yemeni Rial (ريال يمني)</MenuItem>
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="SAR">SAR - Saudi Riyal</MenuItem>
                    <MenuItem value="AED">AED - UAE Dirham</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
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
                    <MenuItem value="ar">العربية (Arabic)</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={companyForm.mergeServicesWithRent}
                        onChange={(e) => setCompanyForm({ ...companyForm, mergeServicesWithRent: e.target.checked })}
                      />
                    }
                    label={t('settings.company.mergeServices')}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, ml: 4 }}>
                    {t('settings.company.mergeServicesHelp')}
                  </Typography>
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('settings.language.info')}
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">{t('settings.language.current')}</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {i18n.language === 'ar' ? 'العربية (Arabic)' : 'English'}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const newLang = i18n.language === 'en' ? 'ar' : 'en';
                        i18n.changeLanguage(newLang);
                        document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                        toast.success(t('settings.language.changed'));
                      }}
                    >
                      {t('settings.language.switch')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('settings.language.supported')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">✅ العربية (Arabic) - RTL</Typography>
                      <Typography variant="body2">✅ English - LTR</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Notifications Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('settings.notifications.info')}
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('settings.notifications.channels')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      SMS
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('settings.notifications.smsDescription')}
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={t('settings.notifications.enable')}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      WhatsApp
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('settings.notifications.whatsappDescription')}
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={t('settings.notifications.enable')}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('settings.notifications.emailDescription')}
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label={t('settings.notifications.enable')}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                >
                  {t('common.save')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Settings;
