import React from 'react';
import { useTranslation } from 'react-i18next';
import ComingSoon from './ComingSoon';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.settings')} phase={2} />;
};

export default Settings;
