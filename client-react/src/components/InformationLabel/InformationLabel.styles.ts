import { style } from 'typestyle';

import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const labelValueStyle = (theme: ThemeExtended) => {
  return style({
    color: theme.semanticColors.textColor,
  });
};
