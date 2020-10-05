import React, { useEffect, useContext, useState } from 'react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import {
  RuntimeStackSetting,
  RuntimeStackOptions,
  RuntimeStackDisplayNames,
  RuntimeVersionDisplayNames,
  RuntimeVersionOptions,
} from '../DeploymentCenter.types';
import { getRuntimeStackSetting } from '../utility/DeploymentCenterUtility';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import { SiteStateContext } from '../../../../SiteState';

const DeploymentCenterCodeBuildConfiguredView: React.FC<{}> = () => {
  const { t } = useTranslation();
  const [defaultStack, setDefaultStack] = useState<string>(t('loading'));
  const [defaultVersion, setDefaultVersion] = useState<string | undefined>(t('loading'));

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const siteStateContext = useContext(SiteStateContext);

  const setDefaultValues = () => {
    const defaultStackAndVersionKeys: RuntimeStackSetting =
      deploymentCenterContext.siteConfig && deploymentCenterContext.configMetadata && deploymentCenterContext.applicationSettings
        ? getRuntimeStackSetting(
            siteStateContext.isLinuxApp,
            deploymentCenterContext.siteConfig,
            deploymentCenterContext.configMetadata,
            deploymentCenterContext.applicationSettings
          )
        : { runtimeStack: '', runtimeVersion: '' };

    setDefaultStack(getRuntimeStackDisplayName(defaultStackAndVersionKeys.runtimeStack));
    setDefaultVersion(getDefaultVersionDisplayName(defaultStackAndVersionKeys.runtimeVersion));
  };

  const getDefaultVersionDisplayName = (version: string) => {
    return siteStateContext.isLinuxApp ? getLinuxDefaultVersionDisplayName(version) : getWindowsDefaultVersionDisplayName(version);
  };

  const getLinuxDefaultVersionDisplayName = (version: string) => {
    const versionNameParts: string[] = version.split('|');

    //NOTE(stpelleg): Java is different
    if (versionNameParts.length == 2 && versionNameParts[0].toLowerCase() === RuntimeVersionOptions.Tomcat) {
      const tomcatNameParts = versionNameParts[1].split('-');
      return tomcatNameParts.length === 2 ? `${RuntimeVersionDisplayNames.Tomcat} ${tomcatNameParts[0]}` : '';
    } else if (versionNameParts.length === 2 && versionNameParts[0].toLowerCase() === RuntimeVersionOptions.javaSE) {
      return RuntimeVersionDisplayNames.JavaSE;
    } else if (versionNameParts.length === 2 && versionNameParts[0].toLowerCase() === RuntimeVersionOptions.JBossEAP) {
      const jBossEAPNameParts = versionNameParts[1].split('-');
      return jBossEAPNameParts.length === 2 ? `${RuntimeVersionDisplayNames.JBossEAP} ${jBossEAPNameParts[0]}` : '';
    }

    return versionNameParts.length === 2
      ? `${getRuntimeStackDisplayName(versionNameParts[0])} ${versionNameParts[1].replace('-', ' ').toUpperCase()}`
      : '';
  };

  const getWindowsDefaultVersionDisplayName = (version: string) => {
    const versionNameParts = version.replace('-', ' ').split('|');

    //NOTE(stpelleg): Java is different
    if (versionNameParts.length === 3 && versionNameParts[2] === 'SE') {
      return RuntimeVersionDisplayNames.JavaSE;
    }

    return version.replace('-', ' ');
  };

  const getRuntimeStackDisplayName = (stack: string) => {
    stack = stack.toLowerCase();
    switch (stack) {
      case RuntimeStackOptions.Python:
        return RuntimeStackDisplayNames.Python;
      case RuntimeStackOptions.DotNetCore:
        return RuntimeStackDisplayNames.DotNetCore;
      case RuntimeStackOptions.Ruby:
        return RuntimeStackDisplayNames.Ruby;
      case RuntimeStackOptions.Java11:
        return RuntimeStackDisplayNames.Java11;
      case RuntimeStackOptions.Java8:
      case RuntimeStackOptions.JBossEAP:
        return RuntimeStackDisplayNames.Java8;
      case RuntimeStackOptions.Node:
        return RuntimeStackDisplayNames.Node;
      case RuntimeStackOptions.PHP:
        return RuntimeStackDisplayNames.PHP;
      case RuntimeStackOptions.AspDotNet:
        return RuntimeStackDisplayNames.AspDotNet;
      default:
        return '';
    }
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
      <h3>{t('deploymentCenterSettingsBuildTitle')}</h3>
      {getBuildProvider()}
      {showRuntimeAndVersion()}
    </>
  );
};

export default DeploymentCenterCodeBuildConfiguredView;
