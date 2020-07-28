import { Field } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../../../../../components/form-controls/DropDown';
import {
  getJavaStack,
  getJavaContainers,
  getJavaMajorMinorVersion,
  getJavaContainersOptions,
  getFrameworkVersionOptions,
  getJavaMinorVersionObject,
  getJavaMinorVersionAsDropdownOptions,
  getJavaMajorVersionAsDropdownOptions,
} from './JavaData';
import { useTranslation } from 'react-i18next';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import { StackProps } from './WindowsStacks';

const JavaStack: React.SFC<StackProps> = props => {
  const [currentJavaMajorVersion, setCurrentJavaMajorVersion] = useState('');
  const { values, initialValues } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;

  const stacks = useContext(WebAppStacksContext);

  const javaStack = getJavaStack(stacks);
  const javaContainers = getJavaContainers(stacks);

  useEffect(() => {
    if (javaStack && javaContainers) {
      setCurrentJavaMajorVersion(getJavaMajorMinorVersion(javaStack, values.config).majorVersion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!javaStack || !javaContainers) {
    return null;
  }

  const getInitialJavaMinorVersion = () => {
    const initialJavaVersion = getJavaMajorMinorVersion(javaStack, initialValues.config);
    if (!initialJavaVersion) {
      return '';
    }
    const initialJavaMinorVersionObject = getJavaMinorVersionObject(javaStack, initialJavaVersion);
    return initialJavaMinorVersionObject ? initialJavaMinorVersionObject.value : '';
  };

  const getSelectedJavaMinorVersion = () => {
    const currentJavaMajorVersion = getJavaMajorMinorVersion(javaStack, values.config);
    if (!currentJavaMajorVersion) {
      return '';
    }
    const currentJavaMinorVersionObject = getJavaMinorVersionObject(javaStack, currentJavaMajorVersion);
    return currentJavaMinorVersionObject ? currentJavaMinorVersionObject.value : '';
  };

  const isJavaMajorVersionDirty = () => {
    return (
      values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
      currentJavaMajorVersion !== getJavaMajorMinorVersion(javaStack, initialValues.config).majorVersion
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
  const javaMajorVersionOptions = getJavaMajorVersionAsDropdownOptions(javaStack);
  const javaMinorVersionOptions = getJavaMinorVersionAsDropdownOptions(currentJavaMajorVersion, javaStack, t);

  // container versions
  const frameworks = getJavaContainersOptions(javaContainers);
  const javaFrameworkVersionOptions = getFrameworkVersionOptions(javaContainers, values.config, t);
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
        label={t('javaWebServer')}
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
          label={t('javaWebServerVersion')}
          id="app-settings-java-container-version"
          options={javaFrameworkVersionOptions}
        />
      )}
    </div>
  );
};
export default JavaStack;
