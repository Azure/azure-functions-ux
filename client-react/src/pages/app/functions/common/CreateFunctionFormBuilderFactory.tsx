import { BindingType } from '../../../../models/functions/function-binding';
import CosmosDbFunctionFormBuilder from './CosmosDbFunctionFormBuilder';
import { CreateFunctionFormBuilder } from './CreateFunctionFormBuilder';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import i18next from 'i18next';

export type FunctionFormBuilder = CreateFunctionFormBuilder | CosmosDbFunctionFormBuilder;

class CreateFunctionFormBuilderFactory {
  public formBuilder: FunctionFormBuilder;

  constructor(
    templateId: string,
    bindingInfo: BindingInfo[],
    bindings: Binding[],
    resourceId: string,
    functionsInfo: ArmObj<FunctionInfo>[],
    defaultName: string,
    t: i18next.TFunction
  ) {
    const lowerTemplateIdWithoutLanguage = templateId.toLowerCase().split('-')[0];

    switch (lowerTemplateIdWithoutLanguage) {
      case BindingType.cosmosDBTrigger.toLowerCase():
        this.formBuilder = new CosmosDbFunctionFormBuilder(bindingInfo, bindings, resourceId, functionsInfo, defaultName, t);
        break;

      default:
        this.formBuilder = new CreateFunctionFormBuilder(bindingInfo, bindings, resourceId, functionsInfo, defaultName, t);
    }
  }
}

export default CreateFunctionFormBuilderFactory;
