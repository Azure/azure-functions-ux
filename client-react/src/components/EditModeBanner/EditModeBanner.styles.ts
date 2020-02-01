import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { style } from 'typestyle';

export const messageBannerClass = (theme: ThemeExtended) => {
  return style({
    backgroundColor: theme.semanticColors.infoBackground,
  });
};

export const messageBannerStyles = {
  root: {
    height: '33px',
  },
  content: {
    height: '33px',
    paddingLeft: '15px',
  },
  text: {
    marginTop: '9px',
  },
  iconContainer: {
    display: 'none',
  },
};

export const messageBannerTextStyle = style({
  marginLeft: '24px',
});

export const messageBannerIconStyle = style({
  position: 'absolute',
  height: '16px',
  width: '16px',
});
