import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { PortalContext } from '../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import FunctionEditorGetFunctionUrlCallout, { HostUrl } from './FunctionEditorGetFunctionUrlCallout';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IContextualMenuRenderItem } from 'office-ui-fabric-react';

// Data for CommandBar
interface FunctionEditorCommandBarProps {
  saveFunction: () => void;
  resetFunction: () => void;
  testFunction: () => void;
  showGetFunctionUrlCommand: boolean;
  dirty: boolean;
  disabled: boolean;
  hostKeyDropdownOptions: IDropdownOption[];
  hostKeyDropdownSelectedKey: string;
  hostUrls: HostUrl[];
}

const FunctionEditorCommandBar: React.FC<FunctionEditorCommandBarProps> = props => {
  const {
    saveFunction,
    resetFunction,
    testFunction,
    showGetFunctionUrlCommand,
    dirty,
    disabled,
    hostUrls,
    hostKeyDropdownOptions,
    hostKeyDropdownSelectedKey,
  } = props;
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const onClickGetFunctionUrlCommand = () => {
    setIsDialogVisible(true);
  };

  const getFunctionUrlButtonRef = useRef<IContextualMenuRenderItem | null>(null);

  const getItems = (): ICommandBarItemProps[] => {
    const items: ICommandBarItemProps[] = [
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
        onClick: onClickGetFunctionUrlCommand,
        componentRef: ref => (getFunctionUrlButtonRef.current = ref),
      });
    }

    return items;
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
      {isDialogVisible && (
        <FunctionEditorGetFunctionUrlCallout
          hostKeyDropdownOptions={hostKeyDropdownOptions}
          hostKeyDropdownSelectedKey={hostKeyDropdownSelectedKey}
          hostUrls={hostUrls}
          setIsDialogVisible={setIsDialogVisible}
          dialogTarget={getFunctionUrlButtonRef.current}
        />
      )}
    </>
  );
};

export default FunctionEditorCommandBar;
