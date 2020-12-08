import React, { useState, useEffect } from 'react';
import { Field } from 'formik';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { RepoTypeOptions } from '../../../../models/external';
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';

const DeploymentCenterExternalProvider: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [repoType, setRepoType] = useState<RepoTypeOptions>(RepoTypeOptions.Public);

  useEffect(() => {
    if (formProps) {
      setRepoType(formProps.values.externalRepoType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps && formProps.values.externalRepoType]);

  return (
    <>
      <h3>{t('deploymentCenterCodeExternalGitTitle')}</h3>

      <Field
        id="deployment-center-settings-repository-option"
        label={t('deploymentCenterOAuthRepository')}
        name="repo"
        component={TextField}
        required={true}
        placeholder={t('deploymentCenterCodeExternalRepositoryPlaceholder')}
      />

      <Field
        id="deployment-center-settings-branch-option"
        label={t('deploymentCenterOAuthBranch')}
        name="branch"
        component={TextField}
        required={true}
        placeholder={t('deploymentCenterCodeExternalBranchPlaceholder')}
      />

      <Field
        id="deployment-center-settings-external-private-repo"
        label={t('deploymentCenterCodeExternalRepositoryTypeLabel')}
        name="externalRepoType"
        component={RadioButton}
        options={[
          {
            key: RepoTypeOptions.Public,
            text: t('deploymentCenterCodeExternalPublicRepositoryOption'),
          },
          {
            key: RepoTypeOptions.Private,
            text: t('deploymentCenterCodeExternalPrivateRepositoryOption'),
          },
        ]}
      />

      {repoType === RepoTypeOptions.Private && (
        <>
          <Field
            id="deployment-center-external-provider-username"
            label={t('deploymentCenterCodeExternalUsernameLabel')}
            name="externalUsername"
            required={true}
            component={TextField}
          />

          <Field
            id="deployment-center-external-provider-password"
            label={t('deploymentCenterCodeExternalPasswordLabel')}
            name="externalPassword"
            component={TextField}
            required={true}
            type="password"
          />
        </>
      )}
    </>
  );
};

export default DeploymentCenterExternalProvider;
