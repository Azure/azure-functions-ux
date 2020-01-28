import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { style } from 'typestyle';

export const messageBannerStyle = (theme: ThemeExtended) => {
  return style({
    backgroundColor: theme.semanticColors.infoBackground,
  });
};
