import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
import { InjectedTranslateProps, translate } from 'react-i18next';

export interface HandlerMappingAddEditProps extends VirtualApplication {
  updateVirtualApplication: (item: VirtualApplication) => any;
}

const VirtualApplicationsAddEdit: React.SFC<HandlerMappingAddEditProps & InjectedTranslateProps> = props => {
  const { updateVirtualApplication, children, t, ...virtualApplication } = props;
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
      <TextField label={t('physicalPath')} id="va-physical-path" value={virtualApplication.physicalPath} onChanged={updatePhysicalPath} />
      <TextField label={t('virtualPath')} id="va-virtual-path" value={virtualApplication.virtualPath} onChanged={updateVirtualPath} />
      <Toggle
        label={t('directoryOrApplciation')}
        id="va-directory-or-application"
        defaultChecked={virtualApplication.virtualDirectory}
        onChanged={updateVirtualDirectory}
        onText={t('directory')}
        offText={t('application')}
      />
      {virtualApplication.virtualDirectory ? null : (
        <Toggle
          label={t('preloadEnabled')}
          id="va-preload-enabled"
          defaultChecked={virtualApplication.preloadEnabled}
          onChanged={updatePreloadEnabled}
          onText={t('on')}
          offText={t('off')}
        />
      )}
    </div>
  );
};

export default translate('translation')(VirtualApplicationsAddEdit);
