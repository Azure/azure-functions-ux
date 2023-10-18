import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IChoiceGroupOption, Link, MessageBarType } from '@fluentui/react';
import { Field } from 'formik';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { ScmType } from '../../../../models/site/config';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteStateContext } from '../../../../SiteState';
import { ContainerRegistrySources, DeploymentCenterContainerFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { PortalContext } from '../../../../PortalContext';
import { DeploymentCenterPublishingContext } from '../authentication/DeploymentCenterPublishingContext';
import { deploymentCenterInfoBannerDiv } from '../DeploymentCenter.styles';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

const DeploymentCenterContainerSource: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const scenarioService = new ScenarioService(t);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const portalContext = useContext(PortalContext);

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
      disabled:
        deploymentCenterContext.isIlbASE ||
        scenarioService.checkScenario(ScenarioIds.githubSource, { site: siteStateContext.site }).status === 'disabled',
    },
    {
      key: ScmType.Vsts,
      text: `${t('deploymentCenterCodeSettingsBuildVsts')}: ${t('deploymentCenterVstsDocsMessage')}`,
    },
  ];

  const openConfigurationBlade = async () => {
    const result = await portalContext.openBlade({
      detailBlade: 'SiteConfigSettingsFrameBladeReact',
      extension: 'WebsitesExtension',
      detailBladeInputs: {
        id: deploymentCenterContext.resourceId,
      },
    });

    if (result) {
      deploymentCenterContext.refresh();
    }
  };

  const showBasicAuthError = useMemo(() => {
    const isGitHubActionsOrContainerOnly =
      formProps.values.scmType === ScmType.GitHubAction || formProps.values.registrySource === ContainerRegistrySources.acr;
    return isGitHubActionsOrContainerOnly && !deploymentCenterPublishingContext.basicPublishingCredentialsPolicies?.scm.allow;
  }, [
    formProps.values.scmType,
    formProps.values.registrySource,
    deploymentCenterPublishingContext.basicPublishingCredentialsPolicies?.scm.allow,
  ]);

  const showNoWritePermissionBanner = useMemo(() => {
    return !deploymentCenterContext.hasWritePermission;
  }, [deploymentCenterContext.hasWritePermission]);

  return (
    <>
      {showNoWritePermissionBanner && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            id="deployment-center-no-write-error"
            message={t('deploymentCenterNoWritePermissionsError')}
            type={MessageBarType.blocked}
          />
        </div>
      )}

      {showBasicAuthError && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            id="deployment-center-scm-basic-auth-warning"
            message={t('deploymentCenterScmBasicAuthErrorMessage')}
            type={MessageBarType.error}
            onClick={openConfigurationBlade}
          />
        </div>
      )}

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
