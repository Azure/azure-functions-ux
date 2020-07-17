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

export const deploymentCenterConsole = style({
  whiteSpace: 'pre-line',
  backgroundColor: '#f3f2f1',
  padding: '15px',
  borderWidth: 'thin',
  borderStyle: 'solid',
  overflowWrap: 'break-word',
});

export const deploymentCenterLogsError = style({
  marginTop: '20px',
});

export const additionalTextFieldControl = style({
  marginLeft: '5px',
});

export const deploymentCenterInfoBannerDiv = style({
  maxWidth: '800px',
  marginTop: '1em',
  marginBottom: '1em',
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

export const calloutStyle = style({
  width: '300px',
});

export const calloutContent = style({
  margin: '18px 24px 12px',
});

export const calloutContentButton = style({
  margin: '18px 12px 10px 0px',
});

export const choiceGroupSubLabel = style({
  paddingLeft: '26px',
  fontSize: '12px',
  color: '#605E5C',
});

export const panelBanner = style({
  position: 'relative',
});
