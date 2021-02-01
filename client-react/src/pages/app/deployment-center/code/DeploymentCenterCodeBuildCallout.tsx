import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultButton, Callout, ChoiceGroup, PrimaryButton } from 'office-ui-fabric-react';
import { BuildProvider, ScmType } from '../../../../models/site/config';
import { calloutStyle, calloutContent, calloutContentButton, additionalTextFieldControl } from '../DeploymentCenter.styles';
import { BuildChoiceGroupOption, DeploymentCenterCodeBuildCalloutProps } from '../DeploymentCenter.types';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterCodeBuildCallout: React.FC<DeploymentCenterCodeBuildCalloutProps> = props => {
  const {
    selectedBuildChoice,
    updateSelectedBuildChoiceOption,
    calloutOkButtonDisabled,
    toggleIsCalloutVisible,
    updateSelectedBuild,
    formProps,
  } = props;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);
  const siteStateContext = useContext(SiteStateContext);

  const isKuduDisabled = () => {
    return scenarioService.checkScenario(ScenarioIds.kuduBuildProvider, { site: siteStateContext.site }).status === 'disabled';
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
    },
  ];

  const getBuildOptions = () => {
    return formProps.values.sourceProvider === ScmType.GitHub
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
