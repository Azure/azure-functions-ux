import React from 'react';
import DataFlowCard, { DataFlowCardChildProps } from './DataFlowCard';
import { ReactComponent as FunctionSvg } from '../../../../../images/AppService/functions_f.svg';
import { useTranslation } from 'react-i18next';
import { ArmResourceDescriptor } from '../../../../../utils/resourceDescriptors';

const FunctionDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { t } = useTranslation();

  const descriptor = new ArmResourceDescriptor(props.functionResourceId);

  return (
    <DataFlowCard
      title={t('_function')}
      emptyMessage={''}
      functionName={descriptor.resourceName}
      supportsMultipleItems={false}
      Svg={FunctionSvg}
      {...props}
    />
  );
};

export default FunctionDataFlowCard;
