import React, { useContext, useState } from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { DefaultButton, Spinner } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import { BindingsConfig, BindingConfigMetadata } from '../../../../models/functions/bindings-config';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { paddingStyle } from './FunctionCreate.styles';
import { FunctionCreateContext } from './FunctionCreateDataLoader';
import { PortalContext } from '../../../../PortalContext';
import { BindingInfo } from '../../../../models/functions/function-binding';

interface DetailsPivotProps {
  functionsInfo: ArmObj<FunctionInfo>[];
  bindingsConfig: BindingsConfig;
  selectedFunctionTemplate: FunctionTemplate | undefined;
  resourceId: string;
}

const DetailsPivot: React.FC<DetailsPivotProps> = props => {
  const { functionsInfo, bindingsConfig, selectedFunctionTemplate, resourceId } = props;
  const provider = useContext(FunctionCreateContext);
  const portalCommunicator = useContext(PortalContext);
  const { t } = useTranslation();
  const [creatingFunction, setCreatingFunction] = useState<boolean>(false);

  if (selectedFunctionTemplate) {
    const requiredBindingMetadata = getRequiredCreationBindings(
      selectedFunctionTemplate.function.bindings,
      bindingsConfig,
      selectedFunctionTemplate.metadata.userPrompt || []
    );
    const builder = new CreateFunctionFormBuilder(
      selectedFunctionTemplate.function.bindings,
      requiredBindingMetadata,
      resourceId,
      bindingsConfig.variables,
      functionsInfo,
      selectedFunctionTemplate.metadata.defaultFunctionName || 'NewFunction',
      t
    );
    const initialFormValues = builder.getInitialFormValues();

    return (
      <>
        <Formik
          initialValues={initialFormValues}
          onSubmit={formValues => {
            setCreatingFunction(true);
            provider.createFunction(portalCommunicator, t, resourceId, selectedFunctionTemplate, formValues);
          }}>
          {(formProps: FormikProps<CreateFunctionFormValues>) => {
            return (
              <form>
                <div style={paddingStyle}>
                  {builder.getFields(formProps, false)}
                  <DefaultButton onClick={formProps.submitForm} disabled={!formProps.isValid || creatingFunction}>
                    {creatingFunction ? <Spinner /> : t('functionCreate_createFunction')}
                  </DefaultButton>
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

// Not all bindings are required for function creation
// Only display bindings that are list in the function template 'userPrompt'
const getRequiredCreationBindings = (
  functionTemplateBindings: BindingInfo[],
  bindingsConfig: BindingsConfig,
  userPrompt: string[]
): BindingConfigMetadata[] => {
  const requiredBindingConfigMetadata: BindingConfigMetadata[] = [];
  const bindingsConfigMetatdata = bindingsConfig.bindings;
  functionTemplateBindings.forEach(binding => {
    const currentBindingMetadata = bindingsConfigMetatdata.find(b => b.type === binding.type) as BindingConfigMetadata;
    const requiredBindings = currentBindingMetadata;
    requiredBindings.settings = currentBindingMetadata.settings.filter(setting => {
      return userPrompt.find(prompt => prompt === setting.name);
    });
    requiredBindingConfigMetadata.push(requiredBindings);
  });
  return requiredBindingConfigMetadata;
};

export default DetailsPivot;
