import React, { useEffect, useState } from 'react';
import { ICommandBarItemProps, CommandBar, IButtonProps } from 'office-ui-fabric-react';
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
  const [commandBarItems, setCommandBarItems] = useState<ICommandBarItemProps[]>([]);

  const { t } = useTranslation();
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };

  const setItems = (saveDiscardDisabled: boolean) => {
    setCommandBarItems([
      getSaveCommandBarItem(saveDiscardDisabled),
      getDiscardCommandBarItem(saveDiscardDisabled),
      getRefreshCommandBarItem(),
    ]);
  };

  const getSaveCommandBarItem = (saveDiscardDisabled: boolean) => {
    return {
      key: 'save',
      text: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      disabled: saveDiscardDisabled,
      onClick: save,
    };
  };

  const getDiscardCommandBarItem = (saveDiscardDisabled: boolean) => {
    return {
      key: 'discard',
      text: t('discard'),
      iconProps: {
        iconName: 'ChromeClose',
      },
      disabled: saveDiscardDisabled,
      onClick: showDiscardConfirmDialog,
    };
  };

  const getRefreshCommandBarItem = () => {
    return {
      key: 'refresh',
      text: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      disabled: isLoading,
      onClick: refresh,
    };
  };

  useEffect(() => {
    setItems(!dirty || isLoading);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, isLoading]);
  return (
    <CommandBar
      items={commandBarItems}
      role="nav"
      styles={CommandBarStyles}
      buttonAs={CustomCommandBarButton}
      overflowButtonProps={overflowButtonProps}
    />
  );
};

export default ConfigurationCommandBar;
