import { Link } from 'office-ui-fabric-react/lib/Link';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { style } from 'typestyle';
import { ThemeContext } from '../../../ThemeContext';

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

interface ISpecPickerPricingCardState {
  isSelected: boolean;
}

const divStyle = style({
  padding: '10px',
  height: '90px',
  width: 'calc(25% - 10px)',
  maxWidth: '350px',
  minWidth: '250px',
  margin: '10px 5px',
  position: 'relative',
  cursor: 'pointer',
});

const featuresDivStyle = style({
  position: 'absolute',
  left: '65px',
  top: '50%',
  paddingRight: '10px',
  transform: 'translateY(-50%)',
});

type SpecPickerPricingCardPropsCombined = SpecPickerPricingCardProps & WithTranslation;
export class SpecPickerPricingCard extends React.Component<SpecPickerPricingCardPropsCombined, ISpecPickerPricingCardState> {
  public static contextType = ThemeContext;
  constructor(props) {
    super(props);
    this.state = {
      isSelected: props.isSelected,
    };
  }

  public render() {
    const { t, topFeatures, priceString, cssClassName, id, skuCode, disabledProps } = this.props;
    const { isSelected } = this.state;

    const theme = this.context;
    const selectedDivStyle = style({
      outlineColor: theme.semanticColors.warningText,
      outlineWidth: '3px',
      outlineStyle: 'solid',
      outlineOffset: '3px',
    });

    const disabledDivStyle = style({
      backgroundColor: theme.semanticColors.disabledBackground,
      color: theme.semanticColors.warningText,
      cursor: 'not-allowed',
    });

    const headerStyle = style({
      color: theme.semanticColors.warningText,
      fontWeight: 'bold',
      position: 'absolute',
      top: '50%',
      left: '13px',
      marginTop: '0px',
      transform: 'translateY(-50%)',
    });

    let divClassName = isSelected ? `${cssClassName} ${divStyle} ${selectedDivStyle}` : `${cssClassName} ${divStyle}`;
    divClassName = !!disabledProps ? `${divClassName} ${disabledDivStyle}` : divClassName;

    const features: JSX.Element[] = [];

    for (const feature of topFeatures) {
      features.push(<div>{t(feature)}</div>);
    }

    return (
      <div className={divClassName} id={id} role="button" onClick={this._onClick} aria-disabled={!!this.props.disabledProps} tabIndex={0}>
        <h2 className={headerStyle}>{t(skuCode)}</h2>
        {!disabledProps && (
          <div className={featuresDivStyle} aria-label={t('pricing_availableFeatures')}>
            {features}
            {!!priceString && <div>{t(priceString)}</div>}
            {!priceString && <div>{t('loading')}</div>}
          </div>
        )}
        {!!disabledProps && (
          <div className={featuresDivStyle}>
            <div>{t(disabledProps.message)}</div>
            <Link href={disabledProps.learnMoreLink}>{t('clickToLearnMore')}</Link>
          </div>
        )}
      </div>
    );
  }

  private _onClick = () => {
    this.setState({ isSelected: !this.state.isSelected });
    this.props.onClick(this.props.id);
  };
}

export default withTranslation('translation')(SpecPickerPricingCard);
