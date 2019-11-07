import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { HttpResponseObject } from '../../../../ArmHelper.types';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingsConfig } from '../../../../models/functions/bindings-config';
import { FunctionInfo } from '../../../../models/functions/function-info';

export default class FunctionIntegrateData {
  public getBindingsConfig(): Promise<HttpResponseObject<BindingsConfig>> {
    return FunctionsService.getBindingConfigMetadata();
  }

  public getFunction(functionResourceId: string): Promise<HttpResponseObject<ArmObj<FunctionInfo>>> {
    return FunctionsService.getFunction(functionResourceId);
  }

  public updateFunction(functionResourceId: string, functionInfo: ArmObj<FunctionInfo>): Promise<HttpResponseObject<ArmObj<FunctionInfo>>> {
    return FunctionsService.updateFunction(functionResourceId, functionInfo);
  }
}
