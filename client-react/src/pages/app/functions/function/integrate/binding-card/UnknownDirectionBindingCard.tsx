import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as WarningSvg } from '../../../../../../images/Common/Warning.svg';
import { Binding, BindingDirection } from '../../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../../models/functions/function-binding';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../../ThemeContext';
import { BindingFormBuilder } from '../../../common/BindingFormBuilder';
import { getBindingDirection } from '../FunctionIntegrate.utils';
import BindingCard, { BindingCardChildProps } from './BindingCard';
import { listStyle } from './BindingCard.styles';

const UnknownDirectionBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo, bindings } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const unknownBindings = getUnknownBindings(functionInfo.properties.config.bindings);
  const content = getContent(bindings, theme, unknownBindings);

  return unknownBindings.length > 0 ? (
    <BindingCard title={t('integrate_unknownCardTitle')} Svg={WarningSvg} content={content} {...props} />
  ) : null;
};

const getUnknownBindings = (bindings: BindingInfo[]): BindingInfo[] => {
  const unknownBindings = bindings.filter(binding => {
    return getBindingDirection(binding) === BindingDirection.unknown;
  });

  return unknownBindings ? unknownBindings : [];
};

const getContent = (bindings: Binding[], theme: ThemeExtended, unknownBindings: BindingInfo[]): JSX.Element => {
  const unknownList = unknownBindings.map((item, i) => {
    const name = item.name ? `(${item.name})` : '';
    const linkName = `${BindingFormBuilder.getBindingTypeName(item, bindings)} ${name}`;
    return (
      <li className="unknownBinding" key={i.toString()}>
        {linkName}
      </li>
    );
  });

  return <ul className={listStyle(theme)}>{unknownList}</ul>;
};

export default UnknownDirectionBindingCard;
