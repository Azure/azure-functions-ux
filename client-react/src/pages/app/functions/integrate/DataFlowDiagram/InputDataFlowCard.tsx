import React from 'react';
import DataFlowCard, { DataFlowCardChildProps } from './DataFlowCard';
import { ReactComponent as InputSvg } from '../../../../../images/Common/input.svg';
import { useTranslation } from 'react-i18next';

const InputDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { t } = useTranslation();

  return (
    <DataFlowCard title={t('input')} emptyMessage={t('integrateNoInputsDefined')} supportsMultipleItems={true} Svg={InputSvg} {...props} />
  );
};

export default InputDataFlowCard;
