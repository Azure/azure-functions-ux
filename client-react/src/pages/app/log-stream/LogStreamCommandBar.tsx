import * as React from 'react';
import { IButtonProps, CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { compose } from 'recompose';
import { RootState } from '../../../modules/types';
import { connect } from 'react-redux';
import { ITheme } from 'office-ui-fabric-react/lib/Styling';
import { LogEntry } from './LogStream.types';
import { UtilitiesService } from '../../../utils/utilities';

// tslint:disable-next-line:member-ordering

// Data for CommandBar
const getItems = (
  reconnectFunction: any,
  pauseLogs: any,
  startLogs: any,
  clearFunction: any,
  isStreaming: boolean,
  logEntries: LogEntry[],
  t: (string) => string
): ICommandBarItemProps[] => {
  return [
    {
      key: 'reconnect',
      name: t('logStreaming_reconnect'),
      iconProps: {
        iconName: 'PlugConnected',
      },
      onClick: reconnectFunction,
    },
    {
      key: 'copy',
      name: t('functionKeys_copy'),
      iconProps: {
        iconName: 'Copy',
      },
      onClick: () => _copyLogs(logEntries),
    },
    {
      key: 'toggle',
      name: isStreaming ? t('logStreaming_pause') : t('logStreaming_start'),
      iconProps: {
        iconName: isStreaming ? 'Pause' : 'Play',
      },
      onClick: isStreaming ? pauseLogs : startLogs,
    },
    {
      key: 'clear',
      name: t('logStreaming_clear'),
      iconProps: {
        iconName: 'StatusCircleErrorX',
      },
      onClick: clearFunction,
    },
  ];
};
interface LogStreamCommandBarProps {
  reconnect: () => void;
  pause: () => void;
  start: () => void;
  clear: () => void;
  isStreaming: boolean;
  logEntries: LogEntry[];
}

interface IStateProps {
  theme: ITheme;
}

type LogStreamCommandBarPropsCombined = LogStreamCommandBarProps & InjectedTranslateProps & IStateProps;

export const LogStreamCommandBar: React.SFC<LogStreamCommandBarPropsCombined> = props => {
  const { reconnect, pause, start, clear, isStreaming, logEntries, t, theme } = props;

  const customButton = (props: IButtonProps) => {
    return (
      <CommandBarButton
        {...props}
        onClick={props.onClick}
        styles={{
          ...props.styles,
          root: {
            backgroundColor: theme.semanticColors.bodyBackground,
            border: '1px solid transparent',
          },
          rootDisabled: {
            backgroundColor: theme.semanticColors.bodyBackground,
          },
        }}
      />
    );
  };

  return (
    <CommandBar
      items={getItems(reconnect, pause, start, clear, isStreaming, logEntries, t)}
      aria-role="nav"
      buttonAs={customButton}
      styles={{
        root: {
          borderBottom: '1px solid rgba(204,204,204,.8)',
          backgroundColor: theme.semanticColors.bodyBackground,
          width: '100%',
        },
      }}
    />
  );
};

function _copyLogs(logs: LogEntry[]) {
  let logContent = '';
  logs.forEach(logEntry => {
    logContent += `${logEntry.message}\n`;
  });
  UtilitiesService.copyContentToClipboard(logContent);
}

const mapStateToProps = (state: RootState) => ({
  theme: state.portalService.theme,
});

export default compose<LogStreamCommandBarPropsCombined, LogStreamCommandBarProps>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(LogStreamCommandBar);
