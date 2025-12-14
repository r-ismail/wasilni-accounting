import React from 'react';
import { useTranslation } from 'react-i18next';
import ComingSoon from './ComingSoon';

const Payments: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.payments')} phase={6} />;
};

export default Payments;
