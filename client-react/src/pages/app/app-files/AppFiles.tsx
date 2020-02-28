import React, { useState, useEffect, useContext } from 'react';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import AppFilesCommandBar from './AppFilesCommandBar';
import { commandBarSticky, editorStyle } from './AppFiles.styles';
import FunctionEditorFileSelectorBar from '../functions/function-editor/FunctionEditorFileSelectorBar';
import { IDropdownOption } from 'office-ui-fabric-react';
import MonacoEditor from '../../../components/monaco-editor/monaco-editor';
import { VfsObject } from '../../../models/functions/vfs';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import FunctionsService from '../../../ApiHelpers/FunctionsService';
import { FileContent } from '../functions/function-editor/FunctionEditor.types';
import EditorManager, { EditorLanguage } from '../../../utils/EditorManager';
import { CommonConstants } from '../../../utils/CommonConstants';
import { SiteStateContext } from '../../../SiteStateContext';
import SiteHelper from '../../../utils/SiteHelper';

interface AppFilesProps {
  site: ArmObj<Site>;
  fileList?: VfsObject[];
  runtimeVersion?: string;
}

const AppFiles: React.FC<AppFilesProps> = props => {
  const { site, fileList, runtimeVersion } = props;

  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<IDropdownOption | undefined>(undefined);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState<IDropdownOption | undefined>(undefined);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fileContent, setFileContent] = useState<FileContent>({ default: '', latest: '' });
  const [editorLanguage, setEditorLanguage] = useState(EditorLanguage.plaintext);
  const [savingFile, setSavingFile] = useState(false);

  const { t } = useTranslation();

  const siteState = useContext(SiteStateContext);

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

  useEffect(() => {
    getAndSetFile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={commandBarSticky}>
      <AppFilesCommandBar dirty={isDirty()} disabled={false} saveFile={save} resetFile={discard} />
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
        disabled={false}
        onChangeDropdown={onFileSelectorChange}
      />
      {(isLoading() || savingFile) && <LoadingComponent />}
      <div className={editorStyle}>
        <MonacoEditor
          value={fileContent.latest}
          language={editorLanguage}
          onChange={onChange}
          disabled={initialLoading}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            cursorBlinking: true,
            renderWhitespace: 'all',
            readOnly: SiteHelper.isFunctionAppReadOnly(siteState),
          }}
        />
      </div>
    </div>
  );
};

export default AppFiles;
