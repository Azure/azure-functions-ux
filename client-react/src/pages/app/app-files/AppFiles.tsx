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

interface AppFilesProps {
  site: ArmObj<Site>;
  fileList?: VfsObject[];
}

const AppFiles: React.FC<AppFilesProps> = props => {
  const { site, fileList } = props;

  const [dirty /**setDirty**/] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<IDropdownOption | undefined>(undefined);

  const save = () => {};

  const reset = () => {};

  const onFileSelectorChange = async (e: unknown, option: IDropdownOption) => {};

  const onChange = (newValue, event) => {};

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
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={commandBarSticky}>
      <AppFilesCommandBar dirty={dirty} disabled={false} saveFile={save} resetFile={reset} />
      <FunctionEditorFileSelectorBar
        functionAppNameLabel={site.name}
        fileDropdownOptions={getDropdownOptions()}
        fileDropdownSelectedKey={!!selectedFile ? (selectedFile.key as string) : ''}
        disabled={false}
        onChangeDropdown={onFileSelectorChange}
      />
      {initialLoading && <LoadingComponent />}
      <div className={editorStyle}>
        <MonacoEditor
          value={''}
          language={'json'}
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
