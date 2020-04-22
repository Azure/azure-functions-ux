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

export const environmentSelectorStackStyle = (theme: ThemeExtended) =>
  style({
    padding: '8px 15px 8px 25px',
    borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}`,
    background: theme.semanticColors.background,
  });

export const environmentSelectorLabelStyle = style({
  paddingRight: '10px',
});

export const copyButtonIconStyle = style({
  paddingLeft: '5px',
  paddingTop: '2px',
});
