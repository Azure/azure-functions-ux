import { ArmArray, ArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';

export default class FunctionsService {
  public static fetchFunctions = (resourceId: string) => {
    const id = `${resourceId}/functions`;

    return MakeArmCall<ArmArray<FunctionInfo>>({ resourceId: id, commandName: 'fetchFunctions' });
  };

  public static fetchFunction = (resourceId: string) => {
    return MakeArmCall<ArmObj<FunctionInfo>>({ resourceId, commandName: 'fetchFunction' });
  };
}
