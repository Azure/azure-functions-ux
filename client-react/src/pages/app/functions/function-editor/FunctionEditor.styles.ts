import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';

export const fileSelectorStackStyle = (theme: ThemeExtended) =>
  style({
    padding: '8px 15px 8px 15px',
    borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}`,
  });

export const fileDropdownStyle = style({
  minWidth: '200px',
});
