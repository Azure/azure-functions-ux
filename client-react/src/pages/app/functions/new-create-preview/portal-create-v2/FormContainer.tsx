import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';

import ActionBar from '../../../../../components/ActionBar';
import { ArmObj } from '../../../../../models/arm-obj';
import { HostStatus } from '../../../../../models/functions/host-status';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { formContainerDivStyle, formContainerStyle } from '../FunctionCreate.styles';

import TemplateList from './TemplateList';
import { useFormContainer } from './useFormContainer';

interface FormContainerProps {
  resourceId: string;
  hostStatus?: ArmObj<HostStatus>;
}

const FormContainer: React.FC<FormContainerProps> = ({ hostStatus, resourceId }: FormContainerProps) => {
  const { t } = useTranslation();

  const { initialValues, isCreatingFunction, onCancel, onSubmit, onTemplateSelect, selectedTemplate, statusMessage } = useFormContainer(
    resourceId
  );

  return (
    <Formik<BindingEditorFormValues> enableReinitialize initialValues={initialValues} isInitialValid onSubmit={onSubmit}>
      {formProps => (
        <form className={formContainerStyle}>
          <div className={formContainerDivStyle}>
            <TemplateList formProps={formProps} hostStatus={hostStatus} onTemplateSelect={onTemplateSelect} resourceId={resourceId} />
          </div>
          <ActionBar
            id="add-function-footer"
            fullPageHeight
            primaryButton={{
              id: 'add',
              disable: isCreatingFunction || !selectedTemplate,
              onClick: formProps.submitForm,
              title: t('create'),
            }}
            secondaryButton={{
              id: 'cancel',
              disable: isCreatingFunction,
              onClick: onCancel,
              title: t('cancel'),
            }}
            statusMessage={statusMessage}
            validating={isCreatingFunction}
            validationMessage={t('creatingFunction')}
          />
        </form>
      )}
    </Formik>
  );
};

export default FormContainer;
