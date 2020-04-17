import React, { useEffect, useContext } from 'react';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';

interface AppFilesCommandBarProps {
  saveFile: () => void;
  resetFile: () => void;
  refreshFunction: () => void;
  dirty: boolean;
  disabled: boolean;
}

const AppFilesCommandBar: React.FC<AppFilesCommandBarProps> = props => {
  const { saveFile, resetFile, dirty, disabled, refreshFunction } = props;

  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'save',
        name: t('save'),
        iconProps: {
          iconName: 'Save',
        },
        disabled: !dirty || disabled,
        ariaLabel: t('functionEditorSaveAriaLabel'),
        onClick: saveFile,
      },
      {
        key: 'discard',
        name: t('discard'),
        iconProps: {
          iconName: 'ChromeClose',
        },
        disabled: !dirty || disabled,
        ariaLabel: t('functionEditorDiscardAriaLabel'),
        onClick: resetFile,
      },
      {
        key: 'refresh',
        name: t('refresh'),
        iconProps: {
          iconName: 'refresh',
        },
        disabled: disabled,
        ariaLabel: t('appFilesSaveAriaLabel'),
        onClick: refreshFunction,
      },
    ];
  };

  useEffect(() => {
    portalCommunicator.updateDirtyState(dirty);
  }, [dirty, portalCommunicator]);
  return (
    <>
      <CommandBar
        items={getItems()}
        role="nav"
        styles={CommandBarStyles}
        ariaLabel={t('functionEditorCommandBarAriaLabel')}
        buttonAs={CustomCommandBarButton}
      />
    </>
  );
};

export default AppFilesCommandBar;
