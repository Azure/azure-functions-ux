import { useMemo } from 'react';
import { style } from 'typestyle';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';

const callout = style({
  boxSizing: 'border-box',
  width: '500px',
});

export const useStyles = (layout: Layout = Layout.Horizontal) => {
  const calloutContainer = useMemo(
    () =>
      style({
        marginTop: '-15px',
        marginRight: '0px',
        marginBottom: '15px',
        marginLeft: layout === Layout.Horizontal ? '200px' : '0px',
      }),
    [layout]
  );

  return {
    callout,
    calloutContainer,
  };
};
