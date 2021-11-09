import { MessageBarType } from '@fluentui/react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const messageBannerStyles = (isCustomIcon: boolean, undocked?: boolean) => {
  const styles = {
    root: {},
    content: {
      paddingLeft: '15px',
    },
    text: {
      marginTop: '9px',
      marginBottom: '8px',
    },
    innerText: {
      marginLeft: isCustomIcon ? '24px' : undefined,
      marginRight: isCustomIcon ? '5px' : undefined,
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
  if (undocked) {
    styles.root = {
      border: '1px solid #f0f6ff',
      borderRadius: '2px',
      marginTop: '10px',
      marginBottom: '10px',
    };
  }
  if (!isCustomIcon) {
    styles.icon = {
      marginTop: '9px',
      marginBottom: '8px',
    };
  }
  return styles;
};

export const messageBannerIconStyle = style({
  height: '16px',
  width: '16px',
  position: 'absolute',
  marginLeft: '-24px',
  marginRight: '10px',
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

export const bannerLinkStyle = (theme: ThemeExtended) =>
  style({
    cursor: 'pointer',
    color: theme.semanticColors.link,
    textDecoration: 'none',
    $nest: {
      '&:hover': {
        color: theme.semanticColors.linkHovered,
        textDecoration: 'underline',
      },
    },
  });
