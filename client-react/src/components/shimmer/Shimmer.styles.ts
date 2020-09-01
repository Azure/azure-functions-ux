import { mergeStyles } from 'office-ui-fabric-react';
import { style } from 'typestyle';

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
