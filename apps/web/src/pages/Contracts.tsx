import React from 'react';
import { useTranslation } from 'react-i18next';
import ComingSoon from './ComingSoon';

const Contracts: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.contracts')} phase={3} />;
};

export default Contracts;
