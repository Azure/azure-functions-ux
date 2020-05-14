import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const markdownHighlighter = () =>
  style({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  });

export const markdownHighlighterText = (theme: ThemeExtended) =>
  style({
    backgroundColor: theme.semanticColors.bodyStandoutBackground,
    color: theme.semanticColors.bodyText,
    padding: '3px 5px',
    fontWeight: 600,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: theme.semanticColors.inputBorder,
    width: '90%',
  });

export const markdownCopyButtonStyle = (theme: ThemeExtended) =>
  style({
    marginLeft: '5px',
    width: '25px',
    height: '25px',
    backgroundColor: theme.semanticColors.accentButtonBackground,
    color: theme.semanticColors.buttonTextChecked,
    $nest: {
      '&:hover': {
        color: theme.semanticColors.buttonTextChecked,
      },
    },
  });
