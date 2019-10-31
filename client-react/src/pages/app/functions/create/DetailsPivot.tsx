import React, { useContext } from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { DefaultButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import { BindingsConfig } from '../../../../models/functions/bindings-config';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { paddingStyle } from './FunctionCreate.styles';
import { FunctionCreateContext } from './FunctionCreateDataLoader';
import { getRequiredCreationBindings } from './DetailsPivot.helper';
import { PortalContext } from '../../../../PortalContext';

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
          onSubmit={formValues => provider.createFunction(portalCommunicator, t, resourceId, selectedFunctionTemplate, formValues)}>
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
