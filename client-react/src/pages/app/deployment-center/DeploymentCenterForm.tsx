import React from 'react';
import { Formik, FormikProps } from 'formik';
import { DeploymentCenterFormProps, DeploymentCenterFormValues } from './DeploymentCenter.types';
import { KeyCodes } from 'office-ui-fabric-react';
import DeploymentCenter from './DeploymentCenter';

const DeploymentCenterForm: React.FC<DeploymentCenterFormProps> = props => {
  const { resourceId, initialValues, onSubmit, refreshSettings } = props;

  const onKeyDown = keyEvent => {
    if ((keyEvent.charCode || keyEvent.keyCode) === KeyCodes.enter) {
      keyEvent.preventDefault();
    }
  };

  const saveFunction = () => {
    throw Error('not implemented');
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize={true} validateOnBlur={false} validateOnChange={false}>
      {(formProps: FormikProps<DeploymentCenterFormValues>) => (
        <form onKeyDown={onKeyDown}>
          <DeploymentCenter resourceId={resourceId} formValues={formProps} saveFunction={saveFunction} refreshFunction={refreshSettings} />
        </form>
      )}
    </Formik>
  );
};

export default DeploymentCenterForm;
