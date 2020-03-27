import { style } from 'typestyle';
import { LogLevel } from './FunctionLog.types';

export const getMaximizedLogPanelHeight = (readOnlyBannerHeight?: number) => {
  return window.innerHeight - (164 + (readOnlyBannerHeight || 0));
};

export const minimumLogPanelHeight = 135;

export const logCommandBarHeight = 37;

export const logCommandBarStyle = style({
  height: `${logCommandBarHeight}px`,
});

export const logStreamStyle = (maximized: boolean, logPanelHeight: number, readOnlyBannerHeight: number) =>
  style({
    height: maximized ? `${getMaximizedLogPanelHeight(readOnlyBannerHeight)}px` : `${logPanelHeight}px`,
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

export function getLogTextColor(severity: LogLevel): string {
  switch (severity) {
    case LogLevel.Error:
      return '#ff6161';
    case LogLevel.Information:
      return '#00bfff';
    case LogLevel.Warning:
      return 'orange';
    case LogLevel.Verbose:
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
