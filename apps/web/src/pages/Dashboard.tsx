import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Container } from '@mui/material';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('app.description')}
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
