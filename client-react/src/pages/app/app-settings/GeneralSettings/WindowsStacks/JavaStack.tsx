import { Field, FormikProps } from 'formik';
import { Dropdown as OfficeDropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useState, useEffect } from 'react';
import { InjectedTranslateProps } from 'react-i18next';
import { connect } from 'react-redux';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { RootState } from '../../../../../modules/types';
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
import requiredValidation from '../../../../../utils/formValidation/required';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
  stacksLoading: boolean;
}

type Props = StateProps & FormikProps<AppSettingsFormValues> & InjectedTranslateProps;

const JavaStack: React.SFC<Props> = props => {
  const [currentJavaMajorVersion, setCurrentJavaMajorVersion] = useState('');
  const [initialized, setInitialized] = useState(false);
  const { stacks, values, t } = props;
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
  const javaMinorVersionOptions = getJavaMinorVersionOptions(currentJavaMajorVersion, javaStack, t('newest'));

  // container versions
  const frameworks = getJavaContainersOptions(javaContainers);
  let javaFrameworkVersionOptions = getFrameworkVersionOptions(javaContainers, values.config, t('latestMinorVersion'));
  const onMajorVersionChange = (e: unknown, option: IDropdownOption) => {
    setCurrentJavaMajorVersion(option.key as string);
  };
  return (
    <div>
      <OfficeDropdown
        label={t('javaVersionLabel')}
        selectedKey={currentJavaMajorVersion}
        id="app-settings-java-major-verison"
        disabled={!values.siteWritePermission}
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
        validate={value => requiredValidation(value, t('required'))}
        disabled={!values.siteWritePermission}
        label={t('javaMinorVersion')}
        id="app-settings-java-minor-verison"
        options={javaMinorVersionOptions}
      />
      <Field
        name="config.properties.javaContainer"
        component={Dropdown}
        fullpage
        required
        validate={value => requiredValidation(value, t('required'))}
        label={t('javaContainer')}
        disabled={!values.siteWritePermission}
        id="app-settings-java-container-runtime"
        options={frameworks}
      />
      {javaFrameworkVersionOptions.length > 0 && (
        <Field
          name="config.properties.javaContainerVersion"
          component={Dropdown}
          fullpage
          required
          validate={value => requiredValidation(value, t('required'))}
          disabled={!values.siteWritePermission}
          label={t('javaContainerVersion')}
          id="app-settings-java-container-version"
          options={javaFrameworkVersionOptions}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState, ownProps: FormikProps<AppSettingsFormValues>) => {
  return {
    stacks: state.stacks.data.value,
    stacksLoading: state.stacks.metadata.loading,
    config: state.webConfig.data,
    configLoading: state.webConfig.metadata.loading,
  };
};
export default connect(
  mapStateToProps,
  null
)(JavaStack);
