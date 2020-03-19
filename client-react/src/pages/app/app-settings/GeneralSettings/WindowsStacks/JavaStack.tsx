import { Field, FormikProps } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useState, useEffect, useContext } from 'react';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { AppSettingsFormValues } from '../../AppSettings.types';
import {
  getJavaStack,
  getJavaContainers,
  getJavaMajorVersion,
  getJavaVersionAsDropdownOptions,
  getJavaMinorVersionOptions,
  getJavaContainersOptions,
  getFrameworkVersionOptions,
  getJavaMajorVersionObject,
} from './JavaData';
import { useTranslation } from 'react-i18next';
import { PermissionsContext } from '../../Contexts';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import { ArmObj } from '../../../../../models/arm-obj';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const JavaStack: React.SFC<Props> = props => {
  const [currentJavaMajorVersion, setCurrentJavaMajorVersion] = useState('');
  const { stacks, values, initialValues } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const javaStack = getJavaStack(stacks);
  const javaContainers = getJavaContainers(stacks);

  useEffect(() => {
    if (javaStack && javaContainers) {
      setCurrentJavaMajorVersion(getJavaMajorVersion(javaStack.properties, values.config));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!javaStack || !javaContainers) {
    return null;
  }

  const getInitialJavaMinorVersion = () => {
    const initialJavaMajorVersion = getJavaMajorVersion(javaStack.properties, initialValues.config);
    if (!initialJavaMajorVersion) {
      return '';
    }
    const initialJavaMajorVersionObject = getJavaMajorVersionObject(javaStack, initialJavaMajorVersion);
    return initialJavaMajorVersionObject ? initialJavaMajorVersionObject.displayVersion : '';
  };

  const getSelectedJavaMinorVersion = () => {
    const currentJavaMajorVersion = getJavaMajorVersion(javaStack.properties, values.config);
    if (!currentJavaMajorVersion) {
      return '';
    }
    const currentJavaMajorVersionObject = getJavaMajorVersionObject(javaStack, currentJavaMajorVersion);
    return currentJavaMajorVersionObject ? currentJavaMajorVersionObject.displayVersion : '';
  };

  const isJavaMajorVersionDirty = () => {
    return (
      values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
      currentJavaMajorVersion !== getJavaMajorVersion(javaStack.properties, initialValues.config)
    );
  };

  const isJavaMinorVersionDirty = () => {
    return isJavaMajorVersionDirty() || getSelectedJavaMinorVersion() !== getInitialJavaMinorVersion();
  };

  const isJavaContainerDirty = () => {
    return isJavaMinorVersionDirty() || values.config.properties.javaContainer !== initialValues.config.properties.javaContainer;
  };

  const isJavaContainerVersionDirty = () => {
    return isJavaContainerDirty() || values.config.properties.javaContainerVersion !== initialValues.config.properties.javaContainerVersion;
  };

  // Java Versions
  const javaMajorVersionOptions = getJavaVersionAsDropdownOptions(javaStack);
  const javaMinorVersionOptions = getJavaMinorVersionOptions(currentJavaMajorVersion, javaStack, t('newest'), t('autoUpdate'));

  // container versions
  const frameworks = getJavaContainersOptions(javaContainers);
  const javaFrameworkVersionOptions = getFrameworkVersionOptions(javaContainers, values.config, t('autoUpdate'));
  const onMajorVersionChange = (e: unknown, option: IDropdownOption) => {
    setCurrentJavaMajorVersion(option.key as string);
  };
  return (
    <div>
      <DropdownNoFormik
        label={t('javaVersionLabel')}
        dirty={isJavaMajorVersionDirty()}
        selectedKey={currentJavaMajorVersion}
        id="app-settings-java-major-verison"
        disabled={disableAllControls}
        options={javaMajorVersionOptions}
        onChange={onMajorVersionChange}
      />
      <Field
        name="config.properties.javaVersion"
        dirty={isJavaMinorVersionDirty()}
        component={Dropdown}
        fullpage
        required
        disabled={disableAllControls}
        label={t('javaMinorVersion')}
        id="app-settings-java-minor-verison"
        options={javaMinorVersionOptions}
      />
      <Field
        name="config.properties.javaContainer"
        dirty={isJavaContainerDirty()}
        component={Dropdown}
        fullpage
        required
        label={t('javaContainer')}
        disabled={disableAllControls}
        id="app-settings-java-container-runtime"
        options={frameworks}
      />
      {javaFrameworkVersionOptions.length > 0 && (
        <Field
          name="config.properties.javaContainerVersion"
          dirty={isJavaContainerVersionDirty()}
          component={Dropdown}
          fullpage
          required
          disabled={disableAllControls}
          label={t('javaContainerVersion')}
          id="app-settings-java-container-version"
          options={javaFrameworkVersionOptions}
        />
      )}
    </div>
  );
};
export default JavaStack;
