import { KeyValue } from '../../../models/portal-models';
import { EnvironmentVariable } from './Configuration.types';

export default class ConfigurationData {
  public static convertEnvironmentVariablesObjectToArray(environmentVariableObject: KeyValue<string>) {
    return Object.keys(environmentVariableObject).map((key, i) => {
      return {
        name: key,
        value: environmentVariableObject[key],
      };
    });
  }

  public static convertEnvironmentVariablesArrayToObject(environmentVariableArray: EnvironmentVariable[]) {
    const environmentVariableObject: KeyValue<string> = {};
    environmentVariableArray.forEach(environmentVariable => {
      environmentVariableObject[environmentVariable.name] = environmentVariable.value;
    });
    return environmentVariableObject;
  }
}
