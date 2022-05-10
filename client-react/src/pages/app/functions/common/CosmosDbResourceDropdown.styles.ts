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
      layout === Layout.Horizontal
        ? style({
            marginBottom: '15px',
            marginRight: '162px',
            marginTop: '-15px',
            minWidth: '235px',
            textAlign: 'right',
          })
        : style({
            marginBottom: '15px',
            marginTop: '-15px',
          }),
    [layout]
  );

  return {
    callout,
    calloutContainer,
  };
};
