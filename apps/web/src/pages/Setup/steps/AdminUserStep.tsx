import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { adminUserSchema, AdminUserFormData } from '../../../schemas/setup.schema';

interface AdminUserStepProps {
  data: AdminUserFormData;
  onNext: (data: AdminUserFormData) => void;
  onBack: () => void;
}

export default function AdminUserStep({ data, onNext, onBack: _onBack }: AdminUserStepProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: data,
  });

  const onSubmit = (formData: AdminUserFormData) => {
    onNext(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('setup.step4')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('setup.subtitle')}
      </Typography>

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={t('setup.adminUsername')}
            placeholder={t('setup.adminUsernamePlaceholder')}
            fullWidth
            margin="normal"
            error={!!errors.username}
            helperText={errors.username?.message}
            required
            autoComplete="username"
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label={t('setup.adminPassword')}
            placeholder={t('setup.adminPasswordPlaceholder')}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            required
            autoComplete="new-password"
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label={t('setup.confirmPassword')}
            placeholder={t('setup.confirmPasswordPlaceholder')}
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            required
            autoComplete="new-password"
          />
        )}
      />

      <input type="submit" style={{ display: 'none' }} id="admin-user-submit" />
    </Box>
  );
}
