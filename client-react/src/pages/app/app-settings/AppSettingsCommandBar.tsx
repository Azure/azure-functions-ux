import { CommandBarButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../ThemeContext';

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
type AppSettingsCommandBarPropsCombined = AppSettingsCommandBarProps;
const AppSettingsCommandBar: React.FC<AppSettingsCommandBarPropsCombined> = props => {
  const { submitForm, resetForm, dirty, disabled } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <CommandBar
      items={getItems(submitForm, () => resetForm(), dirty, disabled, t)}
      aria-role="nav"
      ariaLabel={t('appSettingsCommandBarAriaLabel')}
      buttonAs={CustomButton}
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

export default AppSettingsCommandBar;
