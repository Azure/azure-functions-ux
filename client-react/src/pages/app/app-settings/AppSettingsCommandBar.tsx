import * as React from 'react';
import { IButtonProps, CommandBarButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib-commonjs/CommandBar';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { compose } from 'recompose';
import IState from '../../../modules/types';
import { connect } from 'react-redux';
import { ITheme } from 'office-ui-fabric-react/lib-commonjs/Styling';

// tslint:disable-next-line:member-ordering

// Data for CommandBar
const getItems = (
  saveFunction: any,
  discardFunction: any,
  dirty: boolean,
  disabled: boolean,
  t: (string) => string
): ICommandBarItemProps[] => {
  return [
    {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      disabled: !dirty || disabled,
      ariaLabel: t('appSettingsSaveAriaLabel'),
      onClick: saveFunction,
    },
    {
      key: 'discard',
      name: 'Discard',
      iconProps: {
        iconName: 'StatusCircleErrorX',
      },
      disabled: !dirty || disabled,
      ariaLabel: t('appSettingsSaveAriaLabel'),
      onClick: discardFunction,
    },
  ];
};
interface AppSettingsCommandBarProps {
  submitForm: () => void;
  resetForm: () => void;
  dirty: boolean;
  disabled: boolean;
}

interface IStateProps {
  theme: ITheme;
}
type AppSettingsCommandBarPropsCombined = AppSettingsCommandBarProps & InjectedTranslateProps & IStateProps;
class AppSettingsCommandBar extends React.Component<AppSettingsCommandBarPropsCombined, any> {
  public render() {
    const { submitForm, resetForm, dirty, disabled, t, theme } = this.props;
    return (
      <CommandBar
        items={getItems(submitForm, () => resetForm(), dirty, disabled, t)}
        aria-role="nav"
        ariaLabel={t('appSettingsCommandBarAriaLabel')}
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
export default compose<AppSettingsCommandBarPropsCombined, AppSettingsCommandBarProps>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(AppSettingsCommandBar);
