import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon, Link } from '@fluentui/react';

import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { ScmType } from '../../../../models/site/config';
import { PortalContext } from '../../../../PortalContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { disconnectLink } from '../DeploymentCenter.styles';
import { DeploymentCenterCodeFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

const DeploymentCenterCodeSourceKuduConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

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
    setIsDisconnecting(true);
    const notificationId = portalContext.startNotification(t('disconnectingDeployment'), t('disconnectingDeployment'));
    portalContext.log(
      getTelemetryInfo('info', 'disconnectSourceControl', 'submit', {
        publishType: 'code',
      })
    );

    if (!!deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit) {
      setScmTypeThroughSiteConfig(notificationId);
    } else {
      deleteSourceControls(notificationId);
    }
  };

  const setScmTypeThroughSiteConfig = async (notificationId: string) => {
    const updatePathSiteConfigResponse = await deploymentCenterData.patchSiteConfig(deploymentCenterContext.resourceId, {
      properties: {
        scmType: ScmType.None,
      },
    });

    if (updatePathSiteConfigResponse.metadata.success) {
      formProps.resetForm();
      portalContext.stopNotification(notificationId, true, t('disconnectingDeploymentSuccess'));
      await deploymentCenterContext.refresh();
    } else {
      const errorMessage = getErrorMessage(updatePathSiteConfigResponse.metadata.error);
      const message = errorMessage ? t('disconnectingDeploymentFailWithMessage').format(errorMessage) : t('disconnectingDeploymentFail');

      portalContext.stopNotification(notificationId, false, message);
      portalContext.log(
        getTelemetryInfo('error', 'updatePathSiteConfigResponse', 'failed', {
          message: errorMessage,
          errorAsString: JSON.stringify(updatePathSiteConfigResponse.metadata.error),
        })
      );
    }
  };

  const deleteSourceControls = async (notificationId: string) => {
    portalContext.log(
      getTelemetryInfo('info', 'deleteSourceControls', 'submit', {
        publishType: 'code',
      })
    );
    const deleteSourceControlDetailsResponse = await deploymentCenterData.deleteSourceControlDetails(deploymentCenterContext.resourceId);

    if (deleteSourceControlDetailsResponse.metadata.success) {
      formProps.resetForm();
      portalContext.stopNotification(notificationId, true, t('disconnectingDeploymentSuccess'));
      await deploymentCenterContext.refresh();
    } else {
      const errorMessage = getErrorMessage(deleteSourceControlDetailsResponse.metadata.error);
      const message = errorMessage ? t('disconnectingDeploymentFailWithMessage').format(errorMessage) : t('disconnectingDeploymentFail');

      portalContext.stopNotification(notificationId, false, message);
      portalContext.log(
        getTelemetryInfo('error', 'deleteSourceControlDetailsResponse', 'failed', {
          message: errorMessage,
          errorAsString: JSON.stringify(deleteSourceControlDetailsResponse.metadata.error),
        })
      );
    }
  };

  const getSourceLocation = () => {
    const scmType = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType;
    switch (scmType) {
      case ScmType.BitbucketGit:
      case ScmType.BitbucketHg:
        return t('deploymentCenterCodeSettingsSourceBitbucket');
      case ScmType.ExternalGit:
        return t('deploymentCenterCodeSettingsSourceExternalGit');
      case ScmType.GitHub:
        return t('deploymentCenterCodeSettingsSourceGitHub');
      case ScmType.LocalGit:
        return t('deploymentCenterCodeSettingsSourceLocalGit');
      case ScmType.Dropbox:
        return t('deploymentCenterCodeSettingsSourceDropbox');
      case ScmType.OneDrive:
        return t('deploymentCenterCodeSettingsSourceOneDrive');
      case ScmType.Vso:
        return t('deploymentCenterCodeSettingsSourceAzureRepos');
      default:
        return '';
    }
  };

  return (
    <ReactiveFormControl id="deployment-center-source-label" label={t('deploymentCenterSettingsSourceLabel')}>
      <div>
        {getSourceLocation()}
        <Link
          key="deployment-center-disconnect-link"
          onClick={showRefreshConfirmDialog}
          className={disconnectLink}
          aria-label={t('disconnect')}>
          <Icon iconName={'PlugDisconnected'} />
          {` ${t('disconnect')}`}
        </Link>
        <ConfirmDialog
          primaryActionButton={{
            title: isDisconnecting ? t('disconnecting') : t('ok'),
            onClick: disconnect,
            disabled: isDisconnecting,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideRefreshConfirmDialog,
          }}
          hideDefaultActionButton={isDisconnecting}
          title={t('kuduDisconnectConfirmationTitle')}
          content={t('disconnectConfirm')}
          hidden={!isRefreshConfirmDialogVisible}
          onDismiss={hideRefreshConfirmDialog}
        />
      </div>
    </ReactiveFormControl>
  );
};

export default DeploymentCenterCodeSourceKuduConfiguredView;
