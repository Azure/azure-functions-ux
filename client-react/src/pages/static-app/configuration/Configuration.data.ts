import { KeyValue } from '../../../models/portal-models';
import { EnvironmentVariable } from './Configuration.types';
import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';

export default class ConfigurationData {
  public static convertEnvironmentVariablesObjectToArray(environmentVariableObject: KeyValue<string>) {
    return Object.keys(environmentVariableObject).map(key => ({
      name: key,
      value: environmentVariableObject[key],
    }));
  }

  public static convertEnvironmentVariablesArrayToObject(environmentVariableArray: EnvironmentVariable[]) {
    const environmentVariableObject: KeyValue<string> = {};
    environmentVariableArray.forEach(environmentVariable => {
      environmentVariableObject[environmentVariable.name] = environmentVariable.value;
    });
    return environmentVariableObject;
  }

  public static getEnvironmentName(environment: ArmObj<Environment>) {
    return environment.name.toLocaleLowerCase() === 'default'
      ? 'Production'
      : `#${environment.name} - ${environment.properties.pullRequestTitle}`;
  }
}
