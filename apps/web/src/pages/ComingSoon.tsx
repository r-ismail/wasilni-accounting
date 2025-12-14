import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Construction } from '@mui/icons-material';

interface ComingSoonProps {
  title: string;
  phase: number;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, phase }) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Construction sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            {title}
          </Typography>
          
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            {t('common.comingSoon')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {t('common.availableInPhase', { phase })}
          </Typography>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('common.currentPhase')}:</strong> {t('common.phase1Complete')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>{t('common.nextPhase')}:</strong> {t('common.setupWizard')}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ComingSoon;
