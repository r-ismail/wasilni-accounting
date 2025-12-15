import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ServiceFormData {
  nameAr: string;
  nameEn: string;
  description: string;
  type: string;
  defaultPrice: number;
  unit: string;
  category: string;
  taxRate: number;
  isActive: boolean;
  requiresApproval: boolean;
}

interface ServiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
  initialData?: ServiceFormData | null;
  isLoading?: boolean;
}

const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ServiceFormData>({
    nameAr: '',
    nameEn: '',
    description: '',
    type: 'fixed_fee',
    defaultPrice: 0,
    unit: 'month',
    category: 'utilities',
    taxRate: 0,
    isActive: true,
    requiresApproval: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nameAr: '',
        nameEn: '',
        description: '',
        type: 'fixed_fee',
        defaultPrice: 0,
        unit: 'month',
        category: 'utilities',
        taxRate: 0,
        isActive: true,
        requiresApproval: false,
      });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleChange = (field: keyof ServiceFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? t('services.editService') : t('services.addService')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('services.nameAr')}
              value={formData.nameAr}
              onChange={(e) => handleChange('nameAr', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('services.nameEn')}
              value={formData.nameEn}
              onChange={(e) => handleChange('nameEn', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('services.description')}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label={t('services.type')}
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="fixed_fee">{t('services.types.fixedFee')}</MenuItem>
              <MenuItem value="metered">{t('services.types.metered')}</MenuItem>
              <MenuItem value="variable">{t('services.types.variable')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label={t('services.category')}
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <MenuItem value="utilities">{t('services.categories.utilities')}</MenuItem>
              <MenuItem value="maintenance">{t('services.categories.maintenance')}</MenuItem>
              <MenuItem value="amenities">{t('services.categories.amenities')}</MenuItem>
              <MenuItem value="other">{t('services.categories.other')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('services.defaultPrice')}
              type="number"
              value={formData.defaultPrice}
              onChange={(e) => handleChange('defaultPrice', parseFloat(e.target.value) || 0)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('services.unit')}
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              placeholder="month, day, unit, etc."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('services.taxRate')}
              type="number"
              value={formData.taxRate}
              onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
              InputProps={{ endAdornment: '%' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
              }
              label={t('services.isActive')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiresApproval}
                  onChange={(e) => handleChange('requiresApproval', e.target.checked)}
                />
              }
              label={t('services.requiresApproval')}
            />
          </Grid>
        </Grid>
        {!formData.nameAr || !formData.nameEn ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('services.requiredFields')}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !formData.nameAr || !formData.nameEn}
        >
          {isLoading ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceFormDialog;
