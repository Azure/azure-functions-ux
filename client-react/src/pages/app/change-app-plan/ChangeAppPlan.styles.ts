import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const leftCol = style({
  marginRight: '20px',
});

export const wrapperStyle = style({
  padding: '30px',
});

export const formStyle = style({
  marginTop: '30px',
  marginBottom: '40px',
});

export const sectionStyle = style({
  marginTop: '10px',
});

export const labelSectionStyle = style({
  textTransform: 'uppercase',
  fontSize: '11px',
  fontWeight: 600,
});

export const headerStyle = style({
  marginTop: '50px',
});

export const planTypeStyle = style({
  marginBottom: '-10px',
});

export const bannerStyle = style({
  maxWidth: '725px',
  marginBottom: '5px',
});

export const textboxStyle = style({
  maxWidth: '275px',
  paddingRight: '0px',
});

export const linkStyle = style({
  marginTop: '-20px',
  paddingBottom: '15px',
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
