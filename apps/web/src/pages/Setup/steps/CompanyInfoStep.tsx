import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { companyInfoSchema, CompanyInfoFormData } from '../../../schemas/setup.schema';

interface CompanyInfoStepProps {
  data: CompanyInfoFormData;
  onNext: (data: CompanyInfoFormData) => void;
}

const currencies = [
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'YER', label: 'YER - Yemeni Rial' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'EGP', label: 'EGP - Egyptian Pound' },
];

export default function CompanyInfoStep({ data, onNext }: CompanyInfoStepProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: data,
  });

  const onSubmit = (formData: CompanyInfoFormData) => {
    onNext(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('setup.step1')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('setup.subtitle')}
      </Typography>

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={t('setup.companyName')}
            placeholder={t('setup.companyNamePlaceholder')}
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
            required
          />
        )}
      />

      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" error={!!errors.currency}>
            <InputLabel required>{t('setup.currency')}</InputLabel>
            <Select {...field} label={t('setup.currency')}>
              {currencies.map((currency) => (
                <MenuItem key={currency.value} value={currency.value}>
                  {currency.label}
                </MenuItem>
              ))}
            </Select>
            {errors.currency && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                {errors.currency.message}
              </Typography>
            )}
          </FormControl>
        )}
      />

      <Controller
        name="defaultLanguage"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" error={!!errors.defaultLanguage}>
            <InputLabel required>{t('setup.defaultLanguage')}</InputLabel>
            <Select {...field} label={t('setup.defaultLanguage')}>
              <MenuItem value="ar">{t('setup.arabic')}</MenuItem>
              <MenuItem value="en">{t('setup.english')}</MenuItem>
            </Select>
            {errors.defaultLanguage && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                {errors.defaultLanguage.message}
              </Typography>
            )}
          </FormControl>
        )}
      />

      <Controller
        name="mergeServicesWithRent"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} checked={field.value} />}
            label={t('setup.mergeServices')}
            sx={{ mt: 2 }}
          />
        )}
      />

      <input type="submit" style={{ display: 'none' }} id="company-info-submit" />
    </Box>
  );
}
