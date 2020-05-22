import { style } from 'typestyle';

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

export const deploymentCenterLogs = style({
  whiteSpace: 'pre-line',
  margin: 0,
});

export const additionalTextFieldControl = style({
  marginLeft: '5px',
});
