import React from 'react';
import DataFlowCard, { DataFlowCardChildProps, getBindings } from './DataFlowCard';
import { ReactComponent as OutputSvg } from '../../../../../images/Common/output.svg';
import { useTranslation } from 'react-i18next';
import { BindingDirection } from '../../../../../models/functions/function-binding';

const OutputDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();

  const outputs = getBindings(functionInfo.properties.config.bindings, BindingDirection.out);

  return (
    <DataFlowCard
      items={outputs}
      title={t('output')}
      emptyMessage={t('integrateNoOutputsDefined')}
      supportsMultipleItems={true}
      Svg={OutputSvg}
      {...props}
    />
  );
};

export default OutputDataFlowCard;
