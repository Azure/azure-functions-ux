import { ArmObj } from '../../../models/arm-obj';
import { KeyValue } from '../../../models/portal-models';
import { Environment } from '../../../models/static-site/environment';
import { getPreviewsTitleValue } from '../StaticSiteUtility';

import { EnvironmentVariable } from './Configuration.types';

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
    return environment.name.toLocaleLowerCase() === 'default' ? 'Production' : getPreviewsTitleValue(environment);
  }
}
