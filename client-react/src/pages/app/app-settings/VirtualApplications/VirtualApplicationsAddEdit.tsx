import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';

export interface HandlerMappingAddEditProps extends VirtualApplication {
  updateVirtualApplication: (item: VirtualApplication) => any;
}

const VirtualApplicationsAddEdit: React.SFC<HandlerMappingAddEditProps> = props => {
  const { updateVirtualApplication, children, ...virtualApplication } = props;
  const updatePhysicalPath = (physicalPath: string) => {
    updateVirtualApplication({
      ...virtualApplication,
      physicalPath,
    });
  };

  const updateVirtualPath = (virtualPath: string) => {
    updateVirtualApplication({ ...virtualApplication, virtualPath });
  };

  const updateVirtualDirectory = (virtualDirectory: boolean) => {
    updateVirtualApplication({
      ...virtualApplication,
      virtualDirectory,
    });
  };
  const updatePreloadEnabled = (preloadEnabled: boolean) => {
    updateVirtualApplication({
      ...virtualApplication,
      preloadEnabled,
    });
  };
  return (
    <div>
      <TextField label="Physical Path" id="extension" value={virtualApplication.physicalPath} onChanged={updatePhysicalPath} />
      <TextField label="Virtual Path" id="value" value={virtualApplication.virtualPath} onChanged={updateVirtualPath} />
      <Toggle
        label="Directory or Application"
        id="sticky"
        defaultChecked={virtualApplication.virtualDirectory}
        onChanged={updateVirtualDirectory}
        onText="Directory"
        offText="Application"
      />
      {virtualApplication.virtualDirectory ? null : (
        <Toggle
          label="Preload Enabled"
          id="preloadEnabled"
          defaultChecked={virtualApplication.preloadEnabled}
          onChanged={updatePreloadEnabled}
          onText="On"
          offText="Off"
        />
      )}
    </div>
  );
};

export default VirtualApplicationsAddEdit;
