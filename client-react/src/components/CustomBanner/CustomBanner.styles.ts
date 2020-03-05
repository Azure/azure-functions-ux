import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { MessageBarType } from 'office-ui-fabric-react';

export const messageBannerStyles = isCustomIcon => {
  const styles = {
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
      display: isCustomIcon ? ('none' as 'none') : ('contents' as 'contents'),
    },
    icon: {},
  };
  if (!isCustomIcon) {
    styles.icon = {
      marginTop: '9px',
    };
  }
  return styles;
};

export const messageBannerTextStyle = style({
  marginLeft: '24px',
});

export const messageBannerIconStyle = style({
  position: 'absolute',
  height: '16px',
  width: '16px',
});

export const messageBannerClass = (theme: ThemeExtended, type: MessageBarType) => {
  return style({
    backgroundColor: type === MessageBarType.info ? theme.semanticColors.infoBackground : undefined,
  });
};
