import { CommandBar, ICommandBarItemProps, IContextualMenuRenderItem, TooltipHost } from '@fluentui/react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';
import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import Url from '../../../../../utils/url';
import { toolTipStyle } from './FunctionEditor.styles';
import { UrlObj, UrlType } from './FunctionEditor.types';
import { FunctionEditorContext } from './FunctionEditorDataLoader';
import FunctionEditorGetFunctionUrlCallout from './FunctionEditorGetFunctionUrlCallout';

// Data for CommandBar
interface FunctionEditorCommandBarProps {
  dirty: boolean;
  disabled: boolean;
  functionInfo: ArmObj<FunctionInfo>;
  isGetFunctionUrlVisible: boolean;
  refreshFunction: () => void;
  resetFunction: () => void;
  resetInvalidFileSelectedWarningAndFileName: () => void;
  saveFunction: () => void;
  setSelectedFileName: (fileName: string) => void;
  setShowInvalidFileSelectedWarning: (isValid: boolean | undefined) => void;
  testDisabled: boolean;
  testFunction: () => void;
  upload: (file) => void;
  uploadDisabled: boolean;
  urlObjs: UrlObj[];
  runtimeVersion?: string;
}

const FunctionEditorCommandBar: React.FC<FunctionEditorCommandBarProps> = ({
  dirty,
  disabled,
  functionInfo,
  isGetFunctionUrlVisible,
  refreshFunction,
  resetFunction,
  resetInvalidFileSelectedWarningAndFileName,
  saveFunction,
  setSelectedFileName,
  setShowInvalidFileSelectedWarning,
  testDisabled,
  testFunction,
  upload,
  uploadDisabled,
  urlObjs,
  runtimeVersion,
}: FunctionEditorCommandBarProps) => {
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  const functionEditorContext = useContext(FunctionEditorContext);
  const siteStateContext = useContext(SiteStateContext);

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  const onClickGetFunctionUrlCommand = useCallback(() => {
    resetInvalidFileSelectedWarningAndFileName();
    setIsDialogVisible(true);
  }, [resetInvalidFileSelectedWarningAndFileName]);

  const getFunctionUrlButtonRef = useRef<IContextualMenuRenderItem | null>(null);
  const uploadFileRef = useRef<HTMLInputElement | null>(null);

  const onUploadButtonClick = useCallback(() => {
    uploadFileRef.current?.click();
  }, []);

  const uploadFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const isValidFile = !!file?.size;
      if (isValidFile) {
        upload(file);
      }

      setSelectedFileName(file?.name ?? '');
      setShowInvalidFileSelectedWarning(!isValidFile);
    },
    [setSelectedFileName, setShowInvalidFileSelectedWarning, upload]
  );

  const onTestItemRender = useCallback(
    item => {
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
    },
    [testDisabled, t]
  );

  const items = useMemo<ICommandBarItemProps[]>(() => {
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
      {
        key: 'upload',
        text: t('fileExplorer_upload'),
        iconProps: {
          iconName: 'Upload',
        },
        disabled: disabled || testDisabled || uploadDisabled,
        ariaLabel: t('fileExplorer_upload'),
        onClick: onUploadButtonClick,
      },
      {
        // NOTE(krmitta): This hidden element is needed to map the upload button to input field
        key: 'upload-file-input',
        text: t('fileExplorer_upload'),
        onRender: () => <input ref={ref => (uploadFileRef.current = ref)} style={{ display: 'none' }} type="file" onChange={uploadFile} />,
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
  }, [
    dirty,
    disabled,
    isGetFunctionUrlVisible,
    onClickGetFunctionUrlCommand,
    onTestItemRender,
    onUploadButtonClick,
    refreshFunction,
    resetFunction,
    saveFunction,
    t,
    testDisabled,
    testFunction,
    uploadFile,
  ]);

  const getEventGridSubscriptionUrl = useCallback(
    (code: string) => {
      const eventGridSubscriptionUrlEndPoint =
        runtimeVersion === RuntimeExtensionMajorVersions.v1
          ? CommonConstants.EventGridSubscriptionEndpoints.v1
          : CommonConstants.EventGridSubscriptionEndpoints.v2;
      return siteStateContext.site
        ? `${Url.getMainUrl(siteStateContext.site)}/${eventGridSubscriptionUrlEndPoint}?functionName=${
            functionInfo.properties.name
          }&code=${code}`
        : '';
    },
    [functionInfo.properties.name, runtimeVersion, siteStateContext.site]
  );

  const urlObjsForEventGridTriggerFunction = useMemo<UrlObj[]>(() => {
    const eventGridKeyName =
      runtimeVersion === RuntimeExtensionMajorVersions.v1 ? CommonConstants.AppKeys.eventGridV1 : CommonConstants.AppKeys.eventGridV2;

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
  }, [getEventGridSubscriptionUrl, runtimeVersion, urlObjs]);

  const getAuthenticationEventSubscriptionUrl = useCallback(
    (code: string) => {
      return siteStateContext.site
        ? `${Url.getMainUrl(siteStateContext.site)}/runtime/webhooks/customauthenticationextension?functionName=${
            functionInfo.properties.name
          }&code=${code}`
        : '';
    },
    [functionInfo.properties.name, siteStateContext.site]
  );

  const urlObjsForAuthenticationEventsTriggerFunction = useMemo<UrlObj[]>(() => {
    return urlObjs
      .filter(urlObj => {
        return urlObj.type === UrlType.System && urlObj.text === CommonConstants.AppKeys.authenticationEvent;
      })
      .map(urlObj => {
        return {
          ...urlObj,
          url: getAuthenticationEventSubscriptionUrl(urlObj.data),
        };
      })
      .sort((urlObj1, urlObj2) => urlObj1.text.localeCompare(urlObj2.text));
  }, [getAuthenticationEventSubscriptionUrl, urlObjs]);

  const filteredUrlObj = useMemo<UrlObj[]>(() => {
    if (functionEditorContext.isEventGridTriggerFunction(functionInfo)) {
      return urlObjsForEventGridTriggerFunction;
    } else if (functionEditorContext.isAuthenticationEventsTriggerFunction(functionInfo)) {
      return urlObjsForAuthenticationEventsTriggerFunction;
    } else {
      return urlObjs;
    }
  }, [functionEditorContext, functionInfo, urlObjs, urlObjsForAuthenticationEventsTriggerFunction, urlObjsForEventGridTriggerFunction]);

  useEffect(() => {
    portalCommunicator.updateDirtyState(dirty);
  }, [dirty, portalCommunicator]);

  return (
    <>
      <CommandBar
        ariaLabel={t('functionEditorCommandBarAriaLabel')}
        buttonAs={CustomCommandBarButton}
        items={items}
        overflowButtonProps={{ ariaLabel: t('moreCommands') }}
        styles={CommandBarStyles}
      />
      {isDialogVisible && (
        <FunctionEditorGetFunctionUrlCallout
          dialogTarget={getFunctionUrlButtonRef.current}
          setIsDialogVisible={setIsDialogVisible}
          urlObjs={filteredUrlObj}
        />
      )}
    </>
  );
};

export default FunctionEditorCommandBar;
