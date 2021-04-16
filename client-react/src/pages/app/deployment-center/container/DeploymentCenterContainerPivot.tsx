import React, { useContext } from 'react';
import { Pivot, PivotItem, IPivotItemProps, MessageBar, MessageBarType, Link } from 'office-ui-fabric-react';
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
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { ArmPlanDescriptor } from '../../../../utils/resourceDescriptors';
import { messageBannerClass } from '../../../../components/CustomBanner/CustomBanner.styles';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerPivotProps> = props => {
  const { logs, formProps, isDataRefreshing, isLogsDataRefreshing, refresh, isCalledFromContainerSettings } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const isSettingsDirty = (): boolean => {
    return (
      (isContainerGeneralSettingsDirty() ||
        (formProps.values.registrySource === ContainerRegistrySources.privateRegistry && isPrivateRegistrySettingsDirty()) ||
        (formProps.values.registrySource === ContainerRegistrySources.docker && isDockerSettingsDirty()) ||
        (formProps.values.registrySource === ContainerRegistrySources.acr && isAcrSettingsDirty())) &&
      !!deploymentCenterContext.siteConfig &&
      deploymentCenterContext.siteConfig.properties.scmType === ScmType.None
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
    const formPropsExist =
      (!!formProps.values.publishingUsername || formProps.values.publishingUsername === '') &&
      (!!formProps.values.publishingPassword || formProps.values.publishingPassword === '') &&
      (!!formProps.values.publishingConfirmPassword || formProps.values.publishingConfirmPassword === '');

    return (
      !!currentUser &&
      formPropsExist &&
      (currentUser.properties.publishingUserName !== formProps.values.publishingUsername ||
        (!!formProps.values.publishingPassword && currentUser.properties.publishingPassword !== formProps.values.publishingPassword))
    );
  };

  const openContainerSettingsBlade = () => {
    const serverFarmId = siteStateContext.site && siteStateContext.site.properties ? siteStateContext.site.properties.serverFarmId : '';
    const subscriptionId = serverFarmId ? new ArmPlanDescriptor(serverFarmId).subscription : '';

    portalContext.openBlade(
      {
        detailBlade: 'ContainerSettingsFrameBlade',
        detailBladeInputs: {
          id: deploymentCenterContext.resourceId,
          data: {
            resourceId: deploymentCenterContext.resourceId,
            isFunctionApp: siteStateContext.isFunctionApp,
            subscriptionId: subscriptionId,
            location: siteStateContext.site ? siteStateContext.site.location : '',
            os: siteStateContext.isLinuxApp ? 'linux' : 'windows',
            fromMenu: true,
            containerFormData: null,
          },
        },
        extension: 'WebsitesExtension',
      },
      'containerSettings'
    );
  };

  return (
    <>
      {isCalledFromContainerSettings && (
        <MessageBar messageBarType={MessageBarType.info} isMultiline={false} className={messageBannerClass(theme, MessageBarType.info)}>
          {t('deploymentCenterContainerSettingsBannerMessage')}
          <Link onClick={openContainerSettingsBlade}>{t('here.')}</Link>
        </MessageBar>
      )}
      <Pivot>
        <PivotItem
          headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
          ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, isSettingsDirty, t('modifiedTag'))
          }>
          <DeploymentCenterContainerSettings formProps={formProps} isDataRefreshing={isDataRefreshing} />
        </PivotItem>

        <PivotItem headerText={t('deploymentCenterPivotItemLogsHeaderText')} ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
          <DeploymentCenterContainerLogs logs={logs} isLogsDataRefreshing={isLogsDataRefreshing} refresh={refresh} />
        </PivotItem>

        <PivotItem
          headerText={t('deploymentCenterPivotItemFtpsHeaderText')}
          ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, isFtpsDirty, t('modifiedTag'))
          }>
          <DeploymentCenterFtps formProps={formProps} isDataRefreshing={isDataRefreshing} />
        </PivotItem>
      </Pivot>
    </>
  );
};

export default DeploymentCenterContainerPivot;
