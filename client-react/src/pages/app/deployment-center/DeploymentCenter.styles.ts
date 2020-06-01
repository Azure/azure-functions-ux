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

export const deploymentCenterLogsError = style({
  marginTop: '20px',
});

export const additionalTextFieldControl = style({
  marginLeft: '5px',
});

export const deploymentCenterCodeLogsNotConfigured = style({
  width: '100%',
  textAlign: 'center',
  marginBottom: '100px',

  $nest: {
    h3: {
      marginTop: '12px',
      fontSize: '18px',
    },

    p: {
      fontSize: '15px',
    },

    svg: {
      height: '200px',
      width: '200px',
      marginTop: '18px',
    },
  },
});
