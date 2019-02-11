import { Checkbox } from 'office-ui-fabric-react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '../../../../components/ActionBar';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { formElementStyle } from '../AppSettings.styles';

export interface HandlerMappingAddEditProps {
  updateVirtualApplication: (item: VirtualApplication) => any;
  closeBlade: () => void;
  otherVirtualApplications: VirtualApplication[];
  virtualApplication: VirtualApplication;
}

const VirtualApplicationsAddEdit: React.FC<HandlerMappingAddEditProps> = props => {
  const { updateVirtualApplication, otherVirtualApplications, closeBlade, virtualApplication } = props;
  const { t } = useTranslation();
  const [pathError, setPathError] = useState('');
  const [currentVirtualApplication, setCurrentVirtualApplication] = useState(virtualApplication);

  const validateVirtualPathUniqueness = (value: string) => {
    return otherVirtualApplications.filter(v => v.virtualPath === value).length >= 1 ? t('virtualPathUnique') : '';
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
    id: 'save',
    title: t('update'),
    onClick: save,
    disable: !!pathError,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
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
        autoFocus
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

export default VirtualApplicationsAddEdit;
