import React from 'react';
import { Formik, FormikProps } from 'formik';
import { DeploymentCenterFormData, DeploymentCenterCodeFormProps } from '../DeploymentCenter.types';
import { KeyCodes } from 'office-ui-fabric-react';
import DeploymentCenterCommandBar from '../DeploymentCenterCommandBar';
import { commandBarSticky, pivotContent } from '../DeploymentCenter.styles';
import DeploymentCenterCodePivot from './DeploymentCenterCodePivot';

const DeploymentCenterCodeForm: React.FC<DeploymentCenterCodeFormProps> = props => {
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
    throw Error('not implemented');
  };

  const onSubmit = () => {
    throw Error('not implemented');
  };

  return (
    <Formik
      initialValues={props.formData}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={false}
      validateOnChange={true}
      validationSchema={props.formValidationSchema}>
      {(formProps: FormikProps<DeploymentCenterFormData>) => (
        <form onKeyDown={onKeyDown}>
          <div id="deployment-center-command-bar" className={commandBarSticky}>
            <DeploymentCenterCommandBar
              saveFunction={saveFunction}
              discardFunction={discardFunction}
              showPublishProfilePanel={props.showPublishProfilePanel}
              refreshFunction={refreshFunction}
            />
          </div>

          <div className={pivotContent}>
            <DeploymentCenterCodePivot {...props} formProps={formProps} />
          </div>
        </form>
      )}
    </Formik>
  );
};

export default DeploymentCenterCodeForm;
