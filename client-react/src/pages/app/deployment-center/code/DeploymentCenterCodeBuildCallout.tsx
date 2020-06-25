import React from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultButton, Callout, ChoiceGroup, PrimaryButton } from 'office-ui-fabric-react';
import { BuildProvider } from '../../../../models/site/config';
import { calloutStyle, calloutContent, calloutContentButton, additionalTextFieldControl } from '../DeploymentCenter.styles';
import { BuildChoiceGroupOption, DeploymentCenterCodeBuildCalloutProps } from '../DeploymentCenter.types';

const DeploymentCenterCodeBuildCallout: React.FC<DeploymentCenterCodeBuildCalloutProps> = props => {
  const {
    selectedBuildChoice,
    updateSelectedBuildChoiceOption,
    calloutOkButtonDisabled,
    toggleIsCalloutVisible,
    updateSelectedBuild,
  } = props;
  const { t } = useTranslation();

  const buildOptions: BuildChoiceGroupOption[] = [
    { key: BuildProvider.GitHubAction, text: t('deploymentCenterCodeSettingsBuildGitHubAction'), buildType: BuildProvider.GitHubAction },
    {
      key: BuildProvider.AppServiceBuildService,
      text: t('deploymentCenterCodeSettingsBuildKudu'),
      buildType: BuildProvider.AppServiceBuildService,
    },
  ];

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
        <ChoiceGroup selectedKey={selectedBuildChoice} options={buildOptions} onChange={updateSelectedBuildChoiceOption} required={true} />
        <PrimaryButton className={calloutContentButton} text={t('ok')} onClick={updateSelectedBuild} disabled={calloutOkButtonDisabled} />
        <DefaultButton className={calloutContentButton} text={t('cancel')} onClick={toggleIsCalloutVisible} />
      </div>
    </Callout>
  );
};

export default DeploymentCenterCodeBuildCallout;
