import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { PortalContext } from '../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';

// Data for CommandBar
interface FunctionEditorCommandBarProps {
  saveFunction: () => void;
  resetFunction: () => void;
  testFunction: () => void;
  getFunctionUrl: () => void;
  showGetFunctionUrlCommand: boolean;
  dirty: boolean;
  disabled: boolean;
}

const FunctionEditorCommandBar: React.FC<FunctionEditorCommandBarProps> = props => {
  const { saveFunction, resetFunction, testFunction, getFunctionUrl, showGetFunctionUrlCommand, dirty, disabled } = props;
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  const getItems = (): ICommandBarItemProps[] => {
    const items = [
      {
        key: 'save',
        name: t('save'),
        iconProps: {
          iconName: 'Save',
        },
        disabled: !dirty || disabled,
        ariaLabel: t('functionEditorSaveAriaLabel'),
        onClick: saveFunction,
      },
      {
        key: 'discard',
        name: t('discard'),
        iconProps: {
          iconName: 'ChromeClose',
        },
        disabled: !dirty || disabled,
        ariaLabel: t('functionEditorDiscardAriaLabel'),
        onClick: resetFunction,
      },
      {
        key: 'test',
        name: t('test'),
        iconProps: {
          iconName: 'DockRight',
        },
        disabled: disabled,
        ariaLabel: t('functionEditorTestAriaLabel'),
        onClick: testFunction,
      },
    ];

    if (showGetFunctionUrlCommand) {
      items.push({
        key: 'getFunctionUrl',
        name: t('keysDialog_getFunctionUrl'),
        iconProps: {
          iconName: 'FileSymLink',
        },
        disabled: disabled,
        ariaLabel: t('functionEditorGetFunctionUrlAriaLabel'),
        onClick: getFunctionUrl,
      });
    }

    return items;
  };

  useEffect(() => {
    portalCommunicator.updateDirtyState(dirty);
  }, [dirty]);

  return (
    <CommandBar
      items={getItems()}
      aria-role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('functionEditorCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default FunctionEditorCommandBar;
