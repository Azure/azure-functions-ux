import { useMemo } from 'react';
import { style } from 'typestyle';
import { Layout } from '../../../../../components/form-controls/ReactiveFormControl';
import { getCalloutContainerStyles } from '../Common.styles';

const buttonContainer = style({
  display: 'flex',
  gap: '8px',
  marginTop: '10px',
});

const callout = style({
  boxSizing: 'border-box',
  padding: '16px 24px',
  minHeight: '152px',
  width: '324px',
});

const container = style({
  display: 'flex',
  flexDirection: 'column',
});

const header = style({
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '24px',
  marginBlock: 0,
});

const overrideLoadingComboboxStyles = style({
  display: 'block',
});

const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const useStyles = (layout: Layout) => {
  const calloutContainer = useMemo(() => getCalloutContainerStyles(layout), [layout]);

  return {
    buttonContainer,
    callout,
    calloutContainer,
    container,
    header,
    overrideLoadingComboboxStyles,
    section,
  };
};
