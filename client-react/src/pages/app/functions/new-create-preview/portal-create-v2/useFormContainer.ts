import { FormikConfig } from 'formik';
import { useCallback, useContext, useMemo, useState } from 'react';
import { PortalContext } from '../../../../../PortalContext';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { getJobInputs } from './Helpers';
import { JobType } from './JobType';
import { useFunctionAppFileDetector } from './useFunctionAppFileDetector';
import { useFunctionCreator } from './useFunctionCreator';

export function useFormContainer(resourceId: string) {
  const portalCommunicator = useContext(PortalContext);

  const { functionAppExists } = useFunctionAppFileDetector(resourceId);

  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplateV2>();

  const { createFunction, isCreatingFunction, statusMessage } = useFunctionCreator(resourceId, functionAppExists, selectedTemplate);

  const initialValues = useMemo(() => {
    if (functionAppExists === undefined || !selectedTemplate) {
      return {};
    }

    const toInitialValues = (previous: BindingEditorFormValues, { defaultValue, paramId }) => {
      return {
        ...previous,
        [paramId]: defaultValue,
      };
    };

    // Combine and dedupe app job and blueprint job initial values.
    const initialValues = {
      ...(functionAppExists
        ? getJobInputs(selectedTemplate, JobType.CreateNewApp)?.reduce(toInitialValues, {})
        : getJobInputs(selectedTemplate, JobType.AppendToFile)?.reduce(toInitialValues, {})),
      ...getJobInputs(selectedTemplate, JobType.CreateNewBlueprint)?.reduce(toInitialValues, {}),
      ...getJobInputs(selectedTemplate, JobType.AppendToBlueprint)?.reduce(toInitialValues, {}),
    };

    /** @todo (joechung): AB#20749256 */
    return {
      ...initialValues,
      jobType: functionAppExists ? 'AppendToFile' : 'CreateNewApp',
      ...(functionAppExists ? { 'app-selectedFileName': 'function_app.py' } : { 'app-fileName': 'function_app.py' }),
    };
  }, [functionAppExists, selectedTemplate]);

  const onCancel = useCallback(() => {
    portalCommunicator.closeSelf();
  }, [portalCommunicator]);

  const onSubmit = useCallback<FormikConfig<BindingEditorFormValues>['onSubmit']>(
    values => {
      createFunction(values);
    },
    [createFunction]
  );

  const onTemplateSelect = useCallback((template: FunctionTemplateV2) => {
    setSelectedTemplate(template);
  }, []);

  return {
    initialValues,
    isCreatingFunction,
    onCancel,
    onSubmit,
    onTemplateSelect,
    selectedTemplate,
    statusMessage,
  };
}
