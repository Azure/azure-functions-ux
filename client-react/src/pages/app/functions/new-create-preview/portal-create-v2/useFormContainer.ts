import { FormikConfig } from 'formik';
import { useCallback, useContext, useMemo, useState } from 'react';
import { PortalContext } from '../../../../../PortalContext';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { getAppendToFileInputs, getCreateNewAppInputs } from './Helpers';
import { useFunctionAppFileDetector } from './useFunctionAppFileDetector';
import { useFunctionCreator } from './useFunctionCreator';

export function useFormContainer(resourceId: string) {
  const portalCommunicator = useContext(PortalContext);

  const functionAppExists = useFunctionAppFileDetector(resourceId);

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

    /** @todo (joechung): AB#19990968, AB#19991047 */
    const initialValues = functionAppExists
      ? getAppendToFileInputs(selectedTemplate)?.reduce(toInitialValues, {})
      : getCreateNewAppInputs(selectedTemplate)?.reduce(toInitialValues, {});

    /** @todo (joechung): AB#20749256 */
    return {
      ...initialValues,
      ...(!functionAppExists ? { 'app-fileName': 'function_app.py' } : undefined),
      ...(functionAppExists ? { 'app-selectedFileName': 'function_app.py' } : undefined),
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
