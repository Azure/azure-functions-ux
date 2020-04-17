import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { HttpResponseObject } from '../../../../../ArmHelper.types';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding } from '../../../../../models/functions/binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';

export default class FunctionIntegrateData {
  public getBindings(functionAppResourceId: string): Promise<HttpResponseObject<ArmObj<Binding[]>>> {
    return FunctionsService.getBindings(functionAppResourceId);
  }

  public getBinding(functionAppResourceId: string, bindingId: string): Promise<HttpResponseObject<ArmObj<Binding>>> {
    return FunctionsService.getBinding(functionAppResourceId, bindingId);
  }

  public getFunction(functionResourceId: string): Promise<HttpResponseObject<ArmObj<FunctionInfo>>> {
    return FunctionsService.getFunction(functionResourceId);
  }

  public updateFunction(functionResourceId: string, functionInfo: ArmObj<FunctionInfo>): Promise<HttpResponseObject<ArmObj<FunctionInfo>>> {
    return FunctionsService.updateFunction(functionResourceId, functionInfo);
  }

  public getHostStatus(resourceId: string) {
    return FunctionsService.getHostStatus(resourceId);
  }
}
