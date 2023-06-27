import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

const spacingBetweenElements = '10px';
const maxElementWidth = '750px';
const maxElementWithLabelWidth = '550px';

export const textboxStyle = style({
  maxWidth: maxElementWithLabelWidth,
  marginBottom: '-5px',
});

export const descriptionStyle = style({
  marginBottom: spacingBetweenElements,
  maxWidth: maxElementWidth,
});

export const userHeaderStyle = style({
  marginTop: '0px',
  paddingTop: '0px',
});

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
  maxWidth: maxElementWidth,
});

export const deploymentCenterConsole = (theme: ThemeExtended): string =>
  style({
    backgroundColor: `${theme.semanticColors.bodyStandoutBackground}`,
    padding: '15px',
    borderWidth: 'thin',
    borderStyle: 'solid',
    overflowX: 'scroll',
    marginBottom: '68px',
  });

export const deploymentCenterContainerLogsBox = style({
  fontFamily: '"Lucida Console", "Courier New", "Consolas", "monospace"',
  color: 'white',
  backgroundColor: 'black',
  position: 'fixed',
  height: 'calc(100% - 250px)',
  width: 'calc(100% - 50px)',
  overflowY: 'auto',
  marginTop: '10px',
  marginLeft: 'auto',
  marginRight: 'auto',
  whiteSpace: 'pre-line',
  overflowWrap: 'break-word',
});

export const deploymentCenterCodeLogsBox = style({
  position: 'static',
  height: 'calc(100% - 250px)',
  width: 'calc(100% - 50px)',
  overflowY: 'auto',
  marginTop: '10px',
  marginLeft: 'auto',
  marginRight: 'auto',
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
  maxWidth: maxElementWidth,
  marginTop: '1em',
  marginBottom: '1em',
});

export const deploymentCenterAcrBannerDiv = style({
  maxWidth: maxElementWidth,
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
  display: 'block',
  marginTop: '5px',
});

export const panelOverflowStyle = {
  content: [
    {
      overflowX: 'hidden',
    },
  ],
};

export const ftpsPasswordTextboxStyle = (fullpage: boolean) =>
  style({
    display: 'inline-table',
    width: fullpage ? '119%' : '100%',
    margin: '-5px 0px 0px 0px',
    padding: '0px',
  });

export const disconnectWorkflowInfoStyle = style({
  marginTop: '15px',
  marginBottom: '15px',
});

export const logsTimerStyle = style({
  marginTop: '10px',
});

export const closePublishProfileButtonStyle = style({
  marginTop: '100%',
  bottom: '20px',
  position: 'absolute',
});

export const closePreviewButtonStyle = style({
  height: '32px',
  width: '80px',
  fontSize: '14px',
  borderRadius: '2px',
});

export const titleWithPaddingStyle = style({
  paddingTop: '10px',
});

export const vstsDescriptionStyle = style({
  paddingTop: '15px',
});

export const logsButtonStyle = style({
  marginTop: '10px',
  height: '36px',
});

export const downloadButtonStyle = style({
  marginTop: '10px',
  height: '36px',
});

export const textboxPaddingStyle = style({
  paddingTop: '10px',
});

export const changeAccountInfoButtonStyle = style({
  paddingBottom: '10px',
});

export const addIdentityLinkStyle = style({
  padding: '10px 10px 10px 9px',
});

export const buttonFooterStyle = (theme: ThemeExtended): string =>
  style({
    backgroundColor: `${theme.semanticColors.background}`,
    borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
    padding: '16px 48px',
    boxSizing: 'border-box',
    position: 'fixed',
    bottom: 0,
    zIndex: 1,
    width: '100%',
    height: '68px',
  });

export const loadingComboBoxStyle = style({
  display: 'flex',
  alignItems: 'center',
});

export const comboBoxSpinnerStyle = style({
  padding: '0px 0px 16px 10px',
});

export const deploymentCenterDescriptionTextStyle = style({
  maxWidth: maxElementWidth,
  marginTop: '1em',
  marginBottom: '1em',
});

export const deploymentCenterVstsCodeLogsLinkStyle = style({
  marginRight: '10px',
});
