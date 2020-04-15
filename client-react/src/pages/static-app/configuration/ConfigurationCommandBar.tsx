import React from 'react';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { useTranslation } from 'react-i18next';

interface ConfigurationCommandBarProps {
  save: () => void;
  showDiscardConfirmDialog: () => void;
  refresh: () => void;
  dirty: boolean;
  isRefreshing: boolean;
}

const ConfigurationCommandBar: React.FC<ConfigurationCommandBarProps> = props => {
  const { save, dirty, showDiscardConfirmDialog, refresh, isRefreshing } = props;

  const { t } = useTranslation();

  const isDisabled = !dirty || isRefreshing;

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'save',
        text: t('save'),
        iconProps: {
          iconName: 'Save',
        },
        disabled: isDisabled,
        onClick: save,
      },
      {
        key: 'discard',
        text: t('discard'),
        iconProps: {
          iconName: 'ChromeClose',
        },
        disabled: isDisabled,
        onClick: showDiscardConfirmDialog,
      },
      {
        key: 'refresh',
        text: t('refresh'),
        iconProps: {
          iconName: 'Refresh',
        },
        disabled: isRefreshing,
        onClick: refresh,
      },
    ];
  };
  return <CommandBar items={getItems()} role="nav" styles={CommandBarStyles} buttonAs={CustomCommandBarButton} />;
};

export default ConfigurationCommandBar;
