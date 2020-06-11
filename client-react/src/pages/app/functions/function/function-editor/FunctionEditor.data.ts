import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { ArmObj } from '../../../../../models/arm-obj';
import { NameValuePair, HttpMethods } from './FunctionEditor.types';
import { BindingManager } from '../../../../../utils/BindingManager';

export default class FunctionEditorData {
  public FUNCTION_JSON_FILE = 'function.json';
  private blacklistedFileTypes = ['java', 'jar', 'zip', 'csproj'];

  public getFunctionInfo(resourceId: string) {
    return FunctionsService.getFunction(resourceId);
  }

  public updateFunctionInfo(resourceId: string, functionInfo: ArmObj<FunctionInfo>) {
    return FunctionsService.updateFunction(resourceId, functionInfo);
  }

  public getProcessedFunctionTestData(data: any) {
    const response = {
      method: HttpMethods.get,
      queries: [] as NameValuePair[],
      headers: [] as NameValuePair[],
      body: '',
    };
    if (!!data.method) {
      response.method = data.method;
    }
    if (!!data.queryStringParams) {
      const queries: NameValuePair[] = [];
      for (const parameter of data.queryStringParams) {
        queries.push({ name: parameter.name, value: parameter.value });
      }
      response.queries = queries;
    }
    if (!!data.headers) {
      const headers: NameValuePair[] = [];
      for (const parameter of data.headers) {
        headers.push({ name: parameter.name, value: parameter.value });
      }
      response.headers = headers;
    }
    if (!!data.body) {
      response.body = data.body;
    }
    return response;
  }

  public isBlacklistedFile(filename: string) {
    for (let i = 0; i < this.blacklistedFileTypes.length; ++i) {
      if (filename.toLocaleLowerCase().endsWith(`.${this.blacklistedFileTypes[i]}`)) {
        return true;
      }
    }

    return false;
  }

  public isHttpOrWebHookFunction(functionInfo: ArmObj<FunctionInfo>) {
    return BindingManager.getHttpTriggerTypeInfo(functionInfo.properties) || BindingManager.getWebHookTypeInfo(functionInfo.properties);
  }

  public isEventGridTriggerFunction(functionInfo: ArmObj<FunctionInfo>) {
    return BindingManager.getEventGridTriggerInfo(functionInfo.properties);
  }
}
