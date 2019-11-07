import { ThemeExtended } from '../../theme/SemanticColorsExtended';

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
