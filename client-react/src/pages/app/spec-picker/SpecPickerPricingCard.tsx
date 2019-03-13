import { Link } from 'office-ui-fabric-react/lib/Link';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../ThemeContext';
import {
  pricingCardDivStyle,
  pricingCardFeaturesDivStyle,
  PricingCardSelectedDivStyle,
  PricingCardDisabledDivStyle,
  PricingCardHeaderStyle,
} from './SpecPicker.styles';
interface SpecPickerPricingCardDisabledProps {
  message: string;
  learnMoreLink: string;
}

export interface SpecPickerPricingCardProps {
  id: string;
  isSelected: boolean;
  topFeatures: string[];
  cssClassName: string;
  skuCode: string;
  onClick: (id: string) => void;
  priceString?: string;
  disabledProps?: SpecPickerPricingCardDisabledProps;
}

const SpecPickerPricingCard: React.FC<SpecPickerPricingCardProps> = props => {
  const { topFeatures, priceString, cssClassName, id, skuCode, disabledProps, isSelected, onClick } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  let divClassName = isSelected
    ? `${cssClassName} ${pricingCardDivStyle} ${PricingCardSelectedDivStyle(theme)}`
    : `${cssClassName} ${pricingCardDivStyle}`;
  divClassName = !!disabledProps ? `${divClassName} ${PricingCardDisabledDivStyle(theme)}` : divClassName;

  const features: JSX.Element[] = [];

  for (const feature of topFeatures) {
    features.push(<div>{t(feature)}</div>);
  }

  return (
    <div
      className={divClassName}
      id={id}
      role="button"
      onClick={() => {
        onClick(id);
      }}
      aria-disabled={!!disabledProps}
      tabIndex={0}>
      <h2 className={PricingCardHeaderStyle(theme)}>{t(skuCode)}</h2>
      {!disabledProps && (
        <div className={pricingCardFeaturesDivStyle} aria-label={t('pricing_availableFeatures')}>
          {features}
          {!!priceString && <div>{t(priceString)}</div>}
          {!priceString && <div>{t('loading')}</div>}
        </div>
      )}
      {!!disabledProps && (
        <div className={pricingCardFeaturesDivStyle}>
          <div>{t(disabledProps.message)}</div>
          <Link href={disabledProps.learnMoreLink}>{t('clickToLearnMore')}</Link>
        </div>
      )}
    </div>
  );
};

export default SpecPickerPricingCard;
