import React, { useState, useContext, useEffect } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterCodePivotProps } from '../DeploymentCenter.types';
import DeploymentCenterCodeLogs from './DeploymentCenterCodeLogs';
import DeploymentCenterCodeSettings from './DeploymentCenterCodeSettings';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { ScmType, BuildProvider } from '../../../../models/site/config';
import CustomTabRenderer from '../../app-settings/Sections/CustomTabRenderer';
import { ThemeContext } from '../../../../ThemeContext';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterCodePivot: React.FC<DeploymentCenterCodePivotProps> = props => {
  const { formProps, deployments, deploymentsError, isLoading } = props;
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string>('logs');

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const isScmLocalGit = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit;

  const goToSettingsOnClick = () => {
    setSelectedKey('settings');
  };

  const onLinkClick = (item: PivotItem) => {
    if (item.props.itemKey) {
      setSelectedKey(item.props.itemKey);
    }
  };

  const isSettingsDirty = (): boolean => {
    return (
      formProps.values.buildProvider !== BuildProvider.None &&
      !!deploymentCenterContext.siteConfig &&
      deploymentCenterContext.siteConfig.properties.scmType === ScmType.None
    );
  };

  const isFtpsDirty = (): boolean => {
    const currentUser = deploymentCenterPublishingContext.publishingUser;
    return (
      !!currentUser &&
      ((currentUser.properties.publishingUserName && !formProps.values.publishingUsername) ||
        (!!formProps.values.publishingUsername && currentUser.properties.publishingUserName !== formProps.values.publishingUsername) ||
        (!!formProps.values.publishingPassword || !!formProps.values.publishingConfirmPassword))
    );
  };

  useEffect(() => {
    portalContext.updateDirtyState(isFtpsDirty() || isSettingsDirty());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.buildProvider,
    formProps.values.publishingUsername,
    formProps.values.publishingPassword,
    formProps.values.publishingConfirmPassword,
  ]);

  return (
    <Pivot selectedKey={selectedKey} onLinkClick={onLinkClick}>
      <PivotItem
        itemKey="logs"
        headerText={t('deploymentCenterPivotItemLogsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
        <DeploymentCenterCodeLogs
          goToSettings={goToSettingsOnClick}
          deployments={deployments}
          deploymentsError={deploymentsError}
          isLoading={isLoading}
        />
      </PivotItem>

      <PivotItem
        itemKey="settings"
        headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isSettingsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterCodeSettings formProps={formProps} />
      </PivotItem>

      <PivotItem
        itemKey="ftps"
        headerText={isScmLocalGit ? t('deploymentCenterPivotItemGitFtpsHeaderText') : t('deploymentCenterPivotItemFtpsHeaderText')}
        ariaLabel={isScmLocalGit ? t('deploymentCenterPivotItemGitFtpsAriaLabel') : t('deploymentCenterPivotItemFtpsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isFtpsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterFtps formProps={formProps} isLoading={isLoading} />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterCodePivot;
