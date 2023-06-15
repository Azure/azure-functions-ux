import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterContainerSettingsReadOnlyView: React.FC = () => {
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

    getImageAndTag();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.applicationSettings, deploymentCenterContext.siteConfig, siteStateContext]);

  const getImageAndTag = () => {
    if (siteStateContext && deploymentCenterContext && deploymentCenterContext.siteConfig) {
      const fxVersion = siteStateContext.isLinuxApp
        ? deploymentCenterContext.siteConfig.properties.linuxFxVersion
        : deploymentCenterContext.siteConfig.properties.windowsFxVersion;

      const fxVersionParts = fxVersion.split('|');
      const imageAndTagParts = fxVersionParts[1] ? fxVersionParts[1].split('/') : [];

      setImageAndTag(imageAndTagParts.length > 0 ? imageAndTagParts[imageAndTagParts.length - 1] : t('deploymentCenterImageAndTagError'));
    }
  };

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
