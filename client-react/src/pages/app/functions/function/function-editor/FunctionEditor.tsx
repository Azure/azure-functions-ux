import React, { useState, useEffect, useContext } from 'react';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import FunctionEditorCommandBar from './FunctionEditorCommandBar';
import FunctionEditorFileSelectorBar from './FunctionEditorFileSelectorBar';
import { BindingType } from '../../../../../models/functions/function-binding';
import { Site } from '../../../../../models/site/site';
import CustomPanel from '../../../../../components/CustomPanel/CustomPanel';
import { PanelType, IDropdownOption, Pivot, PivotItem, MessageBarType } from 'office-ui-fabric-react';
import FunctionTest from './function-test/FunctionTest';
import MonacoEditor, { getMonacoEditorTheme } from '../../../../../components/monaco-editor/monaco-editor';
import { InputFormValues, ResponseContent, PivotType, FileContent, UrlObj, LoggingOptions } from './FunctionEditor.types';
import { VfsObject } from '../../../../../models/functions/vfs';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import ConfirmDialog from '../../../../../components/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import {
  pivotStyle,
  testLoadingStyle,
  commandBarSticky,
  logPanelStyle,
  defaultMonacoEditorHeight,
  testPanelStyle,
  editorStyle,
  editorDivStyle,
} from './FunctionEditor.styles';
import EditorManager, { EditorLanguage } from '../../../../../utils/EditorManager';
import { FormikActions } from 'formik';
import EditModeBanner from '../../../../../components/EditModeBanner/EditModeBanner';
import { SiteStateContext } from '../../../../../SiteState';
import SiteHelper from '../../../../../utils/SiteHelper';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { PortalTheme } from '../../../../../models/portal-models';
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
import { isLinuxDynamic } from '../../../../../utils/arm-utils';
import Url from '../../../../../utils/url';

export interface FunctionEditorProps {
  functionInfo: ArmObj<FunctionInfo>;
  site: ArmObj<Site>;
  run: (functionInfo: ArmObj<FunctionInfo>, xFunctionKey?: string) => void;
  functionRunning: boolean;
  urlObjs: UrlObj[];
  showTestPanel: boolean;
  setShowTestPanel: (showPanel: boolean) => void;
  refresh: () => void;
  isRefreshing: boolean;
  getFunctionUrl: (key?: string) => string;
  xFunctionKey?: string;
  responseContent?: ResponseContent;
  runtimeVersion?: string;
  fileList?: VfsObject[];
  testData?: string;
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
  } = props;
  const [reqBody, setReqBody] = useState('');
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fileContent, setFileContent] = useState<FileContent>({ default: '', latest: '' });
  const [selectedFile, setSelectedFile] = useState<IDropdownOption | undefined>(undefined);
  const [editorLanguage, setEditorLanguage] = useState(EditorLanguage.plaintext);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState<IDropdownOption | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [savingFile, setSavingFile] = useState<boolean>(false);
  const [selectedPivotTab, setSelectedPivotTab] = useState(PivotType.input);
  const [monacoHeight, setMonacoHeight] = useState(defaultMonacoEditorHeight);
  const [logPanelExpanded, setLogPanelExpanded] = useState(false);
  const [logPanelFullscreen, setLogPanelFullscreen] = useState(false);
  const [fileSavedCount, setFileSavedCount] = useState(0);
  const [readOnlyBanner, setReadOnlyBanner] = useState<HTMLDivElement | null>(null);
  const [isFileContentAvailable, setIsFileContentAvailable] = useState<boolean | undefined>(undefined);
  const [showDiscardConfirmDialog, setShowDiscardConfirmDialog] = useState(false);
  const [logPanelHeight, setLogPanelHeight] = useState(0);
  const [selectedLoggingOption, setSelectedLoggingOption] = useState<LoggingOptions | undefined>(undefined);

  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);
  const startUpInfoContext = useContext(StartupInfoContext);
  const functionEditorContext = useContext(FunctionEditorContext);

  const scenarioChecker = new ScenarioService(t);

  const showAppInsightsLogs = scenarioChecker.checkScenario(ScenarioIds.showAppInsightsLogs, { site }).status !== 'disabled';
  const isFileSystemLoggingAvailable = siteStateContext.site && !isLinuxDynamic(siteStateContext.site);
  const showLoggingOptionsDropdown = showAppInsightsLogs && isFileSystemLoggingAvailable;
  const appReadOnlyPermission = SiteHelper.isRbacReaderPermission(siteStateContext.siteAppEditState);
  const isHttpOrWebHookFunction = functionEditorContext.isHttpOrWebHookFunction(functionInfo);

  const save = async () => {
    if (!selectedFile) {
      return;
    }
    setSavingFile(true);
    const fileData = selectedFile.data;
    const headers = {
      'Content-Type': fileData.mime,
      'If-Match': '*',
    };
    const fileResponse = await FunctionsService.saveFileContent(
      site.id,
      fileData.name,
      fileContent.latest,
      functionInfo.properties.name,
      runtimeVersion,
      headers
    );
    if (fileResponse.metadata.success) {
      setFileContent({ ...fileContent, default: fileContent.latest });
      expandLogPanel();
      setFileSavedCount(fileSavedCount + 1);
    }
    setSavingFile(false);
  };

  const test = () => {
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

  const run = (values: InputFormValues, formikActions: FormikActions<InputFormValues>) => {
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
    props.run(tempFunctionInfo, values.xFunctionKey);
  };

  const isGetFunctionUrlVisible = () => {
    return (
      functionInfo.properties.config &&
      functionInfo.properties.config.bindings &&
      !!functionInfo.properties.config.bindings.find(e => e.type === BindingType.httpTrigger || e.type === BindingType.eventGridTrigger)
    );
  };

  const getDropdownOptions = (): IDropdownOption[] => {
    return !!fileList
      ? fileList
          .map(file => ({
            key: file.name,
            text: file.name,
            isSelected: false,
            data: file,
          }))
          .filter(file => file.data.mime !== 'inode/directory')
          .sort((a, b) => a.key.localeCompare(b.key))
      : [];
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
    if (!!file) {
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
    return isLoading() || functionRunning || isRefreshing;
  };

  const onCancelButtonClick = () => {
    setSelectedDropdownOption(undefined);
    setShowDiscardConfirmDialog(false);
  };

  const getPivotTabId = (itemKey: string, index: number): string => {
    return `function-test-${itemKey}`;
  };

  const onPivotItemClick = (item?: PivotItem, ev?: React.MouseEvent<HTMLElement>) => {
    if (!!item) {
      setSelectedPivotTab(item.props.itemKey as PivotType);
    }
  };

  const getHeaderContent = (): JSX.Element => {
    return (
      <Pivot getTabId={getPivotTabId} className={pivotStyle} onLinkClick={onPivotItemClick} selectedKey={selectedPivotTab}>
        <PivotItem itemKey={PivotType.input} linkText={t('functionTestInput')} />
        <PivotItem itemKey={PivotType.output} linkText={t('functionTestOutput')} />
      </Pivot>
    );
  };

  const changePivotTab = (pivotItem: PivotType) => {
    setSelectedPivotTab(pivotItem);
  };

  const toggleLogPanelExpansion = () => {
    if (!logPanelExpanded) {
      expandLogPanel();
    } else {
      closeLogPanel();
    }
  };

  const getReadOnlyBannerHeight = () => {
    return !!readOnlyBanner ? readOnlyBanner.offsetHeight : 0;
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
    if (!!selectedDropdownOption) {
      changeDropdownOption(selectedDropdownOption);
    }
    onCancelButtonClick();
  };

  const isSelectedFileBlacklisted = () => {
    return functionEditorContext.isBlacklistedFile(!!selectedFile ? (selectedFile.key as string) : '');
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

  useEffect(() => {
    setLogPanelHeight(logPanelExpanded ? minimumLogPanelHeight : 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logPanelExpanded]);

  useEffect(() => {
    setMonacoHeight(`calc(100vh - ${(logPanelExpanded ? logCommandBarHeight : 0) + logPanelHeight + 130 + getReadOnlyBannerHeight()}px)`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logPanelExpanded, readOnlyBanner, logPanelHeight]);

  useEffect(() => {
    if (!!responseContent) {
      changePivotTab(PivotType.output);
    }
  }, [responseContent]);

  useEffect(() => {
    if (!isRefreshing && !initialLoading) {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshing]);

  useEffect(() => {
    fetchData();
    setSelectedLoggingOption(showAppInsightsLogs ? LoggingOptions.appInsights : LoggingOptions.fileBased);

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
        {!isRuntimeReachable() || (!isSelectedFileBlacklisted() && isFileContentAvailable !== undefined && !isFileContentAvailable) ? (
          <CustomBanner
            message={!isRuntimeReachable() ? t('scmPingFailedErrorMessage') : t('fetchFileContentFailureMessage')}
            type={MessageBarType.error}
          />
        ) : (
          <EditModeBanner setBanner={setReadOnlyBanner} />
        )}
        <FunctionEditorFileSelectorBar
          disabled={isDisabled()}
          functionAppNameLabel={site.name}
          functionInfo={functionInfo}
          fileDropdownOptions={getDropdownOptions()}
          fileDropdownSelectedKey={!!selectedFile ? (selectedFile.key as string) : ''}
          onChangeDropdown={onFileSelectorChange}
        />
      </div>
      <CustomPanel
        type={PanelType.medium}
        isOpen={showTestPanel}
        onDismiss={onCloseTest}
        overlay={functionRunning}
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
          selectedPivotTab={selectedPivotTab}
          functionRunning={functionRunning}
          testData={testData}
          urlObjs={urlObjs}
          xFunctionKey={xFunctionKey}
          getFunctionUrl={getFunctionUrl}
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
              readOnly: SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState) || appReadOnlyPermission,
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
          />
        )}
        {(!showAppInsightsLogs || selectedLoggingOption === LoggingOptions.fileBased) && (
          <FunctionLogFileStreamDataLoader
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
          />
        )}
      </div>
    </>
  );
};
