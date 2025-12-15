import { useState } from 'react';
import { useQuery } from '@tantml/react-query';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

interface Contract {
  _id: string;
  unitId: { unitNumber: string };
  customerId: { name: string };
  rentType: 'monthly' | 'daily';
  baseRentAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function Contracts() {
  const { t } = useTranslation();
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await api.get('/contracts');
      return response.data.data;
    },
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>{t('contracts.title')}</Typography>
      {isLoading ? <Typography>{t('common.loading')}</Typography> : contracts?.length === 0 ? (
        <Alert severity="info">{t('contracts.noContracts')}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('contracts.unit')}</TableCell>
                <TableCell>{t('contracts.customer')}</TableCell>
                <TableCell>{t('contracts.rentType')}</TableCell>
                <TableCell>{t('contracts.amount')}</TableCell>
                <TableCell>{t('contracts.startDate')}</TableCell>
                <TableCell>{t('contracts.endDate')}</TableCell>
                <TableCell>{t('contracts.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts?.map((contract: Contract) => (
                <TableRow key={contract._id}>
                  <TableCell>{contract.unitId?.unitNumber || '-'}</TableCell>
                  <TableCell>{contract.customerId?.name || '-'}</TableCell>
                  <TableCell><Chip label={t(\`contracts.\${contract.rentType}\`)} size="small" /></TableCell>
                  <TableCell>{contract.baseRentAmount}</TableCell>
                  <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={contract.isActive ? t('common.active') : t('common.inactive')} color={contract.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
