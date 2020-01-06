import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { NameValuePair } from './FunctionEditor.types';

export default class FunctionEditorData {
  public getFunctionInfo(resourceId: string) {
    return FunctionsService.getFunction(resourceId);
  }

  public updateFunctionInfo(resourceId: string, functionInfo: ArmObj<FunctionInfo>) {
    return FunctionsService.updateFunction(resourceId, functionInfo);
  }

  public getProcessedFunctionTestData(data: any) {
    const response = {
      method: '',
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
    return response;
  }
}
