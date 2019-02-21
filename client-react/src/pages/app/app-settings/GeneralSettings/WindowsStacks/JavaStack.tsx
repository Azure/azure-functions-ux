import { Field, FormikProps } from 'formik';
import { Dropdown as OfficeDropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useState, useEffect, useContext } from 'react';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AppSettingsFormValues } from '../../AppSettings.types';
import {
  getJavaStack,
  getJavaContainers,
  getJavaMajorVersion,
  getJavaVersionAsDropdownOptions,
  getJavaMinorVersionOptions,
  getJavaContainersOptions,
  getFrameworkVersionOptions,
} from './JavaData';
import { useTranslation } from 'react-i18next';
import { PermissionsContext } from '../../Contexts';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const JavaStack: React.SFC<Props> = props => {
  const [currentJavaMajorVersion, setCurrentJavaMajorVersion] = useState('');
  const [initialized, setInitialized] = useState(false);
  const { stacks, values } = props;
  const { t } = useTranslation();
  const { app_write, editable } = useContext(PermissionsContext);
  const javaStack = getJavaStack(stacks);
  const javaContainers = getJavaContainers(stacks);
  if (!javaStack || !javaContainers) {
    return null;
  }
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      setCurrentJavaMajorVersion(getJavaMajorVersion(javaStack.properties, values.config));
    }
  });

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
      <OfficeDropdown
        label={t('javaVersionLabel')}
        selectedKey={currentJavaMajorVersion}
        id="app-settings-java-major-verison"
        disabled={!app_write || !editable}
        options={javaMajorVersionOptions}
        onChange={onMajorVersionChange}
        styles={{
          label: [
            {
              display: 'inline-block',
            },
          ],
          dropdown: [
            {
              display: 'inline-block',
            },
          ],
        }}
      />
      <Field
        name="config.properties.javaVersion"
        component={Dropdown}
        fullpage
        required
        disabled={!app_write || !editable}
        label={t('javaMinorVersion')}
        id="app-settings-java-minor-verison"
        options={javaMinorVersionOptions}
      />
      <Field
        name="config.properties.javaContainer"
        component={Dropdown}
        fullpage
        required
        label={t('javaContainer')}
        disabled={!app_write || !editable}
        id="app-settings-java-container-runtime"
        options={frameworks}
      />
      {javaFrameworkVersionOptions.length > 0 && (
        <Field
          name="config.properties.javaContainerVersion"
          component={Dropdown}
          fullpage
          required
          disabled={!app_write || !editable}
          label={t('javaContainerVersion')}
          id="app-settings-java-container-version"
          options={javaFrameworkVersionOptions}
        />
      )}
    </div>
  );
};
export default JavaStack;
