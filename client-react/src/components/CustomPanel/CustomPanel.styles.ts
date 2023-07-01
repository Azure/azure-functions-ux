import { style } from 'typestyle';

import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const panelHeaderStyle = style({
  padding: '8px 20px',
  width: '100%',

  $nest: {
    h3: {
      display: 'inline-block',
      fontSize: '20px',
      margin: '0px',
    },
  },
});

export const panelStyle = {
  content: [
    {
      padding: '0px',
      selectors: {
        '@media screen and (min-width: 1366px)': {
          padding: '0px',
        },
        '@media screen and (min-width: 640px)': {
          padding: '0px',
        },
      },
    },
  ],
};

export const panelBodyStyle = {
  marginTop: '10px',
  padding: '0px 20px 20px 20px',
};

export const closeButtonStyle = (theme: ThemeExtended) =>
  style({
    $nest: {
      '&:hover': { background: 'red' },
    },
    backgroundColor: 'transparent',
    transitionProperty: 'background-color',
    transitionDelay: '0s',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-out',
    fill: theme.semanticColors.bodyText,
    height: '32px',
    width: '32px',
    cursor: 'pointer',
    border: '0px',
    padding: '0px',
    float: 'right',
  });

export const closeButtonSvgStyle = () =>
  style({
    height: '12px',
    width: '12px',
  });
