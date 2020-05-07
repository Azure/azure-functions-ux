import React from 'react';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOption } from 'office-ui-fabric-react';
import { Field } from 'formik';
import RadioButton from '../../../components/form-controls/RadioButton';
import { ScmTypes } from '../../../models/site/config';

const DeploymentCenterContainerSource: React.FC<{}> = props => {
  const { t } = useTranslation();

  const options: IChoiceGroupOption[] = [
    {
      key: ScmTypes.None,
      text: `${t('deploymentCenterContainerSettingsSourceOptionContainerRegistry')}: ${t(
        'deploymentCenterContainerSettingsSourceOptionContainerRegistryDescription'
      )}`,
    },
    {
      key: ScmTypes.GitHubAction,
      text: `${t('deploymentCenterContainerSettingsSourceOptionGitHubActions')}: ${t(
        'deploymentCenterContainerSettingsSourceOptionGitHubActionsDescription'
      )}`,
    },
  ];

  return (
    <>
      <p>{t('deploymentCenterContainerSettingsDescription')}</p>

      <Field
        id="deployment-center-container-settings-source-option"
        label={t('deploymentCenterContainerSettingsSourceLabel')}
        name="scmType"
        component={RadioButton}
        displayInVerticalLayout={true}
        options={options}
        required={true}
      />
    </>
  );
};

export default DeploymentCenterContainerSource;
