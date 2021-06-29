import { CreateFunctionFormBuilder, CreateFunctionFormValues } from './CreateFunctionFormBuilder';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import i18next from 'i18next';
import { FormikProps } from 'formik';
import { IArmRscTemplate } from '../new-create-preview/FunctionCreateDataLoader';

class CosmosDbFunctionFormBuilder extends CreateFunctionFormBuilder {
  constructor(
    bindingInfo: BindingInfo[],
    bindings: Binding[],
    resourceId: string,
    functionsInfo: ArmObj<FunctionInfo>[],
    defaultName: string,
    t: i18next.TFunction
  ) {
    super(bindingInfo, bindings, resourceId, functionsInfo, defaultName, t);
  }

  public getFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    setArmResources: (armResources: IArmRscTemplate[]) => void,
    isDisabled: boolean
  ) {
    return super.getFields(formProps, setArmResources, isDisabled);
  }
}

export default CosmosDbFunctionFormBuilder;
