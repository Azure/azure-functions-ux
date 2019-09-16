import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const bannerStyle = (theme: ThemeExtended) =>
  style({
    backgroundColor: theme.semanticColors.infoBackground,
    paddingLeft: '20px',
    height: '35px',
  });

export const infoIconStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.infoIcon,
    fontSize: '16px',
    paddingRight: '5px',
    paddingTop: '3px',
  });
