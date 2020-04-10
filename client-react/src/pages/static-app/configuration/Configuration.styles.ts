import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const formStyle = style({
  padding: '5px 20px',
});

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const fileSelectorStackStyle = (theme: ThemeExtended) =>
  style({
    padding: '8px 15px 8px 25px',
    borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}`,
    background: theme.semanticColors.background,
  });
