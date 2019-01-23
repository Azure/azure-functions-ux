import { ITheme } from 'office-ui-fabric-react/lib/Styling';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { style } from 'typestyle';

import { RootState } from '../../../modules/types';
import { SpecPickerPricingCard, SpecPickerPricingCardProps } from './SpecPickerPricingCard';

interface SpecPickerPricingCardsContainerProps {
  pricingCards: SpecPickerPricingCardProps[];
}

interface IStateProps {
  theme: ITheme;
}

const containerDivStyle = style({
  padding: '0',
  margin: '0px 5px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
});

type SpecPickerPricingCardsContainerPropsCombined = SpecPickerPricingCardsContainerProps & InjectedTranslateProps & IStateProps;
class SpecPickerPricingCardsContainer extends React.Component<SpecPickerPricingCardsContainerPropsCombined, {}> {
  public render() {
    const { t, theme, pricingCards } = this.props;

    const pricingCardElements: JSX.Element[] = [];

    for (const pricingCard of pricingCards) {
      const pricingCardProps = {
        t,
        theme,
        ...pricingCard,
      };
      pricingCardElements.push(<SpecPickerPricingCard {...pricingCardProps} />);
    }

    return <div className={containerDivStyle}>{pricingCardElements}</div>;
  }
}

const mapStateToProps = (state: RootState) => ({
  theme: state.portalService.theme,
});
export default compose<SpecPickerPricingCardsContainerPropsCombined, SpecPickerPricingCardsContainerProps>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(SpecPickerPricingCardsContainer);
