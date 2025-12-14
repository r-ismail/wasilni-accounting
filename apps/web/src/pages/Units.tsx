import React from 'react';
import { useTranslation } from 'react-i18next';
import ComingSoon from './ComingSoon';

const Units: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.units')} phase={3} />;
};

export default Units;
