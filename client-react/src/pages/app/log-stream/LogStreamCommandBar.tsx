import * as React from 'react';
import { IButtonProps, CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { compose } from 'recompose';
import IState from '../../../modules/types';
import { connect } from 'react-redux';
import { ITheme } from 'office-ui-fabric-react/lib/Styling';

// tslint:disable-next-line:member-ordering

// Data for CommandBar
const getItems = (
  reconnectFunction: any,
  copyLogsFunction: any,
  pauseLogs: any,
  startLogs: any,
  clearFunction: any,
  isStreaming: boolean,
  t: (string) => string
): ICommandBarItemProps[] => {
  return [
    {
      key: 'reconnect',
      name: t('Reconnect'),
      iconProps: {
        iconName: 'PlugConnected',
      },
      onClick: reconnectFunction,
    },
    {
      key: 'copy',
      name: 'Copy',
      iconProps: {
        iconName: 'Copy',
      },
      onClick: copyLogsFunction,
    },
    {
      key: 'toggle',
      name: isStreaming ? 'Pause' : 'Start',
      iconProps: {
        iconName: isStreaming ? 'Pause' : 'Play',
      },
      onClick: isStreaming ? pauseLogs : startLogs,
    },
    {
      key: 'clear',
      name: 'Clear',
      iconProps: {
        iconName: 'StatusCircleErrorX',
      },
      onClick: clearFunction,
    },
  ];
};
interface LogStreamCommandBarProps {
  reconnect: () => void;
  copy: () => void;
  start: () => void;
  pause: () => void;
  clear: () => void;
  isStreaming: boolean;
}

interface IStateProps {
  theme: ITheme;
}
type LogStreamCommandBarPropsCombined = LogStreamCommandBarProps & InjectedTranslateProps & IStateProps;
class LogStreamCommandBar extends React.Component<LogStreamCommandBarPropsCombined, any> {
  public render() {
    const { reconnect, copy, pause, start, clear, isStreaming, t, theme } = this.props;
    return (
      <CommandBar
        items={getItems(reconnect, copy, pause, start, clear, isStreaming, t)}
        aria-role="nav"
        buttonAs={this.customButton}
        styles={{
          root: {
            borderBottom: '1px solid rgba(204,204,204,.8)',
            backgroundColor: theme.semanticColors.bodyBackground,
            width: '100%',
          },
        }}
      />
    );
  }
  private customButton = (props: IButtonProps) => {
    return (
      <CommandBarButton
        {...props}
        onClick={props.onClick}
        styles={{
          ...props.styles,
          root: {
            backgroundColor: this.props.theme.semanticColors.bodyBackground,
          },
          rootDisabled: {
            backgroundColor: this.props.theme.semanticColors.bodyBackground,
          },
        }}
      />
    );
  };
}

const mapStateToProps = (state: IState) => ({
  theme: state.portalService.theme,
});
export default compose<LogStreamCommandBarPropsCombined, LogStreamCommandBarProps>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(LogStreamCommandBar);
