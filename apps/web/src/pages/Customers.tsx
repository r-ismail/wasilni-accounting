import React from 'react';
import { useTranslation } from 'react-i18next';
import ComingSoon from './ComingSoon';

const Customers: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.customers')} phase={3} />;
};

export default Customers;
