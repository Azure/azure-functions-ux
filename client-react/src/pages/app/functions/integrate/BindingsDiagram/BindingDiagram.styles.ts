import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';
import { color } from 'csx';

export const getCardStyle = (theme: ThemeExtended) => {
  return style({
    border: `solid 1px ${theme.semanticColors.cardBorderColor}`,
    borderRadius: '2px',
    minWidth: '250px',
    maxWidth: '350px',
    minHeight: '70px',
    paddingTop: '1px',
  });
};

export const getHeaderStyle = (theme: ThemeExtended) => {
  return style({
    height: '35px',
    backgroundColor: '#fafafa',
    borderBottom: `solid 1px ${color(theme.semanticColors.cardBorderColor).lighten('20%')}`,

    // Necessary for some reason to prevent overlap with right border on middle card
    marginRight: '1px',

    $nest: {
      h3: {
        marginTop: '0px',
        paddingTop: '5px',
        paddingLeft: '15px',
        fontWeight: '600',
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
  } as any);
};

export const listStyle = style({
  listStyleType: 'none',
  padding: '0px',
  margin: '0px',

  $nest: {
    li: {
      padding: '7px 18px',
    },
    '.emptyMessage': {
      color: '#7f7f7f',
    },
  },
});
