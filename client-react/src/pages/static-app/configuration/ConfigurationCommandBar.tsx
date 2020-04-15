import React from 'react';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { useTranslation } from 'react-i18next';

interface ConfigurationCommandBarProps {
  save: () => void;
  showDiscardConfirmDialog: () => void;
  disabled: boolean;
}

const ConfigurationCommandBar: React.FC<ConfigurationCommandBarProps> = props => {
  const { save, disabled, showDiscardConfirmDialog } = props;

  const { t } = useTranslation();

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'save',
        text: t('save'),
        iconProps: {
          iconName: 'Save',
        },
        disabled: disabled,
        onClick: save,
      },
      {
        key: 'discard',
        text: t('discard'),
        iconProps: {
          iconName: 'ChromeClose',
        },
        disabled: disabled,
        onClick: showDiscardConfirmDialog,
      },
      {
        key: 'refresh',
        text: t('refresh'),
        iconProps: {
          iconName: 'Refresh',
        },
        disabled: false,
        onClick: () => {},
      },
    ];
  };
  return <CommandBar items={getItems()} role="nav" styles={CommandBarStyles} buttonAs={CustomCommandBarButton} />;
};

export default ConfigurationCommandBar;
