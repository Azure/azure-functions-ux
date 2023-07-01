import { style } from 'typestyle';

import { mergeStyles, PartialTheme } from '@fluentui/react';

export const wrapperClass = mergeStyles({
  selectors: {
    '& > .ms-Shimmer-container': {
      margin: '10px 0',
    },
  },
});

export const wrapperStyle = { display: 'flex' };

export const shimmerStyle = style({
  marginTop: '10px',
});

/**
 * @note
 * Theme override to fix shimmers. `semanticColors.disabledBackground` is an empty string due to having previously been an invalid color
 * value since 2018. We cannot fix this because other colors (e.g., disabled buttons and combo boxes) have come to rely on this style
 * doing nothing.
 */
export const shimmerTheme: PartialTheme = {
  semanticColors: {
    disabledBackground: 'rgba(128, 128, 128, 0.1)',
  },
};
