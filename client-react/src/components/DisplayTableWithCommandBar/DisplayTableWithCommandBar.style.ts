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

export const tableCommandBarButtonStyle = { root: { marginTop: '5px' } };
