import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const gridContainerStyle = style({
  display: 'inline-grid',
  gridTemplateColumns: 'auto auto auto',
  padding: '10px',
});

export const radioButtonStyle = style({
  padding: 0,
});

export const planFeatureItemStyle = (theme: ThemeExtended): string =>
  style({
    border: `1px solid ${theme.semanticColors.bodyDivider}`,
    padding: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
  });

export const gridUnselectedItemStyle = (theme: ThemeExtended): string =>
  style({
    border: `1px solid ${theme.semanticColors.bodyDivider}`,
    padding: '15px',
    textAlign: 'center',
  });

export const gridSelectedItemStyle = (theme: ThemeExtended): string =>
  style({
    borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
    borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
    borderLeft: `1px solid ${theme.semanticColors.buttonPressed}`,
    borderRight: `1px solid ${theme.semanticColors.buttonPressed}`,
    padding: '15px',
    textAlign: 'center',
  });

export const gridBottomSelectedItemStyle = (theme: ThemeExtended): string =>
  style({
    borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
    borderBottom: `1px solid ${theme.semanticColors.buttonPressed}`,
    borderLeft: `1px solid ${theme.semanticColors.buttonPressed}`,
    borderRight: `1px solid ${theme.semanticColors.buttonPressed}`,
    padding: '15px',
    textAlign: 'center',
  });

export const skuTitleStyle = style({
  paddingTop: '0px',
  textAlign: 'center',
  fontWeight: 'bold',
});

export const skuDescriptionStyle = style({
  paddingBottom: '30px',
  textAlign: 'center',
});

export const skuTitleUnselectedStyle = (theme: ThemeExtended): string =>
  style({
    border: `1px solid ${theme.semanticColors.bodyDivider}`,
    textAlign: 'center',
    padding: '20px',
  });

export const skuTitleSelectedStyle = (theme: ThemeExtended): string =>
  style({
    borderTop: `1px solid ${theme.semanticColors.buttonPressed}`,
    borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
    borderLeft: `1px solid ${theme.semanticColors.buttonPressed}`,
    borderRight: `1px solid ${theme.semanticColors.buttonPressed}`,
    padding: '20px',
    textAlign: 'center',
  });

export const planFeaturesTitleStyle = (theme: ThemeExtended): string =>
  style({
    border: `1px solid ${theme.semanticColors.bodyDivider}`,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingTop: '73px',
  });
