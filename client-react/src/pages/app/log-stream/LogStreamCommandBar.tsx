import React, { useContext } from 'react';
import { IButtonProps, CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { useTranslation } from 'react-i18next';
import { LogEntry, LogType, LogsEnabled } from './LogStream.types';
import { ThemeContext } from '../../../ThemeContext';
import { logStreamEnabled, copyLogEntries } from './LogStreamData';

// tslint:disable-next-line:member-ordering

// Data for CommandBar
const getItems = (
  reconnectFunction: any,
  pauseLogs: any,
  startLogs: any,
  clearFunction: any,
  isStreaming: boolean,
  logEntries: LogEntry[],
  logType: LogType,
  logsEnabled: LogsEnabled,
  t: (string) => string
): ICommandBarItemProps[] => {
  const disableCommand = !logStreamEnabled(logType, logsEnabled);
  return [
    {
      key: 'reconnect',
      name: t('logStreaming_reconnect'),
      iconProps: {
        iconName: 'PlugConnected',
      },
      disabled: disableCommand,
      onClick: reconnectFunction,
    },
    {
      key: 'copy',
      name: t('functionKeys_copy'),
      iconProps: {
        iconName: 'Copy',
      },
      disabled: disableCommand,
      onClick: () => copyLogEntries(logEntries),
    },
    {
      key: 'toggle',
      name: isStreaming ? t('logStreaming_pause') : t('logStreaming_start'),
      iconProps: {
        iconName: isStreaming ? 'Pause' : 'Play',
      },
      disabled: disableCommand,
      onClick: isStreaming ? pauseLogs : startLogs,
    },
    {
      key: 'clear',
      name: t('logStreaming_clear'),
      iconProps: {
        iconName: 'StatusCircleErrorX',
      },
      disabled: disableCommand,
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
  logType: LogType;
  logsEnabled: LogsEnabled;
}

type LogStreamCommandBarPropsCombined = LogStreamCommandBarProps;

export const LogStreamCommandBar: React.FC<LogStreamCommandBarPropsCombined> = props => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { reconnect, pause, start, clear, isStreaming, logEntries, logType, logsEnabled } = props;

  const customButton = (buttonProps: IButtonProps) => {
    return (
      <CommandBarButton
        {...buttonProps}
        onClick={buttonProps.onClick}
        styles={{
          ...buttonProps.styles,
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
      items={getItems(reconnect, pause, start, clear, isStreaming, logEntries, logType, logsEnabled, t)}
      role="nav"
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

export default LogStreamCommandBar;
