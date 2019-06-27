import React from 'react';
import DataFlowCard, { DataFlowCardChildProps } from './DataFlowCard';
import { ReactComponent as FunctionSvg } from '../../../../../images/AppService/functions_f.svg';
import { useTranslation } from 'react-i18next';

const FunctionDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { t } = useTranslation();

  return (
    <DataFlowCard title={t('_function')} emptyMessage={''} functionName={''} supportsMultipleItems={false} Svg={FunctionSvg} {...props} />
  );
};

export default FunctionDataFlowCard;
