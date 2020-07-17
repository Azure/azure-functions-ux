import React from 'react';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOption, Link } from 'office-ui-fabric-react';
import { Field } from 'formik';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { ScmType } from '../../../../models/site/config';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';

const DeploymentCenterContainerSource: React.FC<{}> = props => {
  const { t } = useTranslation();

  const options: IChoiceGroupOption[] = [
    {
      key: ScmType.None,
      text: `${t('deploymentCenterContainerSettingsSourceOptionContainerRegistry')}: ${t(
        'deploymentCenterContainerSettingsSourceOptionContainerRegistryDescription'
      )}`,
    },
    {
      key: ScmType.GitHubAction,
      text: `${t('deploymentCenterContainerSettingsSourceOptionGitHubActions')}: ${t(
        'deploymentCenterContainerSettingsSourceOptionGitHubActionsDescription'
      )}`,
    },
  ];

  return (
    <>
      <p>
        <span id="deployment-center-settings-message">{t('deploymentCenterContainerSettingsDescription')}</span>
        <Link
          id="deployment-center-settings-learnMore"
          href={DeploymentCenterLinks.containerContinuousDeploy}
          target="_blank"
          className={learnMoreLinkStyle}
          aria-labelledby="deployment-center-settings-message">
          {` ${t('learnMore')}`}
        </Link>
      </p>

      <Field
        id="deployment-center-container-settings-source-option"
        label={t('deploymentCenterSettingsSourceLabel')}
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
