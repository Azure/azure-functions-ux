import React from 'react';
import DataFlowCard, { DataFlowCardChildProps, getTriggers } from './DataFlowCard';
import { ReactComponent as PowerSvg } from '../../../../../images/Common/power.svg';
import { useTranslation } from 'react-i18next';

const TriggerDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();

  const triggers = getTriggers(functionInfo.properties.config.bindings);

  return <DataFlowCard items={triggers} title={t('trigger')} emptyMessage={t('integrateNoTriggerDefined')} Svg={PowerSvg} {...props} />;
};

export default TriggerDataFlowCard;
