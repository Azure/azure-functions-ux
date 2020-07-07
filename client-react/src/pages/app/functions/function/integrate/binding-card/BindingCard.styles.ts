import { color } from 'csx';
import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';

export const cardStyle = (theme: ThemeExtended) => {
  return style({
    backgroundColor: theme.semanticColors.cardBackgroundColor,
    border: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    borderRadius: '2px',
    minWidth: '250px',
    maxWidth: '350px',
    minHeight: '70px',
    paddingTop: '1px',
  });
};

export const headerStyle = (theme: ThemeExtended): string => {
  return style({
    height: '35px',
    backgroundColor: color(theme.semanticColors.cardBackgroundColor)
      .darken('2%')
      .toString(),
    borderBottom: `solid 1px ${color(theme.semanticColors.cardBorderColor).lighten('20%')}`,

    $nest: {
      h3: {
        marginTop: '5px',
        fontWeight: 600,
        display: 'inline-block',
      },
      svg: {
        height: '20px',
        width: '20px',
        marginTop: '7px',
        marginLeft: '14px',
        marginRight: '7px',
        float: 'left',
      },
    },
  });
};

export const listStyle = (theme: ThemeExtended): string => {
  return style({
    listStyleType: 'none',
    padding: '0px',
    margin: '0px',

    $nest: {
      li: {
        padding: '7px 18px',
      },
      '.emptyMessage': {
        color: theme.semanticColors.disabledBodyText,
      },
      '.unknownBinding': {
        color: theme.semanticColors.disabledBodyText,
      },
    },
  });
};
