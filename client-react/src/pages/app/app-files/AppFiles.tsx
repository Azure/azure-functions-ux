import React, { useState } from 'react';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import AppFilesCommandBar from './AppFilesCommandBar';

interface AppFilesProps {
  site: ArmObj<Site> | undefined;
}

const AppFiles: React.FC<AppFilesProps> = props => {
  const [dirty /**setDirty**/] = useState(false);

  const save = () => {};

  const reset = () => {};

  return (
    <div>
      <AppFilesCommandBar dirty={dirty} disabled={false} saveFile={save} resetFile={reset} />
    </div>
  );
};

export default AppFiles;
