import { Checkbox } from 'office-ui-fabric-react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../components/ActionBar';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { formElementStyle } from '../AppSettings.styles';
import { isEqual } from 'lodash-es';
import StringUtils from '../../../../utils/string';

export interface HandlerMappingAddEditProps {
  updateVirtualApplication: (item: VirtualApplication) => any;
  closeBlade: () => void;
  otherVirtualApplications: VirtualApplication[];
  virtualApplication: VirtualApplication;
}
const VirtualApplicationsAddEdit: React.FC<HandlerMappingAddEditProps> = props => {
  const { updateVirtualApplication, otherVirtualApplications, closeBlade, virtualApplication } = props;
  const { t } = useTranslation();
  const [virtualPathError, setVirtualPathError] = useState('');
  const [physicalPathError, setPhysicalPathError] = useState('');
  const [currentVirtualApplication, setCurrentVirtualApplication] = useState(virtualApplication);
  const dirty = () => {
    return !isEqual(virtualApplication, currentVirtualApplication);
  };

  const validateVirtualPathUniqueness = () => {
    if (currentVirtualApplication.virtualPath === virtualApplication.virtualPath) {
      // unchanged, don't check for uniquness
      return '';
    }
    const currentVirtualPath = StringUtils.trimChar(currentVirtualApplication.virtualPath, '/');
    return otherVirtualApplications.filter(v => StringUtils.trimChar(v.virtualPath, '/') === currentVirtualPath).length >= 1
      ? t('virtualPathUnique')
      : '';
  };

  const validateVirtualPath = () => {
    let err = '';
    if (currentVirtualApplication.virtualDirectory) {
      err =
        otherVirtualApplications
          .filter(v => !v.virtualDirectory)
          .map(v => v.virtualPath)
          .filter(v => currentVirtualApplication.virtualPath.startsWith(v) || `/${currentVirtualApplication.virtualPath}`.startsWith(v))
          .length === 0
          ? t('virtualDirectoryPathError')
          : '';
    }
    return err || validateVirtualPathUniqueness();
  };

  const validatePhysicalPath = () => {
    return !currentVirtualApplication.physicalPath.startsWith('site\\') ? t('physicalPathLocationError') : '';
  };

  // validation
  useEffect(
    () => {
      if (dirty()) {
        setVirtualPathError(validateVirtualPath());
        setPhysicalPathError(validatePhysicalPath());
      }
    },
    [currentVirtualApplication]
  );
  const updatePhysicalPath = (e: any, physicalPath: string) => {
    setCurrentVirtualApplication({
      ...currentVirtualApplication,
      physicalPath,
    });
  };

  const updateVirtualPath = (e: any, virtualPath: string) => {
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
    disable: !!virtualPathError || !!physicalPathError || !dirty(),
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
        errorMessage={virtualPathError}
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
        errorMessage={physicalPathError}
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
