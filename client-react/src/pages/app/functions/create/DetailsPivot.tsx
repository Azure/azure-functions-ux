import React from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { DefaultButton } from 'office-ui-fabric-react';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { useTranslation } from 'react-i18next';
import { BindingFormBuilder, BindingEditorFormValues } from '../common/BindingFormBuilder';
import { Formik, FormikProps } from 'formik';
import { style } from 'typestyle';
import { BindingConfigMetadata } from '../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../models/functions/function-binding';

const fieldWrapperStyle = style({
  padding: '20px',
});

interface DetailsPivotProps {
  bindingsConfigMetatdata: BindingConfigMetadata[];
  selectedFunctionTemplate: FunctionTemplate | undefined;
  resourceId: string;
}

const DetailsPivot: React.FC<DetailsPivotProps> = props => {
  const { bindingsConfigMetatdata, selectedFunctionTemplate, resourceId } = props;
  const { t } = useTranslation();

  if (selectedFunctionTemplate) {
    const triggerBinding = getTriggerBinding(selectedFunctionTemplate);
    const requiredBindingMetadata = getRequiredBindingMetadata(triggerBinding, bindingsConfigMetatdata, selectedFunctionTemplate);
    const builder = new BindingFormBuilder(triggerBinding, requiredBindingMetadata, t);
    const initialFormValues = builder.getInitialFormValues();

    return (
      <>
        <Formik initialValues={initialFormValues} onSubmit={() => null}>
          {(formProps: FormikProps<BindingEditorFormValues>) => {
            return (
              <form>
                <div className={fieldWrapperStyle}>{builder.getFields(formProps, false)}</div>
              </form>
            );
          }}
        </Formik>
        <DefaultButton onClick={() => onCreateFunctionClicked(resourceId, selectedFunctionTemplate)}>Create Function</DefaultButton>
      </>
    );
  }
  return <></>;
};

const onCreateFunctionClicked = (resourceId: string, functionTemplate: FunctionTemplate) => {
  FunctionsService.createFunction(resourceId, functionTemplate.id, functionTemplate.files, functionTemplate.function);
};

const getTriggerBinding = (functionTemplate: FunctionTemplate): BindingInfo => {
  return functionTemplate.function.bindings.find(binding => binding.type.toLowerCase().includes('trigger')) as BindingInfo;
};

const getRequiredBindingMetadata = (
  triggerBinding: BindingInfo,
  bindingsConfigMetatdata: BindingConfigMetadata[],
  functionTemplate: FunctionTemplate
): BindingConfigMetadata => {
  const currentBindingMetadata = bindingsConfigMetatdata.find(b => b.type === triggerBinding.type) as BindingConfigMetadata;
  if (functionTemplate.metadata.userPrompt && functionTemplate.metadata.userPrompt.length > 0) {
    const requiredBindings = currentBindingMetadata;
    requiredBindings.settings = currentBindingMetadata.settings.filter(setting => {
      return functionTemplate.metadata.userPrompt && functionTemplate.metadata.userPrompt.find(prompt => prompt === setting.name);
    });
    return requiredBindings;
  }
  return currentBindingMetadata;
};

export default DetailsPivot;
