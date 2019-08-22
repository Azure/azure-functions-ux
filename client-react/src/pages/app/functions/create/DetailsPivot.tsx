import React, { useContext } from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { DefaultButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import { BindingConfigMetadata } from '../../../../models/functions/bindings-config';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { paddingStyle } from './FunctionCreate.styles';
import { FunctionCreateContext } from './FunctionCreateDataLoader';
import { getTriggerBinding, getRequiredBindingMetadata } from './DetailsPivot.helper';

interface DetailsPivotProps {
  functionsInfo: ArmObj<FunctionInfo>[];
  bindingsConfigMetatdata: BindingConfigMetadata[];
  selectedFunctionTemplate: FunctionTemplate | undefined;
  resourceId: string;
}

const DetailsPivot: React.FC<DetailsPivotProps> = props => {
  const { functionsInfo, bindingsConfigMetatdata, selectedFunctionTemplate, resourceId } = props;
  const functionCreateData = useContext(FunctionCreateContext);
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
      selectedFunctionTemplate.metadata.defaultFunctionName || 'NewFunction',
      t
    );
    const initialFormValues = builder.getInitialFormValues();

    return (
      <>
        <Formik
          initialValues={initialFormValues}
          onSubmit={formValues => functionCreateData.createFunction(resourceId, selectedFunctionTemplate, triggerBinding, formValues)}>
          {(formProps: FormikProps<CreateFunctionFormValues>) => {
            return (
              <form>
                <div style={paddingStyle}>
                  {builder.getFields(formProps, false)}
                  <DefaultButton onClick={formProps.submitForm}>{t('functionCreate_createFunction')}</DefaultButton>
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

export default DetailsPivot;
