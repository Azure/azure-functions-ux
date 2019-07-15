import React from 'react';
import BindingCard, { BindingCardChildProps, getBindings } from './BindingCard';
import { ReactComponent as OutputSvg } from '../../../../../images/Common/output.svg';
import { useTranslation } from 'react-i18next';
import { BindingDirection } from '../../../../../models/functions/function-binding';

const OutputBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();

  const outputs = getBindings(functionInfo.properties.config.bindings, BindingDirection.out);

  return (
    <BindingCard
      items={outputs}
      title={t('output')}
      emptyMessage={t('integrateNoOutputsDefined')}
      supportsMultipleItems={true}
      Svg={OutputSvg}
      {...props}
    />
  );
};

export default OutputBindingCard;
