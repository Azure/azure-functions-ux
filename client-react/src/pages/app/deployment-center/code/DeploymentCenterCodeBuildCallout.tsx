import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Callout, ChoiceGroup, DefaultButton, PrimaryButton } from '@fluentui/react';

import { BuildProvider, ScmType } from '../../../../models/site/config';
import { SiteStateContext } from '../../../../SiteState';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { additionalTextFieldControl, calloutContent, calloutContentButton, calloutStyle } from '../DeploymentCenter.styles';
import { BuildChoiceGroupOption, DeploymentCenterCodeBuildCalloutProps, RuntimeStackOptions } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterCodeBuildCallout: React.FC<DeploymentCenterCodeBuildCalloutProps> = props => {
  const {
    selectedBuildChoice,
    updateSelectedBuildChoiceOption,
    calloutOkButtonDisabled,
    toggleIsCalloutVisible,
    updateSelectedBuild,
    formProps,
    runtimeStack,
    runtimeVersion,
  } = props;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const isGitHubActionEnabled =
    runtimeStack.toLocaleLowerCase() !== RuntimeStackOptions.Ruby &&
    !(runtimeStack.toLocaleLowerCase() == RuntimeStackOptions.PHP && !siteStateContext.isLinuxApp && !runtimeVersion) &&
    runtimeStack.toLocaleLowerCase() !== RuntimeStackOptions.Go &&
    !deploymentCenterContext.isIlbASE;

  const isKuduDisabled = () => {
    return scenarioService.checkScenario(ScenarioIds.kuduBuildProvider, { site: siteStateContext.site }).status === 'disabled';
  };

  const isAzurePipelinesDisabled = () => {
    return scenarioService.checkScenario(ScenarioIds.azurePipelinesBuildProvider, { site: siteStateContext.site }).status === 'disabled';
  };

  const permanentBuildOptions: BuildChoiceGroupOption[] = [
    {
      key: BuildProvider.AppServiceBuildService,
      text: t('deploymentCenterCodeSettingsBuildKudu'),
      buildType: BuildProvider.AppServiceBuildService,
      disabled: isKuduDisabled(),
    },
    {
      key: BuildProvider.Vsts,
      text: t('deploymentCenterCodeSettingsBuildVsts'),
      buildType: BuildProvider.Vsts,
      disabled: isAzurePipelinesDisabled(),
    },
  ];

  const getBuildOptions = () => {
    return formProps.values.sourceProvider === ScmType.GitHub && isGitHubActionEnabled
      ? [
          {
            key: BuildProvider.GitHubAction,
            text: t('deploymentCenterCodeSettingsBuildGitHubAction'),
            buildType: BuildProvider.GitHubAction,
          },
          ...permanentBuildOptions,
        ]
      : permanentBuildOptions;
  };

  return (
    <Callout
      className={calloutStyle}
      role="alertdialog"
      gapSpace={0}
      target={`.${additionalTextFieldControl}`}
      onDismiss={toggleIsCalloutVisible}
      setInitialFocus={true}>
      <div className={calloutContent}>
        <h3>{t('deploymentCenterSettingsBuildLabel')}</h3>
        <ChoiceGroup
          selectedKey={selectedBuildChoice}
          options={getBuildOptions()}
          onChange={updateSelectedBuildChoiceOption}
          required={true}
        />
        <PrimaryButton className={calloutContentButton} text={t('ok')} onClick={updateSelectedBuild} disabled={calloutOkButtonDisabled} />
        <DefaultButton className={calloutContentButton} text={t('cancel')} onClick={toggleIsCalloutVisible} />
      </div>
    </Callout>
  );
};

export default DeploymentCenterCodeBuildCallout;
