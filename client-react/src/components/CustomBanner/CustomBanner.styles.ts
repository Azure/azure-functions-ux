import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { MessageBarType } from 'office-ui-fabric-react';

export const messageBannerStyles = (isCustomIcon: boolean) => {
  const styles = {
    content: {
      paddingLeft: '15px',
    },
    text: {
      marginTop: '9px',
      marginBottom: '8px',
    },
    innerText: {
      marginLeft: isCustomIcon ? '24px' : undefined,
    },
    iconContainer: {
      display: isCustomIcon ? ('none' as 'none') : ('contents' as 'contents'),
    },
    icon: {},
    dismissal: {
      height: '16px',
      width: '16px',
      position: 'relative' as 'relative',
      right: '0px',
    },
  };
  if (!isCustomIcon) {
    styles.icon = {
      marginTop: '9px',
      marginBottom: '8px',
    };
  }
  return styles;
};

export const messageBannerIconStyle = style({
  position: 'absolute',
  height: '16px',
  width: '16px',
  marginLeft: '-24px',
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
