import React, { useContext } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react';
import DeploymentCenterContainerSettings from './DeploymentCenterContainerSettings';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContainerPivotProps, ContainerRegistrySources } from '../DeploymentCenter.types';
import DeploymentCenterContainerLogs from './DeploymentCenterContainerLogs';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { ThemeContext } from '../../../../ThemeContext';
import CustomTabRenderer from '../../app-settings/Sections/CustomTabRenderer';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerPivotProps> = props => {
  const { logs, formProps, isLoading } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const theme = useContext(ThemeContext);

  const isSettingsDirty = (): boolean => {
    return (
      (isContainerGeneralSettingsDirty() ||
        (formProps.values.registrySource === ContainerRegistrySources.privateRegistry && isPrivateRegistrySettingsDirty()) ||
        (formProps.values.registrySource === ContainerRegistrySources.docker && isDockerSettingsDirty()) ||
        (formProps.values.registrySource === ContainerRegistrySources.acr && isAcrSettingsDirty())) &&
      (!!deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None)
    );
  };

  const isPrivateRegistrySettingsDirty = (): boolean => {
    return (
      formProps.values.privateRegistryServerUrl !== formProps.initialValues.privateRegistryServerUrl ||
      formProps.values.privateRegistryUsername !== formProps.initialValues.privateRegistryUsername ||
      formProps.values.privateRegistryPassword !== formProps.initialValues.privateRegistryPassword ||
      formProps.values.privateRegistryImageAndTag !== formProps.initialValues.privateRegistryImageAndTag ||
      formProps.values.privateRegistryComposeYml !== formProps.initialValues.privateRegistryComposeYml
    );
  };

  const isDockerSettingsDirty = (): boolean => {
    return (
      formProps.values.dockerHubAccessType !== formProps.initialValues.dockerHubAccessType ||
      formProps.values.dockerHubImageAndTag !== formProps.initialValues.dockerHubImageAndTag ||
      formProps.values.dockerHubComposeYml !== formProps.initialValues.dockerHubComposeYml
    );
  };

  const isAcrSettingsDirty = (): boolean => {
    return (
      formProps.values.acrLoginServer !== formProps.initialValues.acrLoginServer ||
      formProps.values.acrImage !== formProps.initialValues.acrImage ||
      formProps.values.acrTag !== formProps.initialValues.acrTag ||
      formProps.values.acrComposeYml !== formProps.initialValues.acrComposeYml
    );
  };

  const isContainerGeneralSettingsDirty = (): boolean => {
    return (
      formProps.values.scmType !== formProps.initialValues.scmType ||
      formProps.values.option !== formProps.initialValues.option ||
      formProps.values.registrySource !== formProps.initialValues.registrySource ||
      formProps.values.continuousDeploymentOption !== formProps.initialValues.continuousDeploymentOption ||
      formProps.values.command !== formProps.initialValues.command
    );
  };

  const isFtpsDirty = (): boolean => {
    const currentUser = deploymentCenterPublishingContext.publishingUser;

    return (
      !!currentUser &&
      (currentUser.properties.publishingUserName !== formProps.values.publishingUsername ||
        (!!formProps.values.publishingPassword && currentUser.properties.publishingPassword !== formProps.values.publishingPassword))
    );
  };

  return (
    <Pivot>
      <PivotItem headerText={t('deploymentCenterPivotItemLogsHeaderText')} ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
        <DeploymentCenterContainerLogs logs={logs} isLoading={isLoading} />
      </PivotItem>

      <PivotItem
        headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isSettingsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterContainerSettings formProps={formProps} />
      </PivotItem>

      <PivotItem
        headerText={t('deploymentCenterPivotItemFtpsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isFtpsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterFtps formProps={formProps} isLoading={isLoading} />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterContainerPivot;
