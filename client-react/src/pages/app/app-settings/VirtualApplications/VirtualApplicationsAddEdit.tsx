import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { Checkbox } from 'office-ui-fabric-react';
import { formElementStyle } from '../AppSettings.Styles';
import ActionBar from '../../../../components/ActionBar';

export interface HandlerMappingAddEditProps {
  updateVirtualApplication: (item: VirtualApplication) => any;
  closeBlade: () => void;
  otherVirtualApplications: VirtualApplication[];
  virtualApplication: VirtualApplication;
}

const VirtualApplicationsAddEdit: React.SFC<HandlerMappingAddEditProps & InjectedTranslateProps> = props => {
  const { updateVirtualApplication, otherVirtualApplications, t, closeBlade, virtualApplication } = props;
  const [pathError, setPathError] = React.useState('');
  const [currentVirtualApplication, setCurrentVirtualApplication] = React.useState(virtualApplication);

  const validateVirtualPathUniqueness = (value: string) => {
    return otherVirtualApplications.filter(v => v.virtualPath === value).length >= 1 ? "Virtual Path's must be unique" : '';
  };

  const updatePhysicalPath = (e: any, physicalPath: string) => {
    setCurrentVirtualApplication({
      ...currentVirtualApplication,
      physicalPath,
    });
  };

  const updateVirtualPath = (e: any, virtualPath: string) => {
    const error = validateVirtualPathUniqueness(virtualPath);
    setPathError(error);
    setCurrentVirtualApplication({ ...currentVirtualApplication, virtualPath });
  };

  const updateVirtualDirectory = (e: any, virtualDirectory: boolean) => {
    setCurrentVirtualApplication({
      ...currentVirtualApplication,
      virtualDirectory,
    });
  };
  const updatePreloadEnabled = (e: any, preloadEnabled: boolean) => {
    setCurrentVirtualApplication({
      ...currentVirtualApplication,
      preloadEnabled,
    });
  };

  const save = () => {
    updateVirtualApplication(currentVirtualApplication);
  };

  const cancel = () => {
    closeBlade();
  };

  const actionBarPrimaryButtonProps = {
    title: t('save'),
    onClick: save,
    disable: !!pathError,
  };

  const actionBarSecondaryButtonProps = {
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  return (
    <form>
      <TextField
        label={t('virtualPath')}
        id="va-virtual-path"
        value={currentVirtualApplication.virtualPath}
        errorMessage={pathError}
        onChange={updateVirtualPath}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextField
        label={t('physicalPath')}
        id="va-physical-path"
        value={currentVirtualApplication.physicalPath}
        onChange={updatePhysicalPath}
        styles={{
          root: formElementStyle,
        }}
      />
      <Checkbox
        label={t('directory')}
        id="va-directory-or-application"
        defaultChecked={currentVirtualApplication.virtualDirectory}
        onChange={updateVirtualDirectory}
        styles={{
          root: formElementStyle,
        }}
      />
      {currentVirtualApplication.virtualDirectory ? null : (
        <Checkbox
          label={t('preloadEnabled')}
          id="va-preload-enabled"
          defaultChecked={currentVirtualApplication.preloadEnabled}
          onChange={updatePreloadEnabled}
          styles={{
            root: formElementStyle,
          }}
        />
      )}
      <ActionBar
        id="virtual-applications-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
      />
    </form>
  );
};

export default translate('translation')(VirtualApplicationsAddEdit);
