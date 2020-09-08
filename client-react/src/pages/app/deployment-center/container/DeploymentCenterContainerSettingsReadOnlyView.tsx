import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterContainerSettingsReadOnlyView: React.FC<{}> = props => {
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);
  const [serverUrl, setServerUrl] = useState<string>(t('loading'));
  const [username, setUsername] = useState<string>(t('loading'));
  const [imageAndTag, setImageAndTag] = useState<string>(t('loading'));

  useEffect(() => {
    if (deploymentCenterContext && deploymentCenterContext.applicationSettings) {
      const appSettings = deploymentCenterContext.applicationSettings.properties;
      setServerUrl(appSettings[DeploymentCenterConstants.serverUrlSetting]);
      setUsername(appSettings[DeploymentCenterConstants.usernameSetting]);
    }

    if (siteStateContext && deploymentCenterContext && deploymentCenterContext.siteConfig) {
      const fxVersion = siteStateContext.isLinuxApp
        ? deploymentCenterContext.siteConfig.properties.linuxFxVersion
        : deploymentCenterContext.siteConfig.properties.windowsFxVersion;

      const fxVersionParts = fxVersion.split('|');
      const imageAndTagParts = fxVersionParts[1] ? fxVersionParts[1].split('/') : [];

      setImageAndTag(imageAndTagParts.length > 1 ? imageAndTagParts[1] : imageAndTagParts[0]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.applicationSettings, deploymentCenterContext.siteConfig, siteStateContext]);

  return (
    <>
      <h3>{t('deploymentCenterContainerRegistrySettingsTitle')}</h3>

      <ReactiveFormControl id="deployment-center-container-settings-build" label={t('deploymentCenterSettingsBuildLabel')}>
        <div>{t('deploymentCenterCodeSettingsBuildGitHubAction')}</div>
      </ReactiveFormControl>

      <ReactiveFormControl id="deployment-center-container-settings-serverUrl" label={t('containerServerURL')}>
        <div>{serverUrl}</div>
      </ReactiveFormControl>

      <ReactiveFormControl id="deployment-center-container-settings-username" label={t('containerLogin')}>
        <div>{username}</div>
      </ReactiveFormControl>

      <ReactiveFormControl id="deployment-center-container-settings-imageAndTag" label={t('containerImageAndTag')}>
        <div>{imageAndTag}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterContainerSettingsReadOnlyView;
