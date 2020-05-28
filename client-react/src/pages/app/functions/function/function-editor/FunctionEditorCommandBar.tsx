import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { PortalContext } from '../../../../../PortalContext';
import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import FunctionEditorGetFunctionUrlCallout from './FunctionEditorGetFunctionUrlCallout';
import { IContextualMenuRenderItem, TooltipHost } from 'office-ui-fabric-react';
import { UrlObj, UrlType } from './FunctionEditor.types';
import { toolTipStyle } from './FunctionEditor.styles';
import { FunctionEditorContext } from './FunctionEditorDataLoader';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { SiteStateContext } from '../../../../../SiteState';
import Url from '../../../../../utils/url';

// Data for CommandBar
interface FunctionEditorCommandBarProps {
  saveFunction: () => void;
  resetFunction: () => void;
  testFunction: () => void;
  refreshFunction: () => void;
  isGetFunctionUrlVisible: boolean;
  dirty: boolean;
  disabled: boolean;
  urlObjs: UrlObj[];
  testDisabled: boolean;
  functionInfo: ArmObj<FunctionInfo>;
  runtimeVersion?: string;
}

const FunctionEditorCommandBar: React.FC<FunctionEditorCommandBarProps> = props => {
  const {
    saveFunction,
    resetFunction,
    testFunction,
    isGetFunctionUrlVisible,
    dirty,
    disabled,
    urlObjs,
    testDisabled,
    refreshFunction,
    functionInfo,
    runtimeVersion,
  } = props;
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  const functionEditorContext = useContext(FunctionEditorContext);
  const siteStateContext = useContext(SiteStateContext);

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const onClickGetFunctionUrlCommand = () => {
    setIsDialogVisible(true);
  };

  const getFunctionUrlButtonRef = useRef<IContextualMenuRenderItem | null>(null);

  const onTestItemRender = (item: any, dismissMenu: () => void) => {
    const tooltipId = 'tooltip-id';
    if (testDisabled) {
      return (
        <TooltipHost
          content={t('disableFunctionTestTooltip')}
          closeDelay={500}
          id={tooltipId}
          calloutProps={{ gapSpace: 0 }}
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
        key: 'refresh',
        text: t('refresh'),
        iconProps: {
          iconName: 'Refresh',
        },
        disabled: disabled,
        ariaLabel: t('functionEditorRefreshAriaLabel'),
        onClick: refreshFunction,
      },
      {
        key: 'testAndRun',
        text: t('testAndRun'),
        iconProps: {
          iconName: 'DockRight',
        },
        disabled: disabled || testDisabled,
        ariaLabel: t('functionEditorTestAriaLabel'),
        onClick: testFunction,
        onRender: onTestItemRender,
      },
    ];

    if (isGetFunctionUrlVisible) {
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

  const getEventGridSubscriptionUrl = (code: string) => {
    const eventGridSubscriptionUrlEndPoint =
      !!runtimeVersion && runtimeVersion === RuntimeExtensionMajorVersions.v1
        ? CommonConstants.EventGridSubscriptionEndpoints.v1
        : CommonConstants.EventGridSubscriptionEndpoints.v2;
    return !!siteStateContext.site
      ? `${Url.getMainUrl(siteStateContext.site)}/${eventGridSubscriptionUrlEndPoint}?functionName=${
          functionInfo.properties.name
        }&code=${code}`
      : '';
  };

  const getUrlObjsForEventGridTriggerFunction = () => {
    const eventGridKeyName =
      !!runtimeVersion && runtimeVersion === RuntimeExtensionMajorVersions.v1
        ? CommonConstants.AppKeys.eventGridV1
        : CommonConstants.AppKeys.eventGridV2;

    return urlObjs
      .filter(urlObj => {
        return (
          (urlObj.type === UrlType.Host && urlObj.text === CommonConstants.AppKeys.master) ||
          (urlObj.type === UrlType.System && urlObj.text === eventGridKeyName)
        );
      })
      .map(urlObj => {
        return {
          ...urlObj,
          url: getEventGridSubscriptionUrl(urlObj.data),
        };
      })
      .sort((urlObj1, urlObj2) => urlObj1.text.localeCompare(urlObj2.text));
  };

  const getFilteredUrlObj = (): UrlObj[] => {
    if (functionEditorContext.isEventGridTriggerFunction(functionInfo)) {
      return getUrlObjsForEventGridTriggerFunction();
    } else {
      return urlObjs;
    }
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
          urlObjs={getFilteredUrlObj()}
          setIsDialogVisible={setIsDialogVisible}
          dialogTarget={getFunctionUrlButtonRef.current}
        />
      )}
    </>
  );
};

export default FunctionEditorCommandBar;
