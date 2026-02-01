import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';

type BuildingInput = {
  name: string;
  address?: string;
  buildingType?: string;
  furnishedUnits: {
    count: number;
    startNumber: number;
    defaultRentMonthly: number;
    defaultRentDaily?: number;
  };
  unfurnishedUnits: {
    count: number;
    startNumber: number;
    defaultRentMonthly: number;
    defaultRentDaily?: number;
  };
};

type ServiceInput = {
  name: string;
  type: 'metered' | 'fixed_fee';
  defaultPrice: number;
};

const buildingTemplate: BuildingInput = {
  name: '',
  address: '',
  buildingType: 'apartment',
  furnishedUnits: { count: 0, startNumber: 1, defaultRentMonthly: 0, defaultRentDaily: 0 },
  unfurnishedUnits: { count: 0, startNumber: 1, defaultRentMonthly: 0, defaultRentDaily: 0 },
};

const serviceTemplate: ServiceInput = { name: '', type: 'metered', defaultPrice: 0 };

export default function Onboarding() {
  const { t } = useTranslation();
  const [company, setCompany] = useState({
    name: '',
    phone: '',
    address: '',
    taxNumber: '',
    currency: 'YER',
    defaultLanguage: 'ar',
    mergeServicesWithRent: true,
  });
  const [adminUser, setAdminUser] = useState({ username: '', password: '' });
  const [buildings, setBuildings] = useState<BuildingInput[]>([]);
  const [services, setServices] = useState<ServiceInput[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        company: {
          name: company.name,
          phone: company.phone || undefined,
          address: company.address || undefined,
          taxNumber: company.taxNumber || undefined,
          currency: company.currency,
          defaultLanguage: company.defaultLanguage,
          mergeServicesWithRent: company.mergeServicesWithRent,
        },
        adminUser: adminUser,
      };

      const cleanedBuildings = buildings.filter((b) => b.name.trim()).map((b) => ({
        name: b.name,
        address: b.address || undefined,
        buildingType: b.buildingType,
        furnishedUnits: {
          count: Number(b.furnishedUnits.count) || 0,
          startNumber: Number(b.furnishedUnits.startNumber) || 1,
          defaultRentMonthly: Number(b.furnishedUnits.defaultRentMonthly) || 0,
          defaultRentDaily: Number(b.furnishedUnits.defaultRentDaily) || 0,
        },
        unfurnishedUnits: {
          count: Number(b.unfurnishedUnits.count) || 0,
          startNumber: Number(b.unfurnishedUnits.startNumber) || 1,
          defaultRentMonthly: Number(b.unfurnishedUnits.defaultRentMonthly) || 0,
          defaultRentDaily: Number(b.unfurnishedUnits.defaultRentDaily) || 0,
        },
      }));

      const cleanedServices = services.filter((s) => s.name.trim()).map((s) => ({
        name: s.name,
        type: s.type,
        defaultPrice: Number(s.defaultPrice) || 0,
      }));

      if (cleanedBuildings.length) {
        payload.buildings = cleanedBuildings;
      }
      if (cleanedServices.length) {
        payload.services = cleanedServices;
      }

      const res = await api.post('/onboarding/quickstart', payload);
      return res.data;
    },
    onSuccess: () => {
      setMessage({ type: 'success', text: t('onboarding.success') });
    },
    onError: (err: any) => {
      const text = err?.response?.data?.message || err?.message || t('common.error');
      setMessage({ type: 'error', text });
    },
  });

  const updateBuilding = (index: number, updater: (prev: BuildingInput) => BuildingInput) => {
    setBuildings((prev) => prev.map((b, i) => (i === index ? updater(b) : b)));
  };

  const updateService = (index: number, updater: (prev: ServiceInput) => ServiceInput) => {
    setServices((prev) => prev.map((s, i) => (i === index ? updater(s) : s)));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('onboarding.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('onboarding.subtitle')}</Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? t('common.saving') : t('onboarding.run')}
        </Button>
      </Stack>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader title={t('onboarding.companyInfo')} />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label={t('setup.companyName')}
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  required
                />
                <TextField
                  label={t('setup.companyPhone')}
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                />
                <TextField
                  label={t('setup.companyAddress')}
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                />
                <TextField
                  label={t('setup.taxNumber')}
                  value={company.taxNumber}
                  onChange={(e) => setCompany({ ...company, taxNumber: e.target.value })}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label={t('setup.currency')}
                    value={company.currency}
                    onChange={(e) => setCompany({ ...company, currency: e.target.value })}
                    fullWidth
                  >
                    {['YER', 'SAR', 'USD', 'EUR'].map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label={t('setup.defaultLanguage')}
                    value={company.defaultLanguage}
                    onChange={(e) => setCompany({ ...company, defaultLanguage: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="ar">{t('setup.arabic')}</MenuItem>
                    <MenuItem value="en">{t('setup.english')}</MenuItem>
                  </TextField>
                </Stack>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={company.mergeServicesWithRent}
                      onChange={(e) => setCompany({ ...company, mergeServicesWithRent: e.target.checked })}
                    />
                  }
                  label={t('setup.mergeServices')}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader title={t('onboarding.adminUser')} />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label={t('setup.adminUsername')}
                  value={adminUser.username}
                  onChange={(e) => setAdminUser({ ...adminUser, username: e.target.value })}
                  required
                />
                <TextField
                  type="password"
                  label={t('setup.adminPassword')}
                  value={adminUser.password}
                  onChange={(e) => setAdminUser({ ...adminUser, password: e.target.value })}
                  required
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader
              title={t('onboarding.buildings')}
              action={
                <Button onClick={() => setBuildings((prev) => [...prev, { ...buildingTemplate }])}>
                  {t('onboarding.addBuilding')}
                </Button>
              }
            />
            <CardContent>
              {!buildings.length && (
                <Typography variant="body2" color="text.secondary">
                  {t('onboarding.noBuildings')}
                </Typography>
              )}
              <Stack spacing={2}>
                {buildings.map((b, idx) => (
                  <Box key={idx} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                          {t('onboarding.buildingLabel', { index: idx + 1 })}
                        </Typography>
                        <Button size="small" color="error" onClick={() => setBuildings((prev) => prev.filter((_, i) => i !== idx))}>
                          {t('common.delete')}
                        </Button>
                      </Stack>
                      <TextField
                        label={t('buildings.name')}
                        value={b.name}
                        onChange={(e) => updateBuilding(idx, (prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <TextField
                        label={t('buildings.address')}
                        value={b.address}
                        onChange={(e) => updateBuilding(idx, (prev) => ({ ...prev, address: e.target.value }))}
                      />
                      <TextField
                        select
                        label={t('buildings.type')}
                        value={b.buildingType}
                        onChange={(e) => updateBuilding(idx, (prev) => ({ ...prev, buildingType: e.target.value }))}
                      >
                        <MenuItem value="apartment">{t('buildings.types.apartment')}</MenuItem>
                        <MenuItem value="villa">{t('buildings.types.villa')}</MenuItem>
                        <MenuItem value="office">{t('buildings.types.office')}</MenuItem>
                        <MenuItem value="commercial">{t('buildings.types.commercial')}</MenuItem>
                        <MenuItem value="warehouse">{t('buildings.types.warehouse')}</MenuItem>
                      </TextField>
                      <Typography variant="subtitle2" color="text.secondary">{t('onboarding.furnished')}</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          label={t('setup.unitCount')}
                          type="number"
                          value={b.furnishedUnits.count}
                          onChange={(e) =>
                            updateBuilding(idx, (prev) => ({
                              ...prev,
                              furnishedUnits: { ...prev.furnishedUnits, count: Number(e.target.value) },
                            }))
                          }
                        />
                        <TextField
                          label={t('setup.startNumber')}
                          type="number"
                          value={b.furnishedUnits.startNumber}
                          onChange={(e) =>
                            updateBuilding(idx, (prev) => ({
                              ...prev,
                              furnishedUnits: { ...prev.furnishedUnits, startNumber: Number(e.target.value) },
                            }))
                          }
                        />
                        <TextField
                          label={t('setup.monthlyRent')}
                          type="number"
                          value={b.furnishedUnits.defaultRentMonthly}
                          onChange={(e) =>
                            updateBuilding(idx, (prev) => ({
                              ...prev,
                              furnishedUnits: { ...prev.furnishedUnits, defaultRentMonthly: Number(e.target.value) },
                            }))
                          }
                        />
                      </Stack>
                      <Typography variant="subtitle2" color="text.secondary">{t('onboarding.unfurnished')}</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          label={t('setup.unitCount')}
                          type="number"
                          value={b.unfurnishedUnits.count}
                          onChange={(e) =>
                            updateBuilding(idx, (prev) => ({
                              ...prev,
                              unfurnishedUnits: { ...prev.unfurnishedUnits, count: Number(e.target.value) },
                            }))
                          }
                        />
                        <TextField
                          label={t('setup.startNumber')}
                          type="number"
                          value={b.unfurnishedUnits.startNumber}
                          onChange={(e) =>
                            updateBuilding(idx, (prev) => ({
                              ...prev,
                              unfurnishedUnits: { ...prev.unfurnishedUnits, startNumber: Number(e.target.value) },
                            }))
                          }
                        />
                        <TextField
                          label={t('setup.monthlyRent')}
                          type="number"
                          value={b.unfurnishedUnits.defaultRentMonthly}
                          onChange={(e) =>
                            updateBuilding(idx, (prev) => ({
                              ...prev,
                              unfurnishedUnits: { ...prev.unfurnishedUnits, defaultRentMonthly: Number(e.target.value) },
                            }))
                          }
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined">
            <CardHeader
              title={t('onboarding.services')}
              action={
                <Button onClick={() => setServices((prev) => [...prev, { ...serviceTemplate }])}>
                  {t('onboarding.addService')}
                </Button>
              }
            />
            <CardContent>
              {!services.length && (
                <Typography variant="body2" color="text.secondary">
                  {t('onboarding.noServices')}
                </Typography>
              )}
              <Stack spacing={2}>
                {services.map((s, idx) => (
                  <Box key={idx} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        {t('onboarding.serviceLabel', { index: idx + 1 })}
                      </Typography>
                      <Button size="small" color="error" onClick={() => setServices((prev) => prev.filter((_, i) => i !== idx))}>
                        {t('common.delete')}
                      </Button>
                    </Stack>
                    <Stack spacing={1.5}>
                      <TextField
                        label={t('services.name')}
                        value={s.name}
                        onChange={(e) => updateService(idx, (prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          select
                          label={t('services.type')}
                          value={s.type}
                          onChange={(e) =>
                            updateService(idx, (prev) => ({ ...prev, type: e.target.value as ServiceInput['type'] }))
                          }
                          fullWidth
                        >
                          <MenuItem value="metered">{t('services.types.metered')}</MenuItem>
                          <MenuItem value="fixed_fee">{t('services.types.fixedFee')}</MenuItem>
                        </TextField>
                        <TextField
                          label={t('services.defaultPrice')}
                          type="number"
                          value={s.defaultPrice}
                          onChange={(e) =>
                            updateService(idx, (prev) => ({ ...prev, defaultPrice: Number(e.target.value) }))
                          }
                          fullWidth
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
