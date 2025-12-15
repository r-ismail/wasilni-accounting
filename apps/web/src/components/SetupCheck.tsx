import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import api from '../lib/api';

interface SetupCheckProps {
  children: React.ReactNode;
}

export default function SetupCheck({ children }: SetupCheckProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['setup-status'],
    queryFn: async () => {
      const response = await api.get('/setup/status');
      return response.data.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && data) {
      const isSetupPage = location.pathname === '/setup';
      const setupCompleted = data.setupCompleted;

      // If setup not completed and not on setup page, redirect to setup
      if (!setupCompleted && !isSetupPage) {
        navigate('/setup', { replace: true });
      }

      // If setup completed and on setup page, redirect to dashboard
      if (setupCompleted && isSetupPage) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [data, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
