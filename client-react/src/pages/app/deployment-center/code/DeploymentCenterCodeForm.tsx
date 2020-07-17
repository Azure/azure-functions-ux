import React, { useState } from 'react';
import { Formik, FormikProps } from 'formik';
import { DeploymentCenterFormData, DeploymentCenterCodeFormProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import { KeyCodes } from 'office-ui-fabric-react';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { commandBarSticky, pivotContent } from '../DeploymentCenter.styles';
import DeploymentCenterCodePivot from './DeploymentCenterCodePivot';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';

const DeploymentCenterCodeForm: React.FC<DeploymentCenterCodeFormProps<DeploymentCenterCodeFormData>> = props => {
  const { t } = useTranslation();
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  const saveFunction = () => {
    throw Error('not implemented');
  };

  const discardFunction = () => {
    throw Error('not implemented');
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
            <DeploymentCenterCommandBar
              saveFunction={saveFunction}
              discardFunction={discardFunction}
              showPublishProfilePanel={props.showPublishProfilePanel}
              refresh={() => setIsRefreshConfirmDialogVisible(true)}
              isLoading={props.isLoading}
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
