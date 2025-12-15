import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import CompanyInfoStep from './steps/CompanyInfoStep';
import BuildingsUnitsStep from './steps/BuildingsUnitsStep';
import ServicesStep from './steps/ServicesStep';
import AdminUserStep from './steps/AdminUserStep';
import type {
  CompanyInfoFormData,
  BuildingsUnitsFormData,
  ServicesFormData,
  AdminUserFormData,
  CompleteSetupData,
} from '../../schemas/setup.schema';

export default function SetupWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [setupData, setSetupData] = useState<{
    company: CompanyInfoFormData;
    buildings: BuildingsUnitsFormData;
    services: ServicesFormData;
    adminUser: AdminUserFormData;
  }>({
    company: {
      name: '',
      currency: 'SAR',
      defaultLanguage: 'ar',
      mergeServicesWithRent: true,
    },
    buildings: {
      buildings: [],
    },
    services: {
      services: [],
    },
    adminUser: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const steps = [
    t('setup.step1'),
    t('setup.step2'),
    t('setup.step3'),
    t('setup.step4'),
  ];

  const setupMutation = useMutation({
    mutationFn: async (data: CompleteSetupData) => {
      const response = await api.post('/setup/run', data);
      return response.data;
    },
    onSuccess: () => {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    },
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCompanyInfoNext = (data: CompanyInfoFormData) => {
    setSetupData((prev) => ({ ...prev, company: data }));
    handleNext();
  };

  const handleBuildingsUnitsNext = (data: BuildingsUnitsFormData) => {
    setSetupData((prev) => ({ ...prev, buildings: data }));
    handleNext();
  };

  const handleServicesNext = (data: ServicesFormData) => {
    setSetupData((prev) => ({ ...prev, services: data }));
    handleNext();
  };

  const handleAdminUserNext = (data: AdminUserFormData) => {
    setSetupData((prev) => ({ ...prev, adminUser: data }));
    
    // Submit complete setup
    const completeData: CompleteSetupData = {
      company: setupData.company,
      buildings: setupData.buildings.buildings,
      services: setupData.services.services,
      adminUser: {
        username: data.username,
        password: data.password,
      },
    };

    setupMutation.mutate(completeData);
  };

  const handleSubmit = () => {
    // Trigger submit of current step form
    const submitButton = document.getElementById(
      activeStep === 0
        ? 'company-info-submit'
        : activeStep === 1
        ? 'buildings-units-submit'
        : activeStep === 2
        ? 'services-submit'
        : 'admin-user-submit'
    );
    submitButton?.click();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <CompanyInfoStep
            data={setupData.company}
            onNext={handleCompanyInfoNext}
          />
        );
      case 1:
        return (
          <BuildingsUnitsStep
            data={setupData.buildings}
            onNext={handleBuildingsUnitsNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <ServicesStep
            data={setupData.services}
            onNext={handleServicesNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <AdminUserStep
            data={setupData.adminUser}
            onNext={handleAdminUserNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  if (setupMutation.isSuccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="success.main" gutterBottom>
            ✅ {t('setup.setupSuccess')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('setup.redirecting')}
          </Typography>
          <CircularProgress sx={{ mt: 3 }} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('setup.title')}
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          {t('setup.subtitle')}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {setupMutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t('setup.setupError')}: {setupMutation.error?.message || t('common.error')}
          </Alert>
        )}

        <Box sx={{ minHeight: 400 }}>{renderStepContent()}</Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || setupMutation.isPending}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={setupMutation.isPending}
          >
            {setupMutation.isPending ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              t('common.finish')
            ) : (
              t('common.next')
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
