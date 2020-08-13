import { mergeStyles } from 'office-ui-fabric-react';

export const wrapperClass = mergeStyles({
  selectors: {
    '& > .ms-Shimmer-container': {
      margin: '10px 0',
    },
  },
});

export const wrapperStyle = { display: 'flex' };
