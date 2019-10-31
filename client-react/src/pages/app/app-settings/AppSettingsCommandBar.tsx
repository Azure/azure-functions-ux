import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { PortalContext } from '../../../PortalContext';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';

// Data for CommandBar
const getItems = (
  saveFunction: any,
  discardFunction: any,
  refreshFunction: any,
  dirty: boolean,
  disabled: boolean,
  t: (string) => string
): ICommandBarItemProps[] => {
  return [
    {
      key: 'refresh',
      name: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      disabled: disabled,
      ariaLabel: t('appSettingsRefreshAriaLabel'),
      onClick: refreshFunction,
    },
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
      name: t('discard'),
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
  refreshAppSettings: () => void;
  dirty: boolean;
  disabled: boolean;
}

type AppSettingsCommandBarPropsCombined = AppSettingsCommandBarProps;
const AppSettingsCommandBar: React.FC<AppSettingsCommandBarPropsCombined> = props => {
  const { submitForm, resetForm, refreshAppSettings, dirty, disabled } = props;
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  useEffect(() => {
    portalCommunicator.updateDirtyState(dirty);
  }, [dirty]);
  return (
    <CommandBar
      items={getItems(submitForm, () => resetForm(), refreshAppSettings, dirty, disabled, t)}
      aria-role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('appSettingsCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default AppSettingsCommandBar;
