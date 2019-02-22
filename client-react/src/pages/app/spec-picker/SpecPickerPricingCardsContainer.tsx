import React from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import SpecPickerPricingCard, { SpecPickerPricingCardProps } from './SpecPickerPricingCard';

interface SpecPickerPricingCardsContainerProps {
  pricingCards: SpecPickerPricingCardProps[];
}

const containerDivStyle = style({
  padding: '0',
  margin: '0px 5px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
});

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
  return <div className={containerDivStyle}>{pricingCardElements}</div>;
};

export default SpecPickerPricingCardsContainer;
