import React, { useState, useEffect, useContext } from 'react';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import FunctionEditorCommandBar from './FunctionEditorCommandBar';
import FunctionEditorFileSelectorBar from './FunctionEditorFileSelectorBar';
import { Site } from '../../../../../models/site/site';
import CustomPanel from '../../../../../components/CustomPanel/CustomPanel';
import { PanelType, IDropdownOption, MessageBarType } from '@fluentui/react';
import FunctionTest from './function-test/FunctionTest';
import MonacoEditor, { getMonacoEditorTheme } from '../../../../../components/monaco-editor/monaco-editor';
import { InputFormValues, ResponseContent, FileContent, UrlObj, LoggingOptions } from './FunctionEditor.types';
import { VfsObject } from '../../../../../models/functions/vfs';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import ConfirmDialog from '../../../../../components/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import {
  testLoadingStyle,
  commandBarSticky,
  logPanelStyle,
  defaultMonacoEditorHeight,
  testPanelStyle,
  editorStyle,
  editorDivStyle,
} from './FunctionEditor.styles';
import EditorManager, { EditorLanguage } from '../../../../../utils/EditorManager';
import EditModeBanner from '../../../../../components/EditModeBanner/EditModeBanner';
import { SiteStateContext } from '../../../../../SiteState';
import SiteHelper from '../../../../../utils/SiteHelper';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { FunctionAppEditMode, PortalTheme } from '../../../../../models/portal-models';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { minimumLogPanelHeight, logCommandBarHeight } from '../function-log/FunctionLog.styles';
import FunctionLogAppInsightsDataLoader from '../function-log/FunctionLogAppInsightsDataLoader';
import FunctionLogFileStreamDataLoader from '../function-log/FunctionLogFileStreamDataLoader';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import { FunctionEditorContext } from './FunctionEditorDataLoader';
import { isKubeApp, isLinuxDynamic } from '../../../../../utils/arm-utils';
import Url from '../../../../../utils/url';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { PortalContext } from '../../../../../PortalContext';
import { BindingManager } from '../../../../../utils/BindingManager';
import FunctionAppService from '../../../../../utils/FunctionAppService';
import { Links } from '../../../../../utils/FwLinks';
import { Guid } from '../../../../../utils/Guid';

export interface FunctionEditorProps {
  functionInfo: ArmObj<FunctionInfo>;
  site: ArmObj<Site>;
  run: (functionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string, liveLogsSessionId?: string) => void;
  functionRunning: boolean;
  urlObjs: UrlObj[];
  showTestPanel: boolean;
  setShowTestPanel: (showPanel: boolean) => void;
  refresh: () => void;
  isRefreshing: boolean;
  getFunctionUrl: (key?: string) => string;
  isUploadingFile: boolean;
  setIsUploadingFile: (isUploadingFile: boolean) => void;
  refreshFileList: () => void;
  addCorsRule: (corsRule: string) => void;
  xFunctionKey?: string;
  responseContent?: ResponseContent;
  runtimeVersion?: string;
  fileList?: VfsObject[];
  testData?: string;
  workerRuntime?: string;
  enablePortalCall?: boolean;
  isLinuxSkuFlightingEnabled?: boolean;
}

export const FunctionEditor: React.SFC<FunctionEditorProps> = props => {
  const {
    functionInfo,
    site,
    fileList,
    runtimeVersion,
    responseContent,
    functionRunning,
    urlObjs,
    showTestPanel,
    setShowTestPanel,
    testData,
    refresh,
    isRefreshing,
    xFunctionKey,
    getFunctionUrl,
    isUploadingFile,
    setIsUploadingFile,
    refreshFileList,
    workerRuntime,
    addCorsRule,
    enablePortalCall,
    isLinuxSkuFlightingEnabled,
  } = props;
  const [reqBody, setReqBody] = useState('');
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fileContent, setFileContent] = useState<FileContent>({ default: '', latest: '' });
  const [selectedFile, setSelectedFile] = useState<IDropdownOption | undefined>(undefined);
  const [editorLanguage, setEditorLanguage] = useState(EditorLanguage.plaintext);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState<IDropdownOption | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [savingFile, setSavingFile] = useState<boolean>(false);
  const [monacoHeight, setMonacoHeight] = useState(defaultMonacoEditorHeight);
  const [logPanelExpanded, setLogPanelExpanded] = useState(false);
  const [logPanelFullscreen, setLogPanelFullscreen] = useState(false);
  const [fileSavedCount, setFileSavedCount] = useState(0);
  const [readOnlyBanner, setReadOnlyBanner] = useState<HTMLDivElement | null>(null);
  const [isFileContentAvailable, setIsFileContentAvailable] = useState<boolean | undefined>(undefined);
  const [showDiscardConfirmDialog, setShowDiscardConfirmDialog] = useState(false);
  const [logPanelHeight, setLogPanelHeight] = useState(0);
  const [selectedLoggingOption, setSelectedLoggingOption] = useState<LoggingOptions | undefined>(undefined);
  const [liveLogsSessionId, setLiveLogsSessionId] = useState<undefined | string>(undefined);
  const [showInvalidFileSelectedWarning, setShowInvalidFileSelectedWarning] = useState<boolean | undefined>(undefined);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);
  const startUpInfoContext = useContext(StartupInfoContext);
  const functionEditorContext = useContext(FunctionEditorContext);
  const portalCommunicator = useContext(PortalContext);

  const scenarioChecker = new ScenarioService(t);

  const showAppInsightsLogs = scenarioChecker.checkScenario(ScenarioIds.showAppInsightsLogs, { site }).status !== 'disabled';
  const isFileSystemLoggingAvailable = site && !isLinuxDynamic(site) && !isKubeApp(site);
  const showLoggingOptionsDropdown = showAppInsightsLogs && isFileSystemLoggingAvailable;
  const appReadOnlyPermission = SiteHelper.isRbacReaderPermission(siteStateContext.siteAppEditState);
  const isHttpOrWebHookFunction = functionEditorContext.isHttpOrWebHookFunction(functionInfo);

  const save = async () => {
    if (!selectedFile) {
      return;
    }

    resetInvalidFileSelectedWarningAndFileName();

    portalCommunicator.log({
      action: 'functionEditor',
      actionModifier: 'saveClicked',
      resourceId: siteStateContext.resourceId || '',
      logLevel: 'info',
      data: {
        sessionId: Url.getParameterByName(null, 'sessionId'),
        siteKind: site.kind,
        isLinux: site.properties.isLinux,
        runtime: runtimeVersion,
        stack: workerRuntime,
        sku: site.properties.sku,
      },
    });

    setSavingFile(true);
    const fileData = selectedFile.data;
    const fileResponse = await FunctionsService.saveFileContent(
      site.id,
      fileData.name,
      fileContent.latest,
      functionInfo.properties.name,
      runtimeVersion,
      functionEditorContext.getSaveFileHeaders(fileData.mime)
    );
    if (fileResponse.metadata.success) {
      setFileContent({ ...fileContent, default: fileContent.latest });
      expandLogPanel();
      setFileSavedCount(fileSavedCount + 1);
    }
    setSavingFile(false);
  };

  const test = () => {
    resetInvalidFileSelectedWarningAndFileName();
    setShowTestPanel(true);
  };

  const onCloseTest = () => {
    setShowTestPanel(false);
  };

  const isDirty = () => {
    return fileContent.default !== fileContent.latest;
  };

  const onFileSelectorChange = async (e: unknown, option: IDropdownOption) => {
    if (isDirty()) {
      setSelectedDropdownOption(option);
      return;
    }
    changeDropdownOption(option);
  };

  const changeDropdownOption = (option: IDropdownOption) => {
    setFetchingFileContent(true);
    setSelectedFile(option);
    setSelectedFileContent(option.data);
    getAndSetEditorLanguage(option.data.name);
    setFetchingFileContent(false);
  };

  const run = (values: InputFormValues) => {
    let data;
    if (isHttpOrWebHookFunction) {
      data = JSON.stringify({
        method: values.method,
        queryStringParams: values.queries,
        headers: values.headers,
        body: reqBody,
      });
    } else {
      data = reqBody;
    }
    const tempFunctionInfo = functionInfo;
    tempFunctionInfo.properties.test_data = data;
    expandLogPanel();
    props.run(tempFunctionInfo, values.xFunctionKey, liveLogsSessionId);

    portalCommunicator.log({
      action: 'functionEditor',
      actionModifier: 'runClicked',
      resourceId: siteStateContext.resourceId || '',
      logLevel: 'verbose',
      data: {
        sessionId: Url.getParameterByName(null, 'sessionId'),
        siteKind: site.kind,
        isLinux: site.properties.isLinux,
        runtime: runtimeVersion,
        stack: workerRuntime,
        sku: site.properties.sku,
        liveLogsSessionId: liveLogsSessionId,
      },
    });
  };

  const isGetFunctionUrlVisible = () => {
    const { properties } = functionInfo;
    return (
      !!BindingManager.getHttpTriggerTypeInfo(properties) ||
      !!BindingManager.getEventGridTriggerInfo(properties) ||
      !!BindingManager.getAuthenticationEventTriggerTypeInfo(properties)
    );
  };

  const getDropdownOptions = (): IDropdownOption[] => {
    return (
      fileList
        ?.map(file => ({
          key: file.name,
          text: file.name,
          isSelected: false,
          data: file,
        }))
        .filter(file => file.data.mime !== 'inode/directory')
        .sort((a, b) => a.key.localeCompare(b.key)) ?? []
    );
  };

  const setSelectedFileContent = async (file: VfsObject) => {
    const headers = {
      'Content-Type': file.mime,
    };
    const fileResponse = await FunctionsService.getFileContent(site.id, functionInfo.properties.name, runtimeVersion, headers, file.name);
    if (fileResponse.metadata.success) {
      let fileText = fileResponse.data as string;
      if (typeof fileResponse.data !== 'string') {
        // third parameter refers to the number of white spaces.
        // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
        fileText = JSON.stringify(fileResponse.data, null, 2);
      }
      setIsFileContentAvailable(true);
      setFileContent({ default: fileText, latest: fileText });
    } else {
      setFileContent({ default: '', latest: '' });
      setIsFileContentAvailable(false);
      LogService.error(
        LogCategories.FunctionEdit,
        'getFileContent',
        `Failed to get file content: ${getErrorMessageOrStringify(fileResponse.metadata.error)}`
      );
    }
  };

  const getScriptFileOption = (): IDropdownOption | undefined => {
    const scriptHref = functionInfo.properties.script_href;
    let filename = ((scriptHref && scriptHref.split('/').pop()) || '').toLocaleLowerCase();
    if (functionEditorContext.isBlacklistedFile(filename)) {
      filename = functionEditorContext.FUNCTION_JSON_FILE;
    }
    const filteredOptions = getDropdownOptions().filter(option => option.text === filename);
    return filteredOptions.length === 1 ? filteredOptions[0] : getSelectedFile();
  };

  const getSelectedFile = () => {
    if (startUpInfoContext.featureInfo.data && startUpInfoContext.featureInfo.data.filename) {
      return startUpInfoContext.featureInfo.data.filename;
    } else {
      return getDefaultFile();
    }
  };

  const getDefaultFile = (): IDropdownOption | undefined => {
    const options = getDropdownOptions();
    return options.length > 0 ? options[0] : undefined;
  };

  const fetchData = async () => {
    const file = getScriptFileOption();
    if (file) {
      setSelectedFileContent(file.data);
      setSelectedFile(file);
      getAndSetEditorLanguage(file.data.name);
    }
    setInitialLoading(false);
  };

  const onChange = (newValue, event) => {
    setFileContent({ ...fileContent, latest: newValue });
  };

  const getAndSetEditorLanguage = (fileName: string) => {
    setEditorLanguage(EditorManager.getEditorLanguage(fileName));
  };

  const isLoading = () => {
    return fetchingFileContent || initialLoading || savingFile;
  };

  const isDisabled = () => {
    return isLoading() || functionRunning || isRefreshing || isUploadingFile;
  };

  const onCancelButtonClick = () => {
    setSelectedDropdownOption(undefined);
    setShowDiscardConfirmDialog(false);
    resetInvalidFileSelectedWarningAndFileName();
  };

  const getHeaderContent = (): JSX.Element => {
    return <></>;
  };

  const toggleLogPanelExpansion = () => {
    if (!logPanelExpanded) {
      expandLogPanel();
    } else {
      closeLogPanel();
    }
  };

  const getReadOnlyBannerHeight = () => {
    return readOnlyBanner?.offsetHeight ?? 0;
  };

  const isRuntimeReachable = () => {
    return !!fileList;
  };

  const isTestDisabled = () => {
    return !isRuntimeReachable();
  };

  const isEditorDisabled = () => {
    return isDisabled() || isSelectedFileBlacklisted() || !isFileContentAvailable || !isRuntimeReachable();
  };

  const discard = () => {
    setFileContent({ ...fileContent, latest: fileContent.default });
    onCancelButtonClick();
  };

  const fileChangeConfirmClicked = () => {
    if (selectedDropdownOption) {
      changeDropdownOption(selectedDropdownOption);
    }
    onCancelButtonClick();
  };

  const isSelectedFileBlacklisted = () => {
    return functionEditorContext.isBlacklistedFile((selectedFile?.key as string) ?? '');
  };

  const expandLogPanel = () => {
    setLogPanelExpanded(true);
    LogService.trackEvent(LogCategories.functionLog, 'functionEditor-logPanelExpanded', {
      resourceId: siteStateContext.resourceId,
      sessionId: Url.getParameterByName(null, 'sessionId'),
    });
  };

  const closeLogPanel = () => {
    setLogPanelExpanded(false);
    LogService.trackEvent(LogCategories.functionLog, 'functionEditor-logPanelClosed', {
      resourceId: siteStateContext.resourceId,
      sessionId: Url.getParameterByName(null, 'sessionId'),
    });
  };

  const uploadFile = async (file: any) => {
    const xhr = new XMLHttpRequest();
    const url = `${window.appsvc &&
      window.appsvc.env &&
      window.appsvc.env.azureResourceManagerEndpoint}${FunctionsService.getSaveFileContentUrl(
      site.id,
      file.name,
      functionInfo.properties.name,
      runtimeVersion,
      CommonConstants.ApiVersions.antaresApiVersion20181101
    )}`;
    const headers = functionEditorContext.getSaveFileHeaders(file.type);
    headers['Cache-Control'] = 'no-cache';
    headers['Authorization'] = `Bearer ${startUpInfoContext.token}`;

    const fileName = file.name;
    const notificationId = portalCommunicator.startNotification(t('uploadingFile'), t('uploadingFileWithName').format(fileName));

    xhr.onloadstart = async loadStartEvent => {
      setIsUploadingFile(true);
    };
    xhr.onloadend = async loadEndEvent => {
      setIsUploadingFile(false);
      if (loadEndEvent.target && !!loadEndEvent.target['status'] && loadEndEvent.target['status'] < 300) {
        if (!!fileList && fileList.length > 0) {
          refreshFileList();
        } else {
          refresh();
        }
        portalCommunicator.stopNotification(notificationId, true, t('uploadingFileSuccessWithName').format(fileName));
      } else {
        portalCommunicator.stopNotification(notificationId, false, t('uploadingFileFailureWithName').format(fileName));
        LogService.error(
          LogCategories.FunctionEdit,
          'functionEditorFileUpload',
          `Failed to upload file: ${loadEndEvent.target && loadEndEvent.target['response']}`
        );
      }
    };

    xhr.open('PUT', url, true);

    for (const headerKey in headers) {
      if (headerKey in headers) {
        xhr.setRequestHeader(headerKey, headers[headerKey]);
      }
    }

    xhr.send(file);
  };

  const isAppReadOnly = (appEditState: FunctionAppEditMode) => {
    return SiteHelper.isFunctionAppReadOnly(appEditState);
  };

  const resetInvalidFileSelectedWarningAndFileName = () => {
    if (showInvalidFileSelectedWarning !== undefined) {
      setShowInvalidFileSelectedWarning(undefined);
      setSelectedFileName('');
    }
  };

  const getBanner = (): JSX.Element => {
    /* NOTE (krmitta): Show the read-only banner first, instead of showing the Generic Runtime failure method */
    if (isAppReadOnly(siteStateContext.siteAppEditState)) {
      return <EditModeBanner setBanner={setReadOnlyBanner} />;
    } else if (!isRuntimeReachable() || (!isSelectedFileBlacklisted() && isFileContentAvailable !== undefined && !isFileContentAvailable)) {
      return (
        <CustomBanner
          message={!isRuntimeReachable() ? t('scmPingFailedErrorMessage') : t('fetchFileContentFailureMessage')}
          type={MessageBarType.error}
        />
      );
    } else if (FunctionAppService.enableEditingForLinux(site, !!isLinuxSkuFlightingEnabled, workerRuntime) && isLinuxDynamic(site)) {
      // NOTE(krmitta): Banner is only visible in case of Linux Consumption
      return (
        <CustomBanner
          message={t('enablePortalEditingForLinuxConsumptionWarning')}
          type={MessageBarType.warning}
          learnMoreLink={Links.setupLocalFunctionEnvironment}
        />
      );
    } else if (showInvalidFileSelectedWarning !== undefined && showInvalidFileSelectedWarning) {
      return (
        <CustomBanner
          message={selectedFileName ? t('invalidFileSelectedWarning').format(selectedFileName) : t('validFileShouldBeSelectedWarning')}
          type={MessageBarType.warning}
        />
      );
    } else {
      return <></>;
    }
  };

  useEffect(() => {
    setLogPanelHeight(logPanelExpanded ? minimumLogPanelHeight : 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logPanelExpanded]);

  useEffect(() => {
    setMonacoHeight(`calc(100vh - ${(logPanelExpanded ? logCommandBarHeight : 0) + logPanelHeight + 130 + getReadOnlyBannerHeight()}px)`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logPanelExpanded, readOnlyBanner, logPanelHeight]);

  useEffect(() => {
    if (!isRefreshing && !initialLoading) {
      fetchData();
    }

    resetInvalidFileSelectedWarningAndFileName();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshing]);

  useEffect(() => {
    fetchData();
    setLiveLogsSessionId(Guid.newGuid());
    if (Url.isFeatureFlagEnabled(CommonConstants.FeatureFlags.useNewFunctionLogsApi)) {
      setSelectedLoggingOption(showAppInsightsLogs ? LoggingOptions.appInsights : LoggingOptions.fileBased);
      expandLogPanel();
    } else {
      setSelectedLoggingOption(isFileSystemLoggingAvailable ? LoggingOptions.fileBased : LoggingOptions.appInsights);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={commandBarSticky}>
        <FunctionEditorCommandBar
          saveFunction={save}
          resetFunction={() => setShowDiscardConfirmDialog(true)}
          testFunction={test}
          refreshFunction={refresh}
          isGetFunctionUrlVisible={isGetFunctionUrlVisible()}
          dirty={isDirty()}
          disabled={isDisabled() || appReadOnlyPermission}
          urlObjs={urlObjs}
          testDisabled={isTestDisabled()}
          functionInfo={functionInfo}
          runtimeVersion={runtimeVersion}
          upload={uploadFile}
          setShowInvalidFileSelectedWarning={setShowInvalidFileSelectedWarning}
          setSelectedFileName={setSelectedFileName}
          resetInvalidFileSelectedWarningAndFileName={resetInvalidFileSelectedWarningAndFileName}
        />
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: discard,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: onCancelButtonClick,
          }}
          title={t('discardChangesTitle')}
          content={t('discardChangesMesssage').format(selectedFile ? selectedFile.data.name : '')}
          hidden={!showDiscardConfirmDialog}
          onDismiss={onCancelButtonClick}
        />
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: fileChangeConfirmClicked,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: onCancelButtonClick,
          }}
          title={t('editor_changeFile')}
          content={t('editor_changeFileConfirmMessage')}
          hidden={!selectedDropdownOption}
          onDismiss={onCancelButtonClick}
        />
        {getBanner()}
        <FunctionEditorFileSelectorBar
          disabled={isDisabled()}
          functionAppNameLabel={site.name}
          functionInfo={functionInfo}
          fileDropdownOptions={getDropdownOptions()}
          fileDropdownSelectedKey={(selectedFile?.key as string) ?? ''}
          onChangeDropdown={onFileSelectorChange}
        />
      </div>
      <CustomPanel
        type={PanelType.medium}
        isOpen={showTestPanel}
        onDismiss={onCloseTest}
        overlay={functionRunning || isRefreshing}
        headerContent={getHeaderContent()}
        isBlocking={false}
        customStyle={testPanelStyle}>
        {functionRunning && <LoadingComponent className={testLoadingStyle} />}
        <FunctionTest
          close={onCloseTest}
          run={run}
          functionInfo={functionInfo}
          reqBody={reqBody}
          setReqBody={setReqBody}
          responseContent={responseContent}
          functionRunning={functionRunning}
          testData={testData}
          urlObjs={urlObjs}
          xFunctionKey={xFunctionKey}
          getFunctionUrl={getFunctionUrl}
          addCorsRule={addCorsRule}
          enablePortalCall={enablePortalCall}
        />
      </CustomPanel>
      {isLoading() && <LoadingComponent />}
      {!logPanelFullscreen && (
        <div className={editorDivStyle}>
          <MonacoEditor
            value={isSelectedFileBlacklisted() ? t('blaclistFile_message') : fileContent.latest}
            language={editorLanguage}
            onChange={onChange}
            height={monacoHeight}
            disabled={isEditorDisabled()}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              cursorBlinking: true,
              renderWhitespace: 'all',
              readOnly: isAppReadOnly(siteStateContext.siteAppEditState) || appReadOnlyPermission,
              extraEditorClassName: editorStyle,
            }}
            theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
            onSave={() => isDirty() && save()}
          />
        </div>
      )}
      <div className={logPanelStyle(logPanelExpanded, logPanelFullscreen, getReadOnlyBannerHeight())}>
        {showAppInsightsLogs && selectedLoggingOption === LoggingOptions.appInsights && (
          <FunctionLogAppInsightsDataLoader
            resourceId={functionInfo.id}
            toggleExpand={toggleLogPanelExpansion}
            isExpanded={logPanelExpanded}
            toggleFullscreen={setLogPanelFullscreen}
            fileSavedCount={fileSavedCount}
            readOnlyBannerHeight={getReadOnlyBannerHeight()}
            hideLiveMetrics={true}
            isResizable={true}
            logPanelHeight={logPanelHeight}
            setLogPanelHeight={setLogPanelHeight}
            showLoggingOptionsDropdown={showLoggingOptionsDropdown}
            selectedLoggingOption={selectedLoggingOption}
            setSelectedLoggingOption={setSelectedLoggingOption}
            liveLogsSessionId={liveLogsSessionId}
          />
        )}
        {(!showAppInsightsLogs || selectedLoggingOption === LoggingOptions.fileBased) && (
          <FunctionLogFileStreamDataLoader
            site={site}
            toggleExpand={toggleLogPanelExpansion}
            isExpanded={logPanelExpanded}
            toggleFullscreen={setLogPanelFullscreen}
            fileSavedCount={fileSavedCount}
            readOnlyBannerHeight={getReadOnlyBannerHeight()}
            hideLiveMetrics={true}
            isResizable={true}
            logPanelHeight={logPanelHeight}
            setLogPanelHeight={setLogPanelHeight}
            showLoggingOptionsDropdown={showLoggingOptionsDropdown}
            selectedLoggingOption={selectedLoggingOption}
            setSelectedLoggingOption={setSelectedLoggingOption}
            functionName={functionInfo.properties.name}
          />
        )}
      </div>
    </>
  );
};
