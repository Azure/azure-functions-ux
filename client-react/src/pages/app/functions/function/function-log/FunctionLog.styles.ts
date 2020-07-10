import { style } from 'typestyle';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { IButtonStyles } from 'office-ui-fabric-react';

export const getMaximizedLogPanelHeight = (readOnlyBannerHeight?: number) => {
  return window.innerHeight - (164 + (readOnlyBannerHeight || 0));
};

export const minimumLogPanelHeight = 135;

export const logCommandBarHeight = 37;

export const logCommandBarStyle = style({
  height: `${logCommandBarHeight}px`,
});

export const logStreamStyle = (maximized: boolean, logPanelHeight: number, readOnlyBannerHeight: number, customHeight?: number) =>
  style({
    height: customHeight
      ? `${customHeight}px`
      : maximized
      ? `${getMaximizedLogPanelHeight(readOnlyBannerHeight)}px`
      : `${logPanelHeight}px`,
    backgroundColor: '#000000',
    overflow: 'auto',
    padding: '20px',
    fontFamily: 'monospace, Lucida Console, Courier New, Consolas',
  });

export const logCommandBarButton = style({
  marginTop: '5px',
  paddingRight: '5px',
});

export const logEntryDivStyle = style({
  whiteSpace: 'pre-wrap',
});

export function getLogTextColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case CommonConstants.LogLevels.error:
      return '#ff6161';
    case CommonConstants.LogLevels.information:
      return '#00bfff';
    case CommonConstants.LogLevels.warning:
      return 'orange';
    case CommonConstants.LogLevels.verbose:
    default:
      return 'white';
  }
}

export const logErrorDivStyle = style({
  whiteSpace: 'pre-wrap',
  paddingBottom: '5px',
  color: '#ff6161',
});

export const logConnectingDivStyle = style({
  whiteSpace: 'pre-wrap',
  paddingBottom: '5px',
  color: 'white',
});

export const getCommandBarStyle = (styleProps, leftAlignMainToolbarItems) => {
  const newCommandBarStyles = CommandBarStyles(styleProps);
  if (newCommandBarStyles.root && newCommandBarStyles.root[0]) {
    newCommandBarStyles.root[0] = { ...newCommandBarStyles.root[0], borderBottom: undefined };
    if (leftAlignMainToolbarItems) {
      newCommandBarStyles.root[0] = { ...newCommandBarStyles.root[0], paddingLeft: '0px' };
    }
  }
  return newCommandBarStyles;
};

export const calloutStyle = style({
  padding: '20px',
  width: '300px',
});

export const logFilterItemStyle = {
  flexContainer: {
    flexDirection: 'row-reverse',
  },
} as IButtonStyles;
