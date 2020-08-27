import React, { useState } from 'react';
import { Field } from 'formik';
import { IChoiceGroupOption, ActionButton } from 'office-ui-fabric-react';
import TextField from '../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { PasswordFieldType, PrivateRepoOptions } from '../../../../models/external';

const DeploymentCenterExternalProvider: React.FC<{}> = props => {
  const { t } = useTranslation();

  const [selectedRepoPrivate, setSelectedRepoPrivate] = useState<string>(PrivateRepoOptions.No);
  const [providerPasswordType, setProviderPasswordType] = useState<PasswordFieldType>('password');

  const toggleShowProviderPassword = () => {
    setProviderPasswordType(!providerPasswordType ? 'password' : undefined);
  };

  return (
    <>
      <h3>{t('deploymentCenterCodeExternalTitle')}</h3>

      <Field
        id="deployment-center-settings-repository-option"
        label={t('deploymentCenterOAuthRepository')}
        name="repo"
        component={TextField}
        widthOverride="60%"
      />

      <Field
        id="deployment-center-settings-branch-option"
        label={t('deploymentCenterOAuthBranch')}
        name="branch"
        component={TextField}
        widthOverride="60%"
      />

      <Field
        id="deployment-center-settings-external-private-repo"
        label={t('deploymentCenterCodeExternalPrivateRepositoryLabel')}
        selectedKey={selectedRepoPrivate}
        component={RadioButton}
        options={[
          {
            key: PrivateRepoOptions.No,
            text: t('deploymentCenterCodeExternalPrivateRepositoryNoOption'),
          },
          {
            key: PrivateRepoOptions.Yes,
            text: t('deploymentCenterCodeExternalPrivateRepositoryYesOption'),
          },
        ]}
        onChange={(event: React.FormEvent<HTMLDivElement>, option: IChoiceGroupOption) => {
          setSelectedRepoPrivate(option.key);
        }}
      />

      {selectedRepoPrivate === PrivateRepoOptions.Yes && (
        <Field
          id="deployment-center-external-provider-username"
          label={t('deploymentCenterCodeExternalUsernameLabel')}
          name="externalUsername"
          component={TextField}
          widthOverride="60%"
        />
      )}

      {selectedRepoPrivate === PrivateRepoOptions.Yes && (
        <Field
          id="deployment-center-external-provider-password"
          label={t('deploymentCenterCodeExternalPasswordLabel')}
          name="externalPassword"
          component={TextField}
          widthOverride="60%"
          type={providerPasswordType}
          additionalControls={[
            <ActionButton
              id="deployment-center-external-provider-password-visibility-toggle"
              key="deployment-center-external-provider-password-visibility-toggle"
              className={additionalTextFieldControl}
              ariaLabel={providerPasswordType === 'password' ? t('showProviderPasswordAriaLabel') : t('hideProviderPasswordAriaLabel')}
              onClick={toggleShowProviderPassword}
              iconProps={{ iconName: providerPasswordType === 'password' ? 'RedEye' : 'Hide' }}>
              {providerPasswordType === 'password' ? t('show') : t('hide')}
            </ActionButton>,
          ]}
        />
      )}
    </>
  );
};

export default DeploymentCenterExternalProvider;
