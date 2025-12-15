import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

interface CompanySettings {
  defaultPageSize: number;
  dateFormat: string;
  currency: string;
  defaultLanguage: string;
  // Add other settings as needed
}

export function useCompanySettings() {
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', 'my-company'],
    queryFn: async () => {
      const res = await api.get('/companies/my-company');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const settings: CompanySettings = {
    defaultPageSize: company?.defaultPageSize || 25,
    dateFormat: company?.dateFormat || 'DD/MM/YYYY',
    currency: company?.currency || 'YER',
    defaultLanguage: company?.defaultLanguage || 'ar',
  };

  return {
    settings,
    isLoading,
    company,
  };
}
