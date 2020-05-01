import { style } from 'typestyle';
import { mergeStyleSets, FontWeights } from 'office-ui-fabric-react';

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const pivotContent = style({
  padding: '5px 20px',
});

export const deploymentCenterContent = style({
  marginTop: '20px',
  maxWidth: '800px',
});

export const containerLogs = style({
  whiteSpace: 'pre-line',
  margin: 0,
});

export const additionalTextFieldControl = style({
  marginLeft: '5px',
});

export const resetCallout = mergeStyleSets({
  dialog: {
    maxWidth: '300px',
  },
  header: {
    padding: '18px 24px 12px',
  },
  title: {
    margin: 0,
    fontWeight: FontWeights.regular,
  },
  inner: {
    height: '100%',
    padding: '0 24px 20px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 24px 24px',
  },
  subtext: {
    margin: 0,
    fontWeight: FontWeights.semilight,
  },
});
