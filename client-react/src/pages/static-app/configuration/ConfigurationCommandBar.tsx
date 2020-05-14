import React, { useState, useEffect } from 'react';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { useTranslation } from 'react-i18next';

interface ConfigurationCommandBarProps {
  save: () => void;
  showDiscardConfirmDialog: () => void;
  refresh: () => void;
  dirty: boolean;
  isLoading: boolean;
}

const ConfigurationCommandBar: React.FC<ConfigurationCommandBarProps> = props => {
  const { save, dirty, showDiscardConfirmDialog, refresh, isLoading } = props;
  const [disabled, setDisabled] = useState(false);

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
        disabled: isLoading,
        onClick: refresh,
      },
    ];
  };

  useEffect(() => {
    setDisabled(!dirty || isLoading);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, isLoading]);
  return <CommandBar items={getItems()} role="nav" styles={CommandBarStyles} buttonAs={CustomCommandBarButton} />;
};

export default ConfigurationCommandBar;
