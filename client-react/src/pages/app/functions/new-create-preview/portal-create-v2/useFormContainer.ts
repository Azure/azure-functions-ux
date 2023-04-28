import { FormikConfig } from 'formik';
import { useCallback, useContext, useMemo, useState } from 'react';
import { PortalContext } from '../../../../../PortalContext';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { getAppendToFileInputs, getCreateNewAppInputs } from './Helpers';
import { useFunctionAppFileDetector } from './useFunctionAppFileDetector';

export function useFormContainer(resourceId: string) {
  const portalCommunicator = useContext(PortalContext);

  const functionAppExists = useFunctionAppFileDetector(resourceId);

  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplateV2>();

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

    /** @todo (joechung): Change this later to determine initial values when creating functions in new or existing blueprints. */
    const initialValues = functionAppExists
      ? getAppendToFileInputs(selectedTemplate)?.reduce(toInitialValues, {})
      : getCreateNewAppInputs(selectedTemplate)?.reduce(toInitialValues, {});

    /** @todo (joechung): Consider changing this later when the app filename (currently hard-coded to `function_app.py`) is configurable. */
    return {
      ...initialValues,
      'app-fileName': 'function_app.py',
      'app-selectedFileName': 'function_app.py',
    };
  }, [functionAppExists, selectedTemplate]);

  const onCancel = useCallback(() => {
    portalCommunicator.closeSelf();
  }, [portalCommunicator]);

  const onSubmit = useCallback<FormikConfig<BindingEditorFormValues>['onSubmit']>(values => {
    /** @todo #19996457 */
    console.log('values', values);
  }, []);

  const onTemplateSelect = useCallback((template: FunctionTemplateV2) => {
    setSelectedTemplate(template);
  }, []);

  return {
    initialValues,
    onCancel,
    onSubmit,
    onTemplateSelect,
  };
}
