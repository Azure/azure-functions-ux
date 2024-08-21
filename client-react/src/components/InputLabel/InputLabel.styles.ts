import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const labelStyle = style({
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '18px',
});

export const requiredIconStyle = (theme: ThemeExtended): string =>
  style({
    color: theme.semanticColors.errorText,
    fontWeight: 'bold',
    padding: '0 4px',
  });
