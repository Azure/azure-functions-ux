import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';
import { color } from 'csx';

export const cardStyle = (theme: ThemeExtended) => {
  return style({
    backgroundColor: theme.palette.neutralLighter,
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
    backgroundColor: theme.palette.neutralLighterAlt,
    borderBottom: `solid 1px ${color(theme.semanticColors.cardBorderColor).lighten('20%')}`,

    $nest: {
      h3: {
        marginTop: '0px',
        paddingTop: '5px',
        paddingLeft: '15px',
        fontWeight: 600,
        display: 'inline-block',
      },
      svg: {
        height: '20px',
        width: '20px',
        marginRight: '7px',
        marginTop: '7px',
        float: 'right',
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
    },
  });
};
