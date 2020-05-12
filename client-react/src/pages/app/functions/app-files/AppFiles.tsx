import React, { useState, useEffect, useContext } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import AppFilesCommandBar from './AppFilesCommandBar';
import { commandBarSticky, editorStyle } from './AppFiles.styles';
import FunctionEditorFileSelectorBar from '../function/function-editor/FunctionEditorFileSelectorBar';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import MonacoEditor, { getMonacoEditorTheme } from '../../../../components/monaco-editor/monaco-editor';
import { VfsObject } from '../../../../models/functions/vfs';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { FileContent } from '../function/function-editor/FunctionEditor.types';
import EditorManager, { EditorLanguage } from '../../../../utils/EditorManager';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { SiteStateContext } from '../../../../SiteState';
import SiteHelper from '../../../../utils/SiteHelper';
import { StartupInfoContext } from '../../../../StartupInfoContext';
import { PortalTheme } from '../../../../models/portal-models';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import EditModeBanner from '../../../../components/EditModeBanner/EditModeBanner';

interface AppFilesProps {
  site: ArmObj<Site>;
  refreshFunction: () => void;
  isRefreshing: boolean;
  fileList?: VfsObject[];
  runtimeVersion?: string;
}

const AppFiles: React.FC<AppFilesProps> = props => {
  const { site, fileList, runtimeVersion, refreshFunction, isRefreshing } = props;

  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<IDropdownOption | undefined>(undefined);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState<IDropdownOption | undefined>(undefined);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fileContent, setFileContent] = useState<FileContent>({ default: '', latest: '' });
  const [editorLanguage, setEditorLanguage] = useState(EditorLanguage.plaintext);
  const [savingFile, setSavingFile] = useState(false);
  const [isFileContentAvailable, setIsFileContentAvailable] = useState<boolean | undefined>(undefined);
  const [monacoHeight, setMonacoHeight] = useState('calc(100vh - 100px)');
  const [readOnlyBanner, setReadOnlyBanner] = useState<HTMLDivElement | null>(null);

  const { t } = useTranslation();

  const siteStateContext = useContext(SiteStateContext);
  const startUpInfoContext = useContext(StartupInfoContext);

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
      undefined /** We don't need a function-name for accessing the files at Site-level */,
      runtimeVersion,
      headers
    );
    if (fileResponse.metadata.success) {
      setFileContent({ ...fileContent, default: fileContent.latest });
    }
    setSavingFile(false);
  };

  const discard = () => {
    setFileContent({ ...fileContent, latest: fileContent.default });
  };

  const onFileSelectorChange = async (e: unknown, option: IDropdownOption) => {
    if (isDirty()) {
      setSelectedDropdownOption(option);
      return;
    }
    changeDropdownOption(option);
  };

  const changeDropdownOption = (option: IDropdownOption) => {
    closeConfirmDialog();
    setFetchingFileContent(true);
    setSelectedFile(option);
    setSelectedFileContent(option.data);
    getAndSetEditorLanguage(option.data.name);
    setFetchingFileContent(false);
  };

  const closeConfirmDialog = () => {
    setSelectedDropdownOption(undefined);
  };

  const getAndSetEditorLanguage = (filename: string) => {
    setEditorLanguage(EditorManager.getEditorLanguage(filename));
  };

  const setSelectedFileContent = async (file: VfsObject) => {
    const headers = {
      'Content-Type': file.mime,
    };
    const fileResponse = await FunctionsService.getFileContent(
      site.id,
      undefined /** We don't need a function-name for accessing the files at Site-level */,
      runtimeVersion,
      headers,
      file.name
    );
    if (fileResponse.metadata.success) {
      let fileText = fileResponse.data as string;
      if (typeof fileResponse.data !== 'string') {
        // third parameter refers to the number of white spaces.
        // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
        fileText = JSON.stringify(fileResponse.data, null, 2);
      }
      setFileContent({ default: fileText, latest: fileText });
      setIsFileContentAvailable(true);
    } else {
      setFileContent({ default: '', latest: '' });
      setIsFileContentAvailable(false);
      LogService.error(
        LogCategories.appFiles,
        'getFileContent',
        `Failed to get file content: ${getErrorMessageOrStringify(fileResponse.metadata.error)}`
      );
    }
  };

  const onChange = (newValue, event) => {
    setFileContent({ ...fileContent, latest: newValue });
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

  const getAndSetFile = async () => {
    const options = getDropdownOptions();
    const hostsJsonFile = options.find(f => (f.key as string).toLowerCase() === CommonConstants.hostJsonFileName);
    const file = hostsJsonFile || (options.length > 0 && options[0]);
    if (!!file) {
      setSelectedFile(file);
      setSelectedFileContent(file.data);
      getAndSetEditorLanguage(file.data.name);
    }
    setInitialLoading(false);
  };

  const isDirty = () => fileContent.default !== fileContent.latest;

  const isLoading = () => initialLoading || fetchingFileContent;

  const isRuntimeReachable = () => !!fileList;

  useEffect(() => {
    setMonacoHeight(`calc(100vh - ${100 + (!!readOnlyBanner ? readOnlyBanner.offsetHeight : 0)}px)`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnlyBanner]);
  useEffect(() => {
    getAndSetFile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={commandBarSticky}>
      <AppFilesCommandBar dirty={isDirty()} disabled={isRefreshing} saveFile={save} resetFile={discard} refreshFunction={refreshFunction} />
      <ConfirmDialog
        primaryActionButton={{
          title: t('ok'),
          onClick: () => !!selectedDropdownOption && changeDropdownOption(selectedDropdownOption),
        }}
        defaultActionButton={{
          title: t('cancel'),
          onClick: closeConfirmDialog,
        }}
        title={t('editor_changeFile')}
        content={t('editor_changeFileConfirmMessage')}
        hidden={!selectedDropdownOption}
        onDismiss={closeConfirmDialog}
      />
      <FunctionEditorFileSelectorBar
        functionAppNameLabel={site.name}
        fileDropdownOptions={getDropdownOptions()}
        fileDropdownSelectedKey={!!selectedFile ? (selectedFile.key as string) : ''}
        disabled={isRefreshing}
        onChangeDropdown={onFileSelectorChange}
      />
      {(isLoading() || savingFile) && <LoadingComponent />}
      {!isRuntimeReachable() || (isFileContentAvailable !== undefined && !isFileContentAvailable) ? (
        <CustomBanner
          message={!isRuntimeReachable() ? t('scmPingFailedErrorMessage') : t('fetchFileContentFailureMessage')}
          type={MessageBarType.error}
        />
      ) : (
        <EditModeBanner setBanner={setReadOnlyBanner} />
      )}
      <div className={editorStyle}>
        <MonacoEditor
          value={fileContent.latest}
          language={editorLanguage}
          onChange={onChange}
          height={monacoHeight}
          disabled={initialLoading || !isFileContentAvailable || !isRuntimeReachable()}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            cursorBlinking: true,
            renderWhitespace: 'all',
            readOnly: SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState),
          }}
          theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
        />
      </div>
      {isRefreshing && <LoadingComponent overlay={true} />}
    </div>
  );
};

export default AppFiles;
