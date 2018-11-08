import * as React from 'react';
import { compose } from 'recompose';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { style } from 'typestyle';
import { LogEntry, LogLevel } from './LogStream.Types';

interface LogStreamLogContainerProps {
  clearLogs: boolean;
  logEntries: LogEntry[];
}

const containerDivStyle = style({
  position: 'absolute',
  padding: '15px 0px 0px 15px',
  height: 'calc(100% - 55px)',
  width: 'calc(100% - 30px)',
});

const bodyDivStyle = style({
  fontFamily: '"Lucida Console", "Courier New", "Consolas", "monospace"',
  backgroundColor: 'black',
  marginLeft: 'auto',
  marginRight: 'auto',
  overflow: 'auto',
  wordBreak: 'break-word',
  wordWrap: 'break-word',
  width: '100%',
  height: 'calc(100% - 20px)',
});

const connectingDivStyle = style({
  color: 'gray',
  fontWeight: 'bolder',
  whiteSpace: 'normal',
  paddingBottom: '5px',
});

const logEntryDivStyle = style({
  whiteSpace: 'pre-wrap',
  paddingBottom: '5px',
});

type LogStreamLogContainerPropsCombined = LogStreamLogContainerProps & InjectedTranslateProps;
class LogStreamLogContainer extends React.Component<LogStreamLogContainerPropsCombined> {
  constructor(props) {
    super(props);
  }

  public render() {
    const { clearLogs, logEntries, t } = this.props;
    return (
      <div className={containerDivStyle}>
        <div className={bodyDivStyle}>
          {!clearLogs && <div className={connectingDivStyle}>{t('Connecting...')}</div>}
          {!!logEntries &&
            logEntries.map(logEntry => (
              <div key={logEntry.message} className={logEntryDivStyle} style={{ color: this._getLogTextColor(logEntry.level) }}>
                {logEntry.message}
              </div>
            ))}
        </div>
      </div>
    );
  }

  private _getLogTextColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.Error:
        return '#ff6161';
      case LogLevel.Info:
        return '#00bfff';
      case LogLevel.Warning:
        return 'orange';
      default:
        return 'white';
    }
  }
}

export default compose<LogStreamLogContainerPropsCombined, LogStreamLogContainerProps>(translate('translation'))(LogStreamLogContainer);
