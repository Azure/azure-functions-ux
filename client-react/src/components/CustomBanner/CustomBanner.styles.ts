import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { MessageBarType } from 'office-ui-fabric-react';

export const messageBannerStyles = (isCustomIcon: boolean) => {
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
    dismissal: {
      height: '16px',
      width: '16px',
      position: 'absolute' as 'absolute',
      right: '0px',
    },
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
    /**
     * Other banner colors are consistent with the Ibiza pattern.
     * Office Fabric's info banner has a grey background color for some reason, so just need to handle that for now.
     */
    backgroundColor: type === MessageBarType.info ? theme.semanticColors.infoBackground : undefined,
  });
};
