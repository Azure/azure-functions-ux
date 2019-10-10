import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { PortalContext } from '../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';

// Data for CommandBar
const getItems = (
  saveFunction: any,
  discardFunction: any,
  testFunction: any,
  getFunctionUrl: any,
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
      onClick: discardFunction,
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
    {
      key: 'getFunctionUrl',
      name: t('keysDialog_getFunctionUrl'),
      iconProps: {
        iconName: 'FileSymLink',
      },
      disabled: disabled,
      ariaLabel: t('functionEditorGetFunctionUrlAriaLabel'),
      onClick: getFunctionUrl,
    },
  ];
};
interface FunctionEditorCommandBarProps {
  saveFunction: () => void;
  resetFunction: () => void;
  testFunction: () => void;
  getFunctionUrl: () => void;
  dirty: boolean;
  disabled: boolean;
}

const FunctionEditorCommandBar: React.FC<FunctionEditorCommandBarProps> = props => {
  const { saveFunction, resetFunction, testFunction, getFunctionUrl, dirty, disabled } = props;
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  useEffect(() => {
    portalCommunicator.updateDirtyState(dirty);
  }, [dirty]);
  return (
    <CommandBar
      items={getItems(saveFunction, () => resetFunction(), testFunction, getFunctionUrl, dirty, disabled, t)}
      aria-role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('functionEditorCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default FunctionEditorCommandBar;
