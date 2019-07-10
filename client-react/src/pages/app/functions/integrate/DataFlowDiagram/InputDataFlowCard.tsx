import React from 'react';
import DataFlowCard, { DataFlowCardChildProps, getBindings } from './DataFlowCard';
import { ReactComponent as InputSvg } from '../../../../../images/Common/input.svg';
import { useTranslation } from 'react-i18next';
import { BindingDirection } from '../../../../../models/functions/function-binding';

const InputDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();

  const inputs = getBindings(functionInfo.properties.config.bindings, BindingDirection.in);

  return (
    <DataFlowCard
      items={inputs}
      title={t('input')}
      emptyMessage={t('integrateNoInputsDefined')}
      supportsMultipleItems={true}
      Svg={InputSvg}
      {...props}
    />
  );
};

export default InputDataFlowCard;
