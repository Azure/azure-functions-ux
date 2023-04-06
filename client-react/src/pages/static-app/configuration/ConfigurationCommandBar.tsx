import React from 'react';
import { ICommandBarItemProps, CommandBar, IButtonProps } from '@fluentui/react';
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

  const { t } = useTranslation();
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };

  const getSaveCommandBarItem = (saveDiscardDisabled: boolean): ICommandBarItemProps => {
    return {
      key: 'save',
      text: t('save'),
      ariaLabel: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      disabled: saveDiscardDisabled,
      onClick: save,
    };
  };

  const getDiscardCommandBarItem = (saveDiscardDisabled: boolean): ICommandBarItemProps => {
    return {
      key: 'discard',
      text: t('discard'),
      ariaLabel: t('discard'),
      iconProps: {
        iconName: 'ChromeClose',
      },
      disabled: saveDiscardDisabled,
      onClick: showDiscardConfirmDialog,
    };
  };

  const getRefreshCommandBarItem = (): ICommandBarItemProps => {
    return {
      key: 'refresh',
      text: t('refresh'),
      ariaLabel: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      disabled: isLoading,
      onClick: refresh,
    };
  };

  const getItems = (dirty: boolean, isLoading: boolean): ICommandBarItemProps[] => {
    const saveDiscardDisabled = !dirty || isLoading;
    return [getSaveCommandBarItem(saveDiscardDisabled), getDiscardCommandBarItem(saveDiscardDisabled), getRefreshCommandBarItem()];
  };

  return (
    <CommandBar
      items={getItems(dirty, isLoading)}
      styles={CommandBarStyles}
      buttonAs={CustomCommandBarButton}
      overflowButtonProps={overflowButtonProps}
    />
  );
};

export default ConfigurationCommandBar;
