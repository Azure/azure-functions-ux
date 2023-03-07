import { IDropdownOption, MessageBarType, PanelType } from '@fluentui/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import ConfirmDialog from '../../../../../components/ConfirmDialog/ConfirmDialog';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import CustomPanel from '../../../../../components/CustomPanel/CustomPanel';
import EditModeBanner from '../../../../../components/EditModeBanner/EditModeBanner';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import MonacoEditor, { getMonacoEditorTheme } from '../../../../../components/monaco-editor/monaco-editor';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { VfsObject } from '../../../../../models/functions/vfs';
import { FunctionAppEditMode, PortalTheme } from '../../../../../models/portal-models';
import { Site } from '../../../../../models/site/site';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { isKubeApp, isLinuxDynamic } from '../../../../../utils/arm-utils';
import { BindingManager } from '../../../../../utils/BindingManager';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import EditorManager, { EditorLanguage } from '../../../../../utils/EditorManager';
import FunctionAppService from '../../../../../utils/FunctionAppService';
import { Links } from '../../../../../utils/FwLinks';
import { Guid } from '../../../../../utils/Guid';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import SiteHelper from '../../../../../utils/SiteHelper';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import Url from '../../../../../utils/url';
import { logCommandBarHeight, minimumLogPanelHeight } from '../function-log/FunctionLog.styles';
import FunctionLogAppInsightsDataLoader from '../function-log/FunctionLogAppInsightsDataLoader';
import FunctionLogFileStreamDataLoader from '../function-log/FunctionLogFileStreamDataLoader';
import FunctionTestIntegration from './function-test-integration/FunctionTestIntegration';
import FunctionTest from './function-test/FunctionTest';
import {
  commandBarSticky,
  defaultMonacoEditorHeight,
  editorDivStyle,
  editorStyle,
  logPanelStyle,
  testLoadingStyle,
  testPanelStyle,
} from './FunctionEditor.styles';
import { FileContent, InputFormValues, LoggingOptions, ResponseContent, UrlObj } from './FunctionEditor.types';
import FunctionEditorCommandBar from './FunctionEditorCommandBar';
import { FunctionEditorContext } from './FunctionEditorDataLoader';
import FunctionEditorFileSelectorBar from './FunctionEditorFileSelectorBar';
import { isNewProgrammingModel, getNewProgrammingModelFolderName, Status, isNewNodeProgrammingModel } from './useFunctionEditorQueries';

export interface FunctionEditorProps {
  functionInfo: ArmObj<FunctionInfo>;
  site: ArmObj<Site>;
  run: (functionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string, liveLogsSessionId?: string) => void;
  functionRunning: boolean;
  urlObjs: UrlObj[];
  showTestPanel: boolean;
  showTestIntegrationPanel: boolean;
  setShowTestPanel: (showPanel: boolean) => void;
  setShowTestIntegrationPanel: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
  isRefreshing: boolean;
  getFunctionUrl: (key?: string) => string;
  isUploadingFile: boolean;
  setIsUploadingFile: (isUploadingFile: boolean) => void;
  refreshFileList: () => void;
  addCorsRule: (corsRule: string) => void;
  status: Status;
  xFunctionKey?: string;
  responseContent?: ResponseContent;
  runtimeVersion?: string;
  fileList?: VfsObject[];
  testData?: string;
  workerRuntime?: string;
  enablePortalCall?: boolean;
  addingCorsRules?: boolean;
}

export const FunctionEditor: React.FC<FunctionEditorProps> = (props: FunctionEditorProps) => {
  const {
    functionInfo,
    site,
    fileList,
    runtimeVersion,
    responseContent,
    functionRunning,
    urlObjs,
    showTestPanel,
    showTestIntegrationPanel,
    setShowTestPanel,
    setShowTestIntegrationPanel,
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
    addingCorsRules,
    status,
  } = props;
  const [reqBody, setReqBody] = useState('');
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fileContent, setFileContent] = useState<FileContent>({ default: '', latest: '' });
  const [selectedFile, setSelectedFile] = useState<IDropdownOption>();
  const [editorLanguage, setEditorLanguage] = useState(EditorLanguage.plaintext);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState<IDropdownOption>();
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingFile, setSavingFile] = useState(false);
  const [monacoHeight, setMonacoHeight] = useState(defaultMonacoEditorHeight);
  const [logPanelExpanded, setLogPanelExpanded] = useState(false);
  const [logPanelFullscreen, setLogPanelFullscreen] = useState(false);
  const [fileSavedCount, setFileSavedCount] = useState(0);
  const [readOnlyBanner, setReadOnlyBanner] = useState<HTMLDivElement | null>(null);
  const [isFileContentAvailable, setIsFileContentAvailable] = useState<boolean>();
  const [showDiscardConfirmDialog, setShowDiscardConfirmDialog] = useState(false);
  const [logPanelHeight, setLogPanelHeight] = useState(0);
  const [selectedLoggingOption, setSelectedLoggingOption] = useState<LoggingOptions>();
  const [liveLogsSessionId, setLiveLogsSessionId] = useState<string>();
  const [showInvalidFileSelectedWarning, setShowInvalidFileSelectedWarning] = useState<boolean>();
  const [selectedFileName, setSelectedFileName] = useState('');

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

  const testIntegration = useCallback(() => {
    setShowTestIntegrationPanel(true);
  }, [setShowTestIntegrationPanel]);

  const onCloseTest = () => {
    setShowTestPanel(false);
  };

  const onCloseTestIntegration = useCallback(() => {
    setShowTestIntegrationPanel(false);
  }, [setShowTestIntegrationPanel]);

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
      !!BindingManager.getAuthenticationEventsTriggerTypeInfo(properties)
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

  const setSelectedFileContent = useCallback(
    (file: VfsObject) => {
      const headers = {
        'Content-Type': file.mime,
      };
      // For new programming model, currently Node is the only one returns the specific folder name to get a list of files.
      const functionName = isNewProgrammingModel(functionInfo) ? '' : functionInfo.properties.name;
      const newProgrammingModelFolderName = getNewProgrammingModelFolderName(functionInfo);

      FunctionsService.getFileContent(site.id, functionName, runtimeVersion, headers, file.name, newProgrammingModelFolderName).then(
        fileResponse => {
          setIsFileContentAvailable(fileResponse.metadata.success);

          if (fileResponse.metadata.success) {
            const fileText = typeof fileResponse.data === 'string' ? fileResponse.data : JSON.stringify(fileResponse.data, null, 2);
            setFileContent({ default: fileText, latest: fileText });
          } else {
            setFileContent({ default: '', latest: '' });
            portalCommunicator.log(
              getTelemetryInfo('error', 'getFileContent', 'failed', {
                error: fileResponse.metadata.error,
                message: 'Failed to get file content',
              })
            );
          }
        }
      );
    },
    [functionInfo, runtimeVersion, site.id]
  );

  const getScriptFileOption = (): IDropdownOption | undefined => {
    let filename = '';
    if (isNewNodeProgrammingModel(functionInfo)) {
      filename = functionInfo.properties.config.scriptFile || '';
    } else {
      const scriptHref = functionInfo.properties.script_href;
      filename = ((scriptHref && scriptHref.split('/').pop()) || '').toLocaleLowerCase();
    }

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

  const onChange = newValue => {
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
    portalCommunicator.log(getTelemetryInfo('info', 'functionEditor', 'logPanelExpaned'));
  };

  const closeLogPanel = () => {
    setLogPanelExpanded(false);
    portalCommunicator.log(getTelemetryInfo('info', 'functionEditor', 'logPanelClosed'));
  };

  const uploadFile = async file => {
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

    xhr.onloadstart = async () => {
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
        portalCommunicator.log(
          getTelemetryInfo('error', 'functionEditorFileUpload', 'failed', {
            error: loadEndEvent.target && loadEndEvent.target['response'],
            message: 'Failed to upload file',
          })
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
    /* NOTE (shimedh): Show unauthorized banner first, if not present then show the read-only banner, instead of showing the Generic Runtime failure method */
    if (status === 'unauthorized') {
      return <CustomBanner message={t('unauthorizedMessageFunctionEditor')} type={MessageBarType.warning} />;
    } else if (addingCorsRules) {
      return <CustomBanner message={t('functionEditorCorsWarning')} type={MessageBarType.info} />;
    } else if (isAppReadOnly(siteStateContext.siteAppEditState)) {
      return <EditModeBanner setBanner={setReadOnlyBanner} />;
    } else if (!isRuntimeReachable() || (!isSelectedFileBlacklisted() && isFileContentAvailable !== undefined && !isFileContentAvailable)) {
      return (
        <CustomBanner
          message={!isRuntimeReachable() ? t('scmPingFailedErrorMessage') : t('fetchFileContentFailureMessage')}
          type={MessageBarType.error}
          learnMoreLink={!isRuntimeReachable() ? Links.functionUnreachableLearnMore : undefined}
        />
      );
    } else if (FunctionAppService.enableEditingForLinux(site, workerRuntime) && isLinuxDynamic(site)) {
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
    if (runtimeVersion === CommonConstants.FunctionsRuntimeVersions.four) {
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
          testIntegrationFunction={testIntegration}
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
          addingCorsRules={addingCorsRules}
        />
      </CustomPanel>
      <CustomPanel
        customStyle={testPanelStyle}
        headerText={t('testIntegration')}
        isBlocking={false}
        isOpen={showTestIntegrationPanel}
        overlay={isRefreshing}
        onDismiss={onCloseTestIntegration}
        type={PanelType.medium}>
        <FunctionTestIntegration functionInfo={functionInfo} />
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
