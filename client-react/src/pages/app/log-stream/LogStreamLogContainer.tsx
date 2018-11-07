import * as React from 'react';
import { compose } from 'recompose';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { style } from 'typestyle';

interface LogStreamLogContainerProps {
  clearLogs: boolean;
}

interface ILogStreamLogContainerState {
  clearLogs: boolean;
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
  color: 'white',
  whiteSpace: 'normal',
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
});

type LogStreamLogContainerPropsCombined = LogStreamLogContainerProps & InjectedTranslateProps;
class LogStreamLogContainer extends React.Component<LogStreamLogContainerPropsCombined, ILogStreamLogContainerState> {
  constructor(props) {
    super(props);
    this.state = {
      clearLogs: props.clearLogs,
    };
  }

  public render() {
    const { t } = this.props;
    const { clearLogs } = this.state;

    return (
      <div className={containerDivStyle}>
        <div className={bodyDivStyle}>
          <div className={connectingDivStyle}>{!clearLogs && t('Connecting...')}</div>
        </div>
      </div>
    );
  }
}

export default compose<LogStreamLogContainerPropsCombined, LogStreamLogContainerProps>(translate('translation'))(LogStreamLogContainer);
