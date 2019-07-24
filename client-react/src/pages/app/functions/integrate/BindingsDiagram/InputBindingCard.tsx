import React from 'react';
import BindingCard, { BindingCardChildProps, getBindings } from './BindingCard';
import { ReactComponent as InputSvg } from '../../../../../images/Common/input.svg';
import { useTranslation } from 'react-i18next';
import { BindingDirection } from '../../../../../models/functions/function-binding';

const InputBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();

  const inputs = getBindings(functionInfo.properties.config.bindings, BindingDirection.in);

  return (
    <BindingCard
      items={inputs}
      title={t('input')}
      emptyMessage={t('integrateNoInputsDefined')}
      supportsMultipleItems={true}
      Svg={InputSvg}
      {...props}
    />
  );
};

export default InputBindingCard;
