import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

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

export const deploymentCenterConsole = (theme: ThemeExtended): string =>
  style({
    whiteSpace: 'pre-line',
    backgroundColor: `${theme.semanticColors.bodyStandoutBackground}`,
    padding: '15px',
    borderWidth: 'thin',
    borderStyle: 'solid',
    overflowWrap: 'break-word',
  });

export const deploymentCenterContainerLogs = style({
  whiteSpace: 'pre-line',
  padding: '15px',
  overflowWrap: 'break-word',
});

export const deploymentCenterLogsError = style({
  marginTop: '20px',
  display: 'flex',
  flexWrap: 'wrap',
  overflowWrap: 'normal',
  fontFamily: 'monospace',
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
  color: '#605E5C',
  paddingTop: '10px',
  paddingBottom: '10px',
});

export const panelBanner = style({
  position: 'relative',
});

export const disconnectLink = style({
  marginTop: '5px',
  width: '100%',
});

export const panelOverflowStyle = {
  content: [
    {
      overflowX: 'hidden',
    },
  ],
};

export const ftpsPasswordTextboxStyle = style({
  display: 'inline-table',
  width: '119%',
});

export const disconnectWorkflowInfoStyle = style({
  marginTop: '15px',
  marginBottom: '15px',
});

export const logsTimerStyle = style({
  marginTop: '10px',
  fontSize: '10px',
});

export const closePublishProfileButtonStyle = style({
  marginTop: '100%',
  bottom: '20px',
  position: 'absolute',
});

export const closePreviewButtonStyle = style({
  marginTop: '10px',
  bottom: '10px',
  position: 'relative',
});
