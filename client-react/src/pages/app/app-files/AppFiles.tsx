import React, { useState, useEffect } from 'react';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import AppFilesCommandBar from './AppFilesCommandBar';
import { commandBarSticky, editorStyle } from './AppFiles.styles';
import FunctionEditorFileSelectorBar from '../functions/function-editor/FunctionEditorFileSelectorBar';
import { IDropdownOption } from 'office-ui-fabric-react';
import MonacoEditor from '../../../components/monaco-editor/monaco-editor';
import { VfsObject } from '../../../models/functions/vfs';
import LoadingComponent from '../../../components/loading/loading-component';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import FunctionsService from '../../../ApiHelpers/FunctionsService';
import { FileContent } from '../functions/function-editor/FunctionEditor.types';
import EditorManager, { EditorLanguage } from '../../../utils/EditorManager';

interface AppFilesProps {
  site: ArmObj<Site>;
  fileList?: VfsObject[];
  runtimeVersion?: string;
}

const AppFiles: React.FC<AppFilesProps> = props => {
  const { site, fileList, runtimeVersion } = props;

  const [dirty, setDirty] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<IDropdownOption | undefined>(undefined);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState<IDropdownOption | undefined>(undefined);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [fileContent, setFileContent] = useState<FileContent>({ default: '', latest: '' });
  const [editorLanguage, setEditorLanguage] = useState(EditorLanguage.plaintext);
  const [savingFile, setSavingFile] = useState(false);

  const { t } = useTranslation();

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
    if (dirty) {
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
      if (file.mime === 'application/json') {
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

  const fetchData = async () => {
    const options = getDropdownOptions();
    const file = options.length > 0 ? options[0] : undefined;
    if (!!file) {
      setSelectedFile(file);
      setSelectedFileContent(file.data);
      getAndSetEditorLanguage(file.data.name);
    }
    setInitialLoading(false);
  };

  const isLoading = () => initialLoading || fetchingFileContent;

  useEffect(() => {
    setDirty(fileContent.default !== fileContent.latest);
  }, [fileContent]);
  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={commandBarSticky}>
      <AppFilesCommandBar dirty={dirty} disabled={false} saveFile={save} resetFile={discard} />
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
          }}
        />
      </div>
    </div>
  );
};

export default AppFiles;
