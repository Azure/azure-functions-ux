import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { IDetailsListStyles } from 'office-ui-fabric-react';
import { style } from 'typestyle';

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
          height: 'auto',
        },
        '.ms-DetailsRow': {
          minHeight: DEFAULTLISTHEIGHT,
          height: 'auto',
        },
        '.ms-DetailsRow-fields': {
          minHeight: DEFAULTLISTHEIGHT,
          height: 'auto',
        },
        '.ms-DetailsRow-cell': {
          paddingTop: '5px',
          paddingBottom: '5px',
          minHeight: DEFAULTLISTHEIGHT,
          height: 'fit-content',
        },
        'ms-Shimmer-shimmerWrapper': {
          height: DEFAULTLISTHEIGHT,
        },
      },
    },
  };
};

export const linkCellStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.actionLink,
  });
