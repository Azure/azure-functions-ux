import React from 'react';
import BindingCard, { BindingCardChildProps } from './BindingCard';
import { ReactComponent as FunctionSvg } from '../../../../../images/AppService/functions_f.svg';
import { useTranslation } from 'react-i18next';
import { ArmResourceDescriptor } from '../../../../../utils/resourceDescriptors';

const FunctionNameBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();

  const descriptor = new ArmResourceDescriptor(functionInfo.id);

  return (
    <BindingCard
      functionInfo={functionInfo}
      items={[]}
      title={t('_function')}
      emptyMessage={''}
      functionName={descriptor.resourceName}
      supportsMultipleItems={false}
      Svg={FunctionSvg}
      {...props}
    />
  );
};

export default FunctionNameBindingCard;
