import React, { useState } from 'react';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import AppFilesCommandBar from './AppFilesCommandBar';
import { commandBarSticky } from './AppFiles.styles';
import FunctionEditorFileSelectorBar from '../functions/function-editor/FunctionEditorFileSelectorBar';
import { IDropdownOption } from 'office-ui-fabric-react';

interface AppFilesProps {
  site: ArmObj<Site> | undefined;
}

const AppFiles: React.FC<AppFilesProps> = props => {
  const { site } = props;

  const [dirty /**setDirty**/] = useState(false);

  const save = () => {};

  const reset = () => {};

  const onFileSelectorChange = async (e: unknown, option: IDropdownOption) => {};

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
    </div>
  );
};

export default AppFiles;
