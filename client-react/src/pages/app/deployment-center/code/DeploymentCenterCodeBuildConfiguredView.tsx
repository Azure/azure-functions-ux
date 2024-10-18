import React, { useEffect, useContext, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { RuntimeStackSetting } from '../DeploymentCenter.types';
import { getDefaultVersionDisplayName, getRuntimeStackDisplayName, getRuntimeStackSetting } from '../utility/DeploymentCenterUtility';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import { SiteStateContext } from '../../../../SiteState';
import { titleWithPaddingStyle } from '../DeploymentCenter.styles';

const DeploymentCenterCodeBuildConfiguredView: React.FC = () => {
  const { t } = useTranslation();
  const [defaultStack, setDefaultStack] = useState<string>(t('loading'));
  const [defaultVersion, setDefaultVersion] = useState<string | undefined>(t('loading'));

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const setDefaultValues = () => {
    const defaultStackAndVersionKeys: RuntimeStackSetting = getRuntimeStackSetting(
      siteStateContext.isLinuxApp,
      siteStateContext.isFunctionApp,
      siteStateContext.isKubeApp,
      siteStateContext.isWordPressApp,
      siteStateContext.isFlexConsumptionApp,
      deploymentCenterContext.siteConfig,
      deploymentCenterContext.configMetadata,
      deploymentCenterContext.applicationSettings,
      siteStateContext.site
    );

    setDefaultStack(getRuntimeStackDisplayName(defaultStackAndVersionKeys.runtimeStack));
    setDefaultVersion(getDefaultVersionDisplayName(defaultStackAndVersionKeys.runtimeVersion, siteStateContext.isLinuxApp));
  };

  useEffect(() => {
    setDefaultValues();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDefaultValues();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext, siteStateContext]);

  const showRuntimeAndVersion = () => {
    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmType.Vsts) {
      return (
        <>
          <ReactiveFormControl id="deployment-center-code-settings-runtime" label={t('deploymentCenterSettingsRuntimeLabel')}>
            <div>{defaultStack}</div>
          </ReactiveFormControl>
          {defaultVersion && (
            <ReactiveFormControl
              id="deployment-center-code-settings-runtime-version"
              label={t('deploymentCenterSettingsRuntimeVersionLabel')}>
              <div>{defaultVersion}</div>
            </ReactiveFormControl>
          )}
        </>
      );
    }
  };

  const getBuildProvider = () => {
    let buildProviderString = t('none');
    if (deploymentCenterContext.siteConfig) {
      if (deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction) {
        buildProviderString = t('deploymentCenterCodeSettingsBuildGitHubAction');
      } else if (deploymentCenterContext.siteConfig.properties.scmType === ScmType.Vsts) {
        buildProviderString = t('vstsBuildServerTitle');
      } else {
        buildProviderString = t('deploymentCenterCodeSettingsBuildKudu');
      }
    }

    return (
      <ReactiveFormControl id="deployment-center-code-settings-build" label={t('deploymentCenterSettingsBuildLabel')}>
        <div>{buildProviderString}</div>
      </ReactiveFormControl>
    );
  };

  return (
    <>
      <h3 className={titleWithPaddingStyle}>{t('deploymentCenterSettingsBuildTitle')}</h3>
      {getBuildProvider()}
      {showRuntimeAndVersion()}
    </>
  );
};

export default DeploymentCenterCodeBuildConfiguredView;
