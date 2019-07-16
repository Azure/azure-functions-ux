import React from 'react';
import BindingCard, { BindingCardChildProps, getTriggers } from './BindingCard';
import { ReactComponent as PowerSvg } from '../../../../../images/Common/power.svg';
import { useTranslation } from 'react-i18next';

const TriggerBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();

  const triggers = getTriggers(functionInfo.properties.config.bindings);

  return <BindingCard items={triggers} title={t('trigger')} emptyMessage={t('integrateNoTriggerDefined')} Svg={PowerSvg} {...props} />;
};

export default TriggerBindingCard;
