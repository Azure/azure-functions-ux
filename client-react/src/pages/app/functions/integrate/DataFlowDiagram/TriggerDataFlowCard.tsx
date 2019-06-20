import React from 'react';
import DataFlowCard, { DataFlowCardChildProps } from './DataFlowCard';
import { ReactComponent as PowerSvg } from '../../../../../images/Common/power.svg';
import { useTranslation } from 'react-i18next';

const TriggerDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { t } = useTranslation();

  return <DataFlowCard title={t('trigger')} emptyMessage={t('integrateNoTriggerDefined')} Svg={PowerSvg} {...props} />;
};

export default TriggerDataFlowCard;
