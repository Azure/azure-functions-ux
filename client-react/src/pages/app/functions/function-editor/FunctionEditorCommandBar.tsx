import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { PortalContext } from '../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import FunctionEditorGetFunctionUrlCallout from './FunctionEditorGetFunctionUrlCallout';
import { IContextualMenuRenderItem, TooltipHost, ITooltipHostStyles } from 'office-ui-fabric-react';
import { UrlObj } from './FunctionEditor.types';
import { toolTipStyle } from './FunctionEditor.styles';

// Data for CommandBar
interface FunctionEditorCommandBarProps {
  saveFunction: () => void;
  resetFunction: () => void;
  testFunction: () => void;
  showGetFunctionUrlCommand: boolean;
  dirty: boolean;
  disabled: boolean;
  urlObjs: UrlObj[];
  testDisabled: boolean;
}

const FunctionEditorCommandBar: React.FC<FunctionEditorCommandBarProps> = props => {
  const { saveFunction, resetFunction, testFunction, showGetFunctionUrlCommand, dirty, disabled, urlObjs, testDisabled } = props;
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const onClickGetFunctionUrlCommand = () => {
    setIsDialogVisible(true);
  };

  const getFunctionUrlButtonRef = useRef<IContextualMenuRenderItem | null>(null);

  const onTestItemRender = (item: any, dismissMenu: () => void) => {
    const tooltipId = 'tooltip-id';
    const calloutProps = { gapSpace: 0 };
    if (testDisabled) {
      return (
        <TooltipHost
          content={t('disableFunctionTestTooltip')}
          closeDelay={500}
          id={tooltipId}
          calloutProps={calloutProps}
          styles={toolTipStyle}>
          <CustomCommandBarButton ariaDescribedBy={tooltipId} {...item} />
        </TooltipHost>
      );
    } else {
      return <CustomCommandBarButton {...item} />;
    }
  };

  const getItems = (): ICommandBarItemProps[] => {
    const items: ICommandBarItemProps[] = [
      {
        key: 'save',
        text: t('save'),
        iconProps: {
          iconName: 'Save',
        },
        disabled: !dirty || disabled,
        ariaLabel: t('functionEditorSaveAriaLabel'),
        onClick: saveFunction,
      },
      {
        key: 'discard',
        text: t('discard'),
        iconProps: {
          iconName: 'ChromeClose',
        },
        disabled: !dirty || disabled,
        ariaLabel: t('functionEditorDiscardAriaLabel'),
        onClick: resetFunction,
      },
      {
        key: 'test',
        text: t('test'),
        iconProps: {
          iconName: 'DockRight',
        },
        disabled: disabled || testDisabled,
        ariaLabel: t('functionEditorTestAriaLabel'),
        onClick: testFunction,
        onRender: onTestItemRender,
      },
    ];

    if (showGetFunctionUrlCommand) {
      items.push({
        key: 'getFunctionUrl',
        text: t('keysDialog_getFunctionUrl'),
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
          urlObjs={urlObjs}
          setIsDialogVisible={setIsDialogVisible}
          dialogTarget={getFunctionUrlButtonRef.current}
        />
      )}
    </>
  );
};

export default FunctionEditorCommandBar;
