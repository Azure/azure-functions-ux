import React from 'react';
import { useTranslation } from 'react-i18next';

export interface FunctionTestInputProps {}

// TODO (krmitta): Add Content for Input-Tab [WI: 5536379]
const FunctionTestInput: React.SFC<FunctionTestInputProps> = props => {
  const { t } = useTranslation();

  return <>{t('functionTestInput')}</>;
};

export default FunctionTestInput;
