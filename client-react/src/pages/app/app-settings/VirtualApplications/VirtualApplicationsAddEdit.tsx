import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
import { InjectedTranslateProps, translate } from 'react-i18next';

export interface HandlerMappingAddEditProps extends VirtualApplication {
  updateVirtualApplication: (item: VirtualApplication) => any;
  otherVirtualApplications: VirtualApplication[];
}

const VirtualApplicationsAddEdit: React.SFC<HandlerMappingAddEditProps & InjectedTranslateProps> = props => {
  const { updateVirtualApplication, children, otherVirtualApplications, t, ...virtualApplication } = props;
  const [pathError, setPathError] = React.useState('');

  const validateVirtualPathUniqueness = (value: string) => {
    return otherVirtualApplications.filter(v => v.virtualPath === value).length >= 1 ? "Virtual Path's must be unique" : '';
  };

  const updatePhysicalPath = (physicalPath: string) => {
    updateVirtualApplication({
      ...virtualApplication,
      physicalPath,
    });
  };

  const updateVirtualPath = (virtualPath: string) => {
    const error = validateVirtualPathUniqueness(virtualPath);
    setPathError(error);
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
      <TextField
        label={t('virtualPath')}
        id="va-virtual-path"
        value={virtualApplication.virtualPath}
        errorMessage={pathError}
        onChanged={updateVirtualPath}
      />
      <TextField label={t('physicalPath')} id="va-physical-path" value={virtualApplication.physicalPath} onChanged={updatePhysicalPath} />
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
