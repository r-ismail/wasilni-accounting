import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { servicesSchema, ServicesFormData } from '../../../schemas/setup.schema';

interface ServicesStepProps {
  data: ServicesFormData;
  onNext: (data: ServicesFormData) => void;
  onBack: () => void;
}

const defaultServices = [
  { name: 'Water', nameAr: 'ماء', type: 'metered' as const, defaultPrice: 250 },
  { name: 'Electricity', nameAr: 'كهرباء', type: 'metered' as const, defaultPrice: 0.3 },
  { name: 'Internet', nameAr: 'إنترنت', type: 'fixed_fee' as const, defaultPrice: 4000 },
];

export default function ServicesStep({ data, onNext, onBack: _onBack }: ServicesStepProps) {
  const { t, i18n } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServicesFormData>({
    resolver: zodResolver(servicesSchema),
    defaultValues: data.services.length > 0 ? data : {
      services: defaultServices.map(s => ({
        name: i18n.language === 'ar' ? s.nameAr : s.name,
        type: s.type,
        defaultPrice: s.defaultPrice,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  const onSubmit = (formData: ServicesFormData) => {
    onNext(formData);
  };

  const addService = () => {
    append({
      name: '',
      type: 'fixed_fee',
      defaultPrice: 0,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('setup.step3')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('setup.subtitle')}
      </Typography>

      {fields.map((field, index) => (
        <Paper key={field.id} sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2">
              {t('setup.serviceName')} #{index + 1}
            </Typography>
            {fields.length > 1 && (
              <IconButton
                color="error"
                size="small"
                onClick={() => remove(index)}
                aria-label={t('setup.removeService')}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name={`services.${index}.name`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('setup.serviceName')}
                    fullWidth
                    margin="normal"
                    error={!!errors.services?.[index]?.name}
                    helperText={errors.services?.[index]?.name?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name={`services.${index}.type`}
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={!!errors.services?.[index]?.type}
                  >
                    <InputLabel required>{t('setup.serviceType')}</InputLabel>
                    <Select {...field} label={t('setup.serviceType')}>
                      <MenuItem value="metered">{t('setup.metered')}</MenuItem>
                      <MenuItem value="fixed_fee">{t('setup.fixedFee')}</MenuItem>
                    </Select>
                    {errors.services?.[index]?.type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                        {errors.services?.[index]?.type?.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name={`services.${index}.defaultPrice`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.defaultPrice')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.services?.[index]?.defaultPrice}
                    helperText={errors.services?.[index]?.defaultPrice?.message}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addService}
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
      >
        {t('setup.addService')}
      </Button>

      <input type="submit" style={{ display: 'none' }} id="services-submit" />
    </Box>
  );
}
