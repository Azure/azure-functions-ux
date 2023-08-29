import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@fluentui/react/lib/Link';
import { Icon } from '@fluentui/react/lib/Icon';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { disconnectLink } from '../DeploymentCenter.styles';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterCodeFormData, DeploymentCenterContainerFormData, DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterVstsDisconnect: React.FC<DeploymentCenterFieldProps<
  DeploymentCenterCodeFormData | DeploymentCenterContainerFormData
>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();
  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = React.useContext(DeploymentCenterContext);
  const portalContext = React.useContext(PortalContext);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = React.useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState<boolean>();

  const showConfirmDialog = () => {
    setIsConfirmDialogVisible(true);
  };

  const hideConfirmDialog = () => {
    setIsConfirmDialogVisible(false);
  };

  const disconnect = async () => {
    setIsDisconnecting(true);
    const notificationId = portalContext.startNotification(t('disconnectingDeployment'), t('disconnectingDeployment'));
    portalContext.log(
      getTelemetryInfo('info', 'disconnectSourceControlForDevOps', 'submit', {
        publishType: 'code',
      })
    );
    const updateSiteConfigResponse = await deploymentCenterData.patchSiteConfig(deploymentCenterContext.resourceId, {
      properties: {
        scmType: ScmType.None,
      },
    });

    if (updateSiteConfigResponse.metadata.success) {
      formProps.resetForm();
      portalContext.stopNotification(notificationId, true, t('disconnectingDeploymentSuccess'));
      await deploymentCenterContext.refresh();
    } else {
      const errorMessage = getErrorMessage(updateSiteConfigResponse.metadata.error);
      const message = errorMessage ? t('disconnectingDeploymentFailWithMessage').format(errorMessage) : t('disconnectingDeploymentFail');

      portalContext.stopNotification(notificationId, false, message);
      portalContext.log(
        getTelemetryInfo('error', 'updateSiteConfigResponse', 'failed', {
          message: errorMessage,
          errorAsString: JSON.stringify(updateSiteConfigResponse.metadata.error),
        })
      );
    }
  };

  return (
    <ReactiveFormControl id="deployment-center-disconnect-label">
      <div>
        <Link key="deployment-center-disconnect-link" onClick={showConfirmDialog} className={disconnectLink} aria-label={t('disconnect')}>
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
            onClick: hideConfirmDialog,
          }}
          hideDefaultActionButton={isDisconnecting}
          title={t('vstsDisconnectConfirmationTitle')}
          content={t('vstsDisconnectConfirmationDescription')}
          hidden={!isConfirmDialogVisible}
          onDismiss={hideConfirmDialog}
        />
      </div>
    </ReactiveFormControl>
  );
};

export default DeploymentCenterVstsDisconnect;
