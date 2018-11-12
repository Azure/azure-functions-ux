import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { Checkbox } from 'office-ui-fabric-react';
import { formElementStyle } from '../AppSettings.Styles';

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

  const updatePhysicalPath = (e: any, physicalPath: string) => {
    updateVirtualApplication({
      ...virtualApplication,
      physicalPath,
    });
  };

  const updateVirtualPath = (e: any, virtualPath: string) => {
    const error = validateVirtualPathUniqueness(virtualPath);
    setPathError(error);
    updateVirtualApplication({ ...virtualApplication, virtualPath });
  };

  const updateVirtualDirectory = (e: any, virtualDirectory: boolean) => {
    updateVirtualApplication({
      ...virtualApplication,
      virtualDirectory,
    });
  };
  const updatePreloadEnabled = (e: any, preloadEnabled: boolean) => {
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
        onChange={updateVirtualPath}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextField
        label={t('physicalPath')}
        id="va-physical-path"
        value={virtualApplication.physicalPath}
        onChange={updatePhysicalPath}
        styles={{
          root: formElementStyle,
        }}
      />
      <Checkbox
        label={t('directory')}
        id="va-directory-or-application"
        defaultChecked={virtualApplication.virtualDirectory}
        onChange={updateVirtualDirectory}
        styles={{
          root: formElementStyle,
        }}
      />
      {virtualApplication.virtualDirectory ? null : (
        <Checkbox
          label={t('preloadEnabled')}
          id="va-preload-enabled"
          defaultChecked={virtualApplication.preloadEnabled}
          onChange={updatePreloadEnabled}
          styles={{
            root: formElementStyle,
          }}
        />
      )}
    </div>
  );
};

export default translate('translation')(VirtualApplicationsAddEdit);
