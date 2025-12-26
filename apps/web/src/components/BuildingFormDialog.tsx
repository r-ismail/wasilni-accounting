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
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BuildingFormData {
  name: string;
  address: string;
  buildingType: string;
}

interface BuildingFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BuildingFormData) => void;
  initialData?: BuildingFormData | null;
  isLoading?: boolean;
}

const BuildingFormDialog: React.FC<BuildingFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BuildingFormData>({
    name: '',
    address: '',
    buildingType: 'apartment',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        buildingType: initialData.buildingType || 'apartment',
      });
    } else {
      setFormData({
        name: '',
        address: '',
        buildingType: 'apartment',
      });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleChange = (field: keyof BuildingFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? t('buildings.editBuilding') : t('buildings.addBuilding')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('buildings.name')}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('buildings.address')}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label={t('buildings.type')}
              value={formData.buildingType}
              onChange={(e) => handleChange('buildingType', e.target.value)}
            >
              <MenuItem value="apartment">{t('buildings.types.apartment')}</MenuItem>
              <MenuItem value="villa">{t('buildings.types.villa')}</MenuItem>
              <MenuItem value="office">{t('buildings.types.office')}</MenuItem>
              <MenuItem value="commercial">{t('buildings.types.commercial')}</MenuItem>
              <MenuItem value="warehouse">{t('buildings.types.warehouse')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        {!formData.name ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('common.requiredFields')}
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
          disabled={isLoading || !formData.name}
        >
          {isLoading ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuildingFormDialog;
