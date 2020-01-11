import React, { useState } from 'react';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import AppFilesCommandBar from './AppFilesCommandBar';
import { commandBarSticky, editorStyle } from './AppFiles.styles';
import FunctionEditorFileSelectorBar from '../functions/function-editor/FunctionEditorFileSelectorBar';
import { IDropdownOption } from 'office-ui-fabric-react';
import MonacoEditor from '../../../components/monaco-editor/monaco-editor';

interface AppFilesProps {
  site: ArmObj<Site> | undefined;
}

const AppFiles: React.FC<AppFilesProps> = props => {
  const { site } = props;

  const [dirty /**setDirty**/] = useState(false);

  const save = () => {};

  const reset = () => {};

  const onFileSelectorChange = async (e: unknown, option: IDropdownOption) => {};

  const onChange = (newValue, event) => {};

  return (
    <div className={commandBarSticky}>
      <AppFilesCommandBar dirty={dirty} disabled={false} saveFile={save} resetFile={reset} />
      <FunctionEditorFileSelectorBar
        functionAppNameLabel={!!site ? site.name : undefined}
        fileDropdownOptions={[]}
        fileDropdownSelectedKey={''}
        disabled={false}
        onChangeDropdown={onFileSelectorChange}
      />
      <div className={editorStyle}>
        <MonacoEditor
          value={''}
          language={'json'}
          onChange={onChange}
          disabled={false}
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
