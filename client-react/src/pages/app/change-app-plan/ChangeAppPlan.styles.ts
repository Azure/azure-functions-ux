import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const leftCol = style({
  marginRight: '20px',
});

export const wrapperStyle = {
  padding: '30px',
};

export const formStyle = {
  marginTop: '30px',
};

export const sectionStyle = {
  marginTop: '10px',
};

export const labelSectionStyle = style({
  textTransform: 'uppercase',
  fontSize: '11px',
  fontWeight: 600,
});

export const headerStyle = {
  marginTop: '50px',
};

export const planTypeStyle = style({
  marginBottom: '-10px',
});

export const buttonFooterStyle = (theme: ThemeExtended): string =>
  style({
    backgroundColor: `${theme.semanticColors.background}`,
    borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
    padding: '16px',
    boxSizing: 'border-box',
    position: 'fixed',
    bottom: 0,
    zIndex: 1,
    width: '100%',
    height: '65px',
  });

export const buttonPadding = style({
  margin: '5px',
  height: '24px',
  width: '78px',
  fontSize: '13px',
  borderRadius: '2px',
});
