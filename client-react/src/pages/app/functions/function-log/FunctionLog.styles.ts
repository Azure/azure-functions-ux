import { style } from 'typestyle';
import { CommonConstants } from '../../../../utils/CommonConstants';

export const logCommandBarStyle = style({
  height: '37px',
});

export const logStreamStyle = (maximized: boolean, readOnlyBannerHeight: number) =>
  style({
    height: maximized ? `calc(100vh - ${164 + readOnlyBannerHeight}px)` : '135px',
    backgroundColor: '#000000',
    overflow: 'auto',
    padding: '20px',
  });

export const logCommandBarButton = style({
  marginTop: '5px',
  paddingRight: '5px',
});

export const logEntryDivStyle = style({
  whiteSpace: 'pre-wrap',
  paddingBottom: '5px',
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
