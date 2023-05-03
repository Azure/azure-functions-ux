import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import ActionBar, { StatusMessage } from '../../../../../components/ActionBar';
import { ArmObj } from '../../../../../models/arm-obj';
import { HostStatus } from '../../../../../models/functions/host-status';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { formContainerDivStyle, formContainerStyle } from '../FunctionCreate.styles';
import TemplateList from './TemplateList';
import { useFormContainer } from './useFormContainer';

interface FormContainerProps {
  creatingFunction: boolean;
  resourceId: string;
  createExperienceStatusMessage?: StatusMessage;
  hostStatus?: ArmObj<HostStatus>;
}

const FormContainer: React.FC<FormContainerProps> = ({
  createExperienceStatusMessage,
  creatingFunction,
  hostStatus,
  resourceId,
}: FormContainerProps) => {
  const { t } = useTranslation();

  const { initialValues, onCancel, onSubmit, onTemplateSelect } = useFormContainer(resourceId);

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
              disable: creatingFunction,
              onClick: formProps.submitForm,
              title: t('create'),
            }}
            secondaryButton={{
              id: 'cancel',
              disable: creatingFunction,
              onClick: onCancel,
              title: t('cancel'),
            }}
            statusMessage={createExperienceStatusMessage}
            validating={creatingFunction}
            validationMessage={t('creatingFunction')}
          />
        </form>
      )}
    </Formik>
  );
};

export default FormContainer;
