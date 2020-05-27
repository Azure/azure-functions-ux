import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { IDetailsListStyles } from 'office-ui-fabric-react';

export const DEFAULTLISTHEIGHT = '31px';

export const commandBarStyles = (theme: ThemeExtended) => {
  return {
    root: [
      {
        paddingLeft: '0px',
        backgroundColor: theme.semanticColors.bodyBackground,
      },
    ],
  };
};

export const tableCommandBarButtonStyle = (theme: ThemeExtended) => {
  return {
    root: {
      marginTop: '5px',
      selectors: {
        ':active': {
          color: theme.semanticColors.buttonTextChecked,
        },
        ':focus': {
          color: theme.semanticColors.bodyTextChecked,
        },
      },
    },
  };
};

export const DetailListStyles = (): Partial<IDetailsListStyles> => {
  return {
    root: {
      selectors: {
        '.ms-List-cell': {
          minHeight: DEFAULTLISTHEIGHT,
        },
        '.ms-DetailsRow': {
          minHeight: DEFAULTLISTHEIGHT,
          maxHeight: DEFAULTLISTHEIGHT,
        },
        '.ms-DetailsRow-fields': {
          maxHeight: DEFAULTLISTHEIGHT,
        },
        '.ms-DetailsRow-cell': {
          paddingTop: '8px',
        },
        'ms-Shimmer-shimmerWrapper': {
          height: DEFAULTLISTHEIGHT,
        },
      },
    },
  };
};
