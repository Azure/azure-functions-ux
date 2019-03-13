import React from 'react';
import { useTranslation } from 'react-i18next';
import { pricingCardContainerDivStyle } from './SpecPicker.styles';

import SpecPickerPricingCard, { SpecPickerPricingCardProps } from './SpecPickerPricingCard';

interface SpecPickerPricingCardsContainerProps {
  pricingCards: SpecPickerPricingCardProps[];
}

type SpecPickerPricingCardsContainerPropsCombined = SpecPickerPricingCardsContainerProps;
const SpecPickerPricingCardsContainer: React.FC<SpecPickerPricingCardsContainerPropsCombined> = props => {
  const { pricingCards } = props;
  const { t } = useTranslation();
  const pricingCardElements: JSX.Element[] = [];
  for (const pricingCard of pricingCards) {
    const pricingCardProps = {
      t,
      ...pricingCard,
    };
    pricingCardElements.push(<SpecPickerPricingCard {...pricingCardProps} />);
  }
  return <div className={pricingCardContainerDivStyle}>{pricingCardElements}</div>;
};

export default SpecPickerPricingCardsContainer;
