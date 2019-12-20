import React from 'react';
import { useTranslation } from 'react-i18next';

export interface FunctionTestOutputProps {}

// TODO (krmitta): Add Content for Output-Tab [WI: 5536379]
const FunctionTestOutput: React.SFC<FunctionTestOutputProps> = props => {
  const { t } = useTranslation();

  return <>{t('functionTestOutput')}</>;
};

export default FunctionTestOutput;
