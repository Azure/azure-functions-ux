import { KeyValue } from '../../../models/portal-models';
import { EnvironmentVariable } from './Configuration.types';

export default class ConfigurationData {
  public static convertEnvironmentVariablesObjectToArray(environmentVariableObject: KeyValue<string>) {
    const environmentVariableArray: EnvironmentVariable[] = [];
    Object.keys(environmentVariableObject).map((key, i) =>
      environmentVariableArray.push({
        name: key,
        value: environmentVariableObject[key],
      })
    );
    return environmentVariableArray;
  }

  public static convertEnvironmentVariablesArrayToObject(environmentVariableArray: EnvironmentVariable[]) {
    const environmentVariableObject: KeyValue<string> = {};
    environmentVariableArray.forEach(environmentVariable => {
      environmentVariableObject[environmentVariable.name] = environmentVariable.value;
    });
    return environmentVariableObject;
  }
}
