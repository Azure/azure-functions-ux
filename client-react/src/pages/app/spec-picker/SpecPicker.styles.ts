import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const PricingCardSelectedDivStyle = (theme: ThemeExtended) =>
  style({
    outlineColor: theme.semanticColors.warningText,
    outlineWidth: '3px',
    outlineStyle: 'solid',
    outlineOffset: '3px',
  });

export const PricingCardDisabledDivStyle = (theme: ThemeExtended) =>
  style({
    backgroundColor: theme.semanticColors.disabledBackground,
    color: theme.semanticColors.warningText,
    cursor: 'not-allowed',
  });

export const PricingCardHeaderStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.warningText,
    fontWeight: 'bold',
    position: 'absolute',
    top: '50%',
    left: '13px',
    marginTop: '0px',
    transform: 'translateY(-50%)',
  });

export const expanderDivStyle = style({
  width: '100%',
});

export const pricingCardDivStyle = style({
  padding: '10px',
  height: '90px',
  width: 'calc(25% - 10px)',
  maxWidth: '350px',
  minWidth: '250px',
  margin: '10px 5px',
  position: 'relative',
  cursor: 'pointer',
});

export const pricingCardFeaturesDivStyle = style({
  position: 'absolute',
  left: '65px',
  top: '50%',
  paddingRight: '10px',
  transform: 'translateY(-50%)',
});

export const pricingCardContainerDivStyle = style({
  padding: '0',
  margin: '0px 5px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
});

export const featureListDivStyle = style({
  padding: '10px',
  maxWidth: '700px',
  marginTop: '10px',
  width: 'calc(100% / 2)',
});

export const groupTabsNavStyle = style({
  display: 'flex',
});

export const groupTabDivStyle = (theme: ThemeExtended) =>
  style({
    backgroundColor: theme.palette.neutralTertiaryAlt,
    width: 'calc(100% / 3)',
    textAlign: 'center',
    height: '83px',
    paddingTop: '7px',
    boxShadow: theme.palette.black,
    cursor: 'pointer',
    color: theme.semanticColors.bodyText,
  });

export const groupTabH1Style = style({
  marginTop: '2px',
  fontSize: '15px',
  fontWeight: 'bold',
});

export const groupTabH2Style = style({
  fontSize: '12px',
  lineHeight: '0px',
});

export const groupTabIconDivStyle = style({
  height: '18px',
  width: '18px',
  paddingLeft: 'calc(145% / 3)',
});

export const groupTabSelectedDivStyle = (theme: ThemeExtended) =>
  style({
    backgroundColor: theme.palette.neutralLighterAlt,
    width: 'calc(100% / 3)',
    textAlign: 'center',
    height: '83px',
    paddingTop: '7px',
    boxShadow: theme.palette.black,
    cursor: 'pointer',
  });
