import React from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { DefaultButton } from 'office-ui-fabric-react';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { useTranslation } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import { BindingConfigMetadata } from '../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionConfig } from '../../../../models/functions/function-config';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { paddingStyle } from './FunctionCreate.styles';

interface DetailsPivotProps {
  functionsInfo: ArmObj<FunctionInfo>[];
  bindingsConfigMetatdata: BindingConfigMetadata[];
  selectedFunctionTemplate: FunctionTemplate | undefined;
  resourceId: string;
}

const DetailsPivot: React.FC<DetailsPivotProps> = props => {
  const { functionsInfo, bindingsConfigMetatdata, selectedFunctionTemplate, resourceId } = props;
  const { t } = useTranslation();

  if (selectedFunctionTemplate) {
    const triggerBinding = getTriggerBinding(selectedFunctionTemplate);
    const requiredBindingMetadata = getRequiredBindingMetadata(
      triggerBinding,
      bindingsConfigMetatdata,
      selectedFunctionTemplate.metadata.userPrompt || []
    );
    const builder = new CreateFunctionFormBuilder(
      triggerBinding,
      requiredBindingMetadata,
      functionsInfo,
      selectedFunctionTemplate.metadata.defaultFunctionName || 'newFunction',
      t
    );
    const initialFormValues = builder.getInitialFormValues();

    return (
      <>
        <Formik
          initialValues={initialFormValues}
          onSubmit={formValues => onCreateFunctionClicked(resourceId, selectedFunctionTemplate, triggerBinding, formValues)}>
          {(formProps: FormikProps<CreateFunctionFormValues>) => {
            return (
              <form>
                <div style={paddingStyle}>
                  {builder.getFields(formProps, false)}
                  <DefaultButton onClick={formProps.submitForm}>Create Function</DefaultButton>
                </div>
              </form>
            );
          }}
        </Formik>
      </>
    );
  }
  return <></>;
};

const onCreateFunctionClicked = (
  resourceId: string,
  functionTemplate: FunctionTemplate,
  triggerBinding: BindingInfo,
  formValues: CreateFunctionFormValues
) => {
  const config = buildFunctionConfig(functionTemplate.function.bindings, triggerBinding, formValues);
  FunctionsService.createFunction(resourceId, formValues.functionName, functionTemplate.files, config);
};

const getTriggerBinding = (functionTemplate: FunctionTemplate): BindingInfo => {
  return functionTemplate.function.bindings.find(binding => binding.type.toLowerCase().includes('trigger')) as BindingInfo;
};

// Not all bindings are required for function creation
// Only display bindings that are list in the funciton template 'userPrompt'
const getRequiredBindingMetadata = (
  triggerBinding: BindingInfo,
  bindingsConfigMetatdata: BindingConfigMetadata[],
  userPrompt: string[]
): BindingConfigMetadata => {
  const currentBindingMetadata = bindingsConfigMetatdata.find(b => b.type === triggerBinding.type) as BindingConfigMetadata;
  const requiredBindings = currentBindingMetadata;
  requiredBindings.settings = currentBindingMetadata.settings.filter(setting => {
    return userPrompt.find(prompt => prompt === setting.name);
  });
  return requiredBindings;
};

const buildFunctionConfig = (
  defaultBindingInfo: BindingInfo[],
  triggerBinding: BindingInfo,
  formValues: BindingEditorFormValues
): FunctionConfig => {
  const resultConfig: FunctionConfig = {
    bindings: [],
  };

  defaultBindingInfo.forEach(bindingInfo => {
    // Only look at form values for the trigger Binding
    // Else, (when not the trigger Binding) directly copy the Binding
    if (bindingInfo === triggerBinding) {
      const bindingInfoCopy = bindingInfo;
      // Update binding values that exist in the form
      for (const key in bindingInfo) {
        if (formValues.hasOwnProperty(key)) {
          bindingInfoCopy[key] = formValues[key];
        }
      }
      resultConfig.bindings.push(bindingInfoCopy);
    } else {
      resultConfig.bindings.push(bindingInfo);
    }
  });

  return resultConfig;
};

export default DetailsPivot;
