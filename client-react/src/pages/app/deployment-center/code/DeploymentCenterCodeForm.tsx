import React, { useState, useContext } from 'react';
import { Formik, FormikProps } from 'formik';
import { DeploymentCenterFormData, DeploymentCenterCodeFormProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import { KeyCodes } from 'office-ui-fabric-react';
import { commandBarSticky, pivotContent } from '../DeploymentCenter.styles';
import DeploymentCenterCodePivot from './DeploymentCenterCodePivot';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import DeploymentCenterCodeCommandBar from './DeploymentCenterCodeCommandBar';
import { SiteStateContext } from '../../../../SiteState';
import { PortalContext } from '../../../../PortalContext';
import SiteService from '../../../../ApiHelpers/SiteService';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterCodeForm: React.FC<DeploymentCenterCodeFormProps> = props => {
  const { t } = useTranslation();
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);
  const [isSyncConfirmDialogVisible, setIsSyncConfirmDialogVisible] = useState(false);

  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  const refreshFunction = () => {
    hideRefreshConfirmDialog();
    props.refresh();
  };

  const onSubmit = () => {
    throw Error('not implemented');
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  const syncFunction = async () => {
    hideSyncConfirmDialog();
    const siteName = siteStateContext && siteStateContext.site ? siteStateContext.site.name : '';
    const notificationId = portalContext.startNotification(
      t('deploymentCenterCodeSyncRequestSubmitted'),
      t('deploymentCenterCodeSyncRequestSubmittedDesc').format(siteName)
    );
    const syncResponse = await SiteService.syncSourceControls(deploymentCenterContext.resourceId);
    if (syncResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('deploymentCenterCodeSyncSuccess').format(siteName));
    } else {
      const errorMessage = getErrorMessage(syncResponse.metadata.error);
      errorMessage
        ? portalContext.stopNotification(notificationId, false, t('deploymentCenterCodeSyncFailWithStatusMessage').format(errorMessage))
        : portalContext.stopNotification(notificationId, false, t('deploymentCenterCodeSyncFail'));
    }
  };

  const hideSyncConfirmDialog = () => {
    setIsSyncConfirmDialogVisible(false);
  };

  return (
    <Formik
      initialValues={props.formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={false}
      validateOnChange={true}
      validationSchema={props.formValidationSchema}>
      {(formProps: FormikProps<DeploymentCenterFormData<DeploymentCenterCodeFormData>>) => (
        <form onKeyDown={onKeyDown}>
          <div id="deployment-center-command-bar" className={commandBarSticky}>
            <DeploymentCenterCodeCommandBar
              isLoading={props.isLoading}
              refresh={() => setIsRefreshConfirmDialogVisible(true)}
              sync={() => setIsSyncConfirmDialogVisible(true)}
              formProps={formProps}
            />
          </div>
          <>
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: refreshFunction,
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideRefreshConfirmDialog,
              }}
              title={t('staticSite_refreshConfirmTitle')}
              content={t('staticSite_refreshConfirmMessage')}
              hidden={!isRefreshConfirmDialogVisible}
              onDismiss={hideRefreshConfirmDialog}
            />
            <ConfirmDialog
              primaryActionButton={{
                title: t('ok'),
                onClick: syncFunction,
              }}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideSyncConfirmDialog,
              }}
              title={t('staticSite_syncConfirmTitle')}
              content={t('staticSite_syncConfirmMessage')}
              hidden={!isSyncConfirmDialogVisible}
              onDismiss={hideSyncConfirmDialog}
            />
          </>
          <div className={pivotContent}>
            <DeploymentCenterCodePivot {...props} formProps={formProps} />
          </div>
        </form>
      )}
    </Formik>
  );
};

export default DeploymentCenterCodeForm;
