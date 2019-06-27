import React from 'react';
import DataFlowCard, { DataFlowCardChildProps } from './DataFlowCard';
import { ReactComponent as OutputSvg } from '../../../../../images/Common/output.svg';
import { useTranslation } from 'react-i18next';

const OutputDataFlowCard: React.SFC<DataFlowCardChildProps> = props => {
  const { t } = useTranslation();

  return (
    <DataFlowCard
      title={t('output')}
      emptyMessage={t('integrateNoOutputsDefined')}
      supportsMultipleItems={true}
      Svg={OutputSvg}
      {...props}
    />
  );
};

export default OutputDataFlowCard;
