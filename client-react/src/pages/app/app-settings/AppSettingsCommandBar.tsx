import { CommandBarButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../ThemeContext';
import { CommandBarButtonStyle } from './AppSettings.styles';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';

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
        iconName: 'ChromeClose',
      },
      disabled: !dirty || disabled,
      ariaLabel: t('appSettingsDiscardAriaLabel'),
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
const CustomButton: React.FC<IButtonProps> = props => {
  const theme = useContext(ThemeContext);
  return (
    <CommandBarButton
      {...props}
      data-cy={`command-button-${props.name}`}
      onClick={props.onClick}
      styles={CommandBarButtonStyle(props, theme)}
    />
  );
};
type AppSettingsCommandBarPropsCombined = AppSettingsCommandBarProps;
const AppSettingsCommandBar: React.FC<AppSettingsCommandBarPropsCombined> = props => {
  const { submitForm, resetForm, dirty, disabled } = props;
  const { t } = useTranslation();

  return (
    <CommandBar
      items={getItems(submitForm, () => resetForm(), dirty, disabled, t)}
      aria-role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('appSettingsCommandBarAriaLabel')}
      buttonAs={CustomButton}
    />
  );
};

export default AppSettingsCommandBar;
