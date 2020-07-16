import React, { useContext, useState } from 'react';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { useTranslation } from 'react-i18next';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { Link, Icon } from 'office-ui-fabric-react';
import { additionalTextFieldControl } from '../DeploymentCenter.styles';
import { PortalContext } from '../../../../PortalContext';

const DeploymentCenterCodeSourceKuduReadOnly: React.FC<{}> = () => {
  const { t } = useTranslation();
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const showRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(true);
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  const disconnect = async () => {
    const notificationId = portalContext.startNotification(t('disconnectingDeployment'), t('disconnectingDeployment'));

    const updatePathSiteConfigResponse = await deploymentCenterData.updatePathSiteConfig(deploymentCenterContext.resourceId, {
      properties: {
        scmType: 'None',
      },
    });

    let disconnectSuccess = updatePathSiteConfigResponse.metadata.success;

    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType !== ScmType.LocalGit) {
      const deleteSourceControlDetailsResponse = await deploymentCenterData.deleteSourceControlDetails(deploymentCenterContext.resourceId);
      disconnectSuccess = disconnectSuccess && deleteSourceControlDetailsResponse.metadata.success;
    }
    if (disconnectSuccess) {
      portalContext.stopNotification(notificationId, true, t('disconnectingDeploymentSuccess'));
    } else {
      portalContext.stopNotification(notificationId, false, t('disconnectingDeploymentFail'));
    }
  };

  const getSourceLocation = () => {
    const scmType = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType;
    switch (scmType) {
      case ScmType.BitbucketGit:
      case ScmType.BitbucketHg:
        return 'Bitbucket';
      case ScmType.ExternalGit:
        return 'External Git';
      case ScmType.GitHub:
        return 'GitHub';
      case ScmType.LocalGit:
        return 'Local Git';
      case ScmType.Dropbox:
        return 'Dropbox';
      case ScmType.OneDrive:
        return 'OneDrive';
      case ScmType.Vso:
        return 'Azure Repos';
      default:
        return '';
    }
  };

  return (
    <ReactiveFormControl id="deployment-center-github-user" label={t('deploymentCenterSettingsSourceLabel')}>
      <div>
        {getSourceLocation()}
        <Link
          key="deployment-center-disconnect-link"
          onClick={showRefreshConfirmDialog}
          className={additionalTextFieldControl}
          aria-label={t('disconnect')}>
          <Icon iconName={'PlugDisconnected'} />
          {` ${t('disconnect')}`}
        </Link>
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: disconnect,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideRefreshConfirmDialog,
          }}
          title={t('kuduDisconnectConfirmationTitle')}
          content={t('disconnectConfirm')}
          hidden={!isRefreshConfirmDialogVisible}
          onDismiss={hideRefreshConfirmDialog}
        />
      </div>
    </ReactiveFormControl>
  );
};

export default DeploymentCenterCodeSourceKuduReadOnly;
