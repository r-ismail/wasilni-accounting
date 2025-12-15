import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  buildingsUnitsSchema,
  BuildingsUnitsFormData,
} from '../../../schemas/setup.schema';

interface BuildingsUnitsStepProps {
  data: BuildingsUnitsFormData;
  onNext: (data: BuildingsUnitsFormData) => void;
  onBack: () => void;
}

export default function BuildingsUnitsStep({
  data,
  onNext,
  onBack,
}: BuildingsUnitsStepProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BuildingsUnitsFormData>({
    resolver: zodResolver(buildingsUnitsSchema),
    defaultValues: data.buildings.length > 0 ? data : {
      buildings: [
        {
          name: '',
          address: '',
          furnishedUnits: {
            count: 0,
            startNumber: 101,
            defaultRentMonthly: 0,
            defaultRentDaily: 0,
          },
          unfurnishedUnits: {
            count: 0,
            startNumber: 201,
            defaultRentMonthly: 0,
            defaultRentDaily: 0,
          },
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'buildings',
  });

  const onSubmit = (formData: BuildingsUnitsFormData) => {
    onNext(formData);
  };

  const addBuilding = () => {
    append({
      name: '',
      address: '',
      furnishedUnits: {
        count: 0,
        startNumber: 101,
        defaultRentMonthly: 0,
        defaultRentDaily: 0,
      },
      unfurnishedUnits: {
        count: 0,
        startNumber: 201,
        defaultRentMonthly: 0,
        defaultRentDaily: 0,
      },
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('setup.step2')}
      </Typography>

      {fields.map((field, index) => (
        <Paper key={field.id} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t('setup.buildingName')} #{index + 1}
            </Typography>
            {fields.length > 1 && (
              <IconButton
                color="error"
                size="small"
                onClick={() => remove(index)}
                aria-label={t('setup.removeBuilding')}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Controller
            name={`buildings.${index}.name`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('setup.buildingName')}
                placeholder={t('setup.buildingNamePlaceholder')}
                fullWidth
                margin="normal"
                error={!!errors.buildings?.[index]?.name}
                helperText={errors.buildings?.[index]?.name?.message}
                required
              />
            )}
          />

          <Controller
            name={`buildings.${index}.address`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('setup.address')}
                placeholder={t('setup.addressPlaceholder')}
                fullWidth
                margin="normal"
                error={!!errors.buildings?.[index]?.address}
                helperText={errors.buildings?.[index]?.address?.message}
              />
            )}
          />

          <Divider sx={{ my: 3 }} />

          {/* Furnished Units */}
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {t('setup.furnishedUnits')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.furnishedUnits.count`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.unitCount')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.buildings?.[index]?.furnishedUnits?.count}
                    helperText={errors.buildings?.[index]?.furnishedUnits?.count?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.furnishedUnits.startNumber`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.startNumber')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.buildings?.[index]?.furnishedUnits?.startNumber}
                    helperText={errors.buildings?.[index]?.furnishedUnits?.startNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.furnishedUnits.defaultRentMonthly`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.monthlyRent')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.buildings?.[index]?.furnishedUnits?.defaultRentMonthly}
                    helperText={errors.buildings?.[index]?.furnishedUnits?.defaultRentMonthly?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.furnishedUnits.defaultRentDaily`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.dailyRent')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    error={!!errors.buildings?.[index]?.furnishedUnits?.defaultRentDaily}
                    helperText={errors.buildings?.[index]?.furnishedUnits?.defaultRentDaily?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Unfurnished Units */}
          <Typography variant="subtitle2" color="secondary" gutterBottom>
            {t('setup.unfurnishedUnits')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.unfurnishedUnits.count`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.unitCount')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.buildings?.[index]?.unfurnishedUnits?.count}
                    helperText={errors.buildings?.[index]?.unfurnishedUnits?.count?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.unfurnishedUnits.startNumber`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.startNumber')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.buildings?.[index]?.unfurnishedUnits?.startNumber}
                    helperText={errors.buildings?.[index]?.unfurnishedUnits?.startNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.unfurnishedUnits.defaultRentMonthly`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.monthlyRent')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.buildings?.[index]?.unfurnishedUnits?.defaultRentMonthly}
                    helperText={errors.buildings?.[index]?.unfurnishedUnits?.defaultRentMonthly?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name={`buildings.${index}.unfurnishedUnits.defaultRentDaily`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('setup.dailyRent')}
                    fullWidth
                    margin="normal"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    error={!!errors.buildings?.[index]?.unfurnishedUnits?.defaultRentDaily}
                    helperText={errors.buildings?.[index]?.unfurnishedUnits?.defaultRentDaily?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addBuilding}
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
      >
        {t('setup.addBuilding')}
      </Button>

      <input type="submit" style={{ display: 'none' }} id="buildings-units-submit" />
    </Box>
  );
}
