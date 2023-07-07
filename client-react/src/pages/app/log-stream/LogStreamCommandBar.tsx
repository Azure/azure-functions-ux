import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { CommandBar, CommandBarButton, IButtonProps, ICommandBarItemProps } from '@fluentui/react';

import { ThemeContext } from '../../../ThemeContext';

import { LogEntry, LogsEnabled, LogType } from './LogStream.types';
import { copyLogEntries, logStreamEnabled } from './LogStreamData';

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
      ariaLabel: t('logStreaming_reconnect'),
      iconProps: {
        iconName: 'PlugConnected',
      },
      disabled: disableCommand,
      onClick: reconnectFunction,
    },
    {
      key: 'copy',
      name: t('functionKeys_copy'),
      ariaLabel: t('functionKeys_copy'),
      iconProps: {
        iconName: 'Copy',
      },
      disabled: disableCommand,
      onClick: () => copyLogEntries(logEntries),
    },
    {
      key: 'toggle',
      name: isStreaming ? t('logStreaming_pause') : t('logStreaming_start'),
      ariaLabel: isStreaming ? t('logStreaming_pause') : t('logStreaming_start'),
      iconProps: {
        iconName: isStreaming ? 'Pause' : 'Play',
      },
      disabled: disableCommand,
      onClick: isStreaming ? pauseLogs : startLogs,
    },
    {
      key: 'clear',
      name: t('logStreaming_clear'),
      ariaLabel: t('logStreaming_clear'),
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
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };

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
      buttonAs={customButton}
      overflowButtonProps={overflowButtonProps}
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
