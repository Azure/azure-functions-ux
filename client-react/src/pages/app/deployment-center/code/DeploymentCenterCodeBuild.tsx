import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IDropdownOption } from 'office-ui-fabric-react';
import { BuildProvider, ScmTypes } from '../../../../models/site/config';
import { Field } from 'formik';
import Dropdown from '../../../../components/form-controls/DropDown';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';

const DeploymentCenterCodeBuild: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [selectedBuild, setSelectedBuild] = useState<BuildProvider>(BuildProvider.None);

  const isGitHubSource = formProps && formProps.values.sourceProvider === ScmTypes.GitHub;

  interface BuildDropdownOption extends IDropdownOption {
    buildType: BuildProvider;
  }

  const updateSelectedBuild = (e: any, option: BuildDropdownOption) => {
    setSelectedBuild(option.buildType);
    if (formProps) {
      formProps.setFieldValue('buildProvider', option.buildType);
    }
  };

  const buildOptions: BuildDropdownOption[] = [
    { key: BuildProvider.GitHubAction, text: t('deploymentCenterCodeSettingsBuildGitHubAction'), buildType: BuildProvider.GitHubAction },
    {
      key: BuildProvider.AppServiceBuildService,
      text: t('deploymentCenterCodeSettingsBuildKudu'),
      buildType: BuildProvider.AppServiceBuildService,
    },
  ];

  useEffect(
    () => {
      if (formProps && formProps.values.sourceProvider !== ScmTypes.GitHub) {
        setSelectedBuild(BuildProvider.AppServiceBuildService);
        formProps.setFieldValue('buildProvider', BuildProvider.AppServiceBuildService);
      }

      if (formProps && formProps.values.sourceProvider === ScmTypes.GitHub) {
        setSelectedBuild(BuildProvider.GitHubAction);
        formProps.setFieldValue('buildProvider', BuildProvider.GitHubAction);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    formProps ? [formProps.values.sourceProvider] : []
  );

  return (
    <>
      <h3>{t('deploymentCenterSettingsBuildTitle')}</h3>
      <Field
        id="deployment-center-container-settings-build-option"
        label={t('deploymentCenterSettingsBuildLabel')}
        name="buildProvider"
        component={Dropdown}
        displayInVerticalLayout={true}
        options={buildOptions}
        selectedKey={selectedBuild}
        onChange={updateSelectedBuild}
        required={true}
        disabled={!isGitHubSource}
      />
      {formProps && formProps.values.buildProvider === BuildProvider.GitHubAction && (
        <>
          <Field
            id="deployment-center-container-settings-runtime-option"
            label={t('deploymentCenterSettingsRuntimeLabel')}
            name="runtimeStack"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={[]}
            required={true}
          />
          <Field
            id="deployment-center-container-settings-runtime-version-option"
            label={t('deploymentCenterSettingsRuntimeVersionLabel')}
            name="runtimeVersion"
            component={Dropdown}
            displayInVerticalLayout={true}
            options={[]}
            required={true}
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterCodeBuild;
