import { useMemo } from 'react';
import { style } from 'typestyle';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import { getCalloutContainerStyles } from './Common.styles';

const callout = style({
  boxSizing: 'border-box',
  width: '500px',
});

export const useStyles = (layout: Layout = Layout.Horizontal) => {
  const calloutContainer = useMemo(() => getCalloutContainerStyles(layout), [layout]);

  return {
    callout,
    calloutContainer,
  };
};
