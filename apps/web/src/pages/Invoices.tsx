import React from 'react';
import { useTranslation } from 'react-i18next';
import ComingSoon from './ComingSoon';

const Invoices: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.invoices')} phase={4} />;
};

export default Invoices;
