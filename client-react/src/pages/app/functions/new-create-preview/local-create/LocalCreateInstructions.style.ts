import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';

export const markdownIconStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.menuIcon,
  });

export const linkStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.link,
    textDecoration: 'none',
    $nest: {
      '&:hover': {
        color: theme.semanticColors.linkHovered,
        textDecoration: 'underline',
      },
    },
  });
