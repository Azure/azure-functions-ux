import { FormikProps } from 'formik';

import { ArmObj } from '../models/arm-obj';

import { getArmDeploymentTemplate, IArmResourceTemplate, TSetArmResourceTemplate, TSetArmResourceTemplates } from './ArmTemplateHelper';
import { CommonConstants } from './CommonConstants';

export const addDatabaseAccountType = (
  endpoint: string,
  databaseAccountType: string = CommonConstants.CosmosDbTypes.globalDocumentDb,
  isContainer: boolean = false,
  databaseName?: string
): string => {
  if (isContainer && !databaseName) {
    return '';
  }

  switch (databaseAccountType) {
    case CommonConstants.CosmosDbTypes.globalDocumentDb:
      return endpoint + (!isContainer ? 'sqlDatabases' : `sqlDatabases/${databaseName}/containers`);

    default:
      return '';
  }
};

/**
 * Gets the database account name from a string whose format by convention is `account_COSMOSDB`
 * @param formProps Formik props which must contain a `connectionStringSetting` string.
 */
export const getDatabaseAccountNameFromConnectionString = (formProps: FormikProps<any>): string => {
  return formProps.values.connectionStringSetting?.split('_')[0];
};

export const getDeploymentTemplate = (
  armResources: IArmResourceTemplate[],
  functionAppId: string,
  appSettings: ArmObj<Record<string, string>>,
  currentAppSettings: Record<string, string>
) => {
  let isCdbDeployment = false;
  let cdbAcctName = '';
  const resourcesToDeploy = armResources;
  const templateParameterSettings = {};
  const templateParameters = {};

  // Build dependency list for AppSettings
  const appSettingsDependencies: string[] = [];
  if (resourcesToDeploy.length > 0) {
    for (const resource of resourcesToDeploy) {
      if (resource.type === CommonConstants.ResourceTypes.cosmosDbAccount) {
        isCdbDeployment = true;
        cdbAcctName = resource.name;
      }

      const resourceNames = resource.name.split('/');

      if (resourceNames.length === 2) {
        appSettingsDependencies.push(`[resourceId('${resource.type}', '${resourceNames[0]}', '${resourceNames[1]}')]`);
      } else if (resourceNames.length === 3) {
        appSettingsDependencies.push(
          `[resourceId('${resource.type}', '${resourceNames[0]}', '${resourceNames[1]}', '${resourceNames[2]}')]`
        );
      } else {
        appSettingsDependencies.push(`[resourceId('${resource.type}', '${resourceNames[0]}')]`);
      }
    }
  }

  if (appSettings || isCdbDeployment) {
    // Combine the current FuncApp settings with the new ones to deploy
    const appSettingsValues = { ...currentAppSettings };

    let noNewValues = true;
    if (isCdbDeployment) {
      // Get Primary Connection string to CDB account if that's what we're deploying
      const connectionStringKey = `${cdbAcctName}_COSMOSDB`;
      noNewValues = false;

      appSettingsValues[
        connectionStringKey
      ] = `[listConnectionStrings(resourceId('${CommonConstants.ResourceTypes.cosmosDbAccount}', '${cdbAcctName}'), '${CommonConstants.ApiVersions.documentDBApiVersion20191212}').connectionStrings[0].connectionString]`;
    } else {
      // Check that we're not duplicating any settings (specifically for Cosmos DB as of 6/30/2021)
      for (const key of Object.keys(appSettings.properties)) {
        if (!(key in currentAppSettings)) {
          appSettingsValues[key] = appSettings.properties[key];
          noNewValues = false;
        }
      }
    }

    // Due to some Cosmos DB template functionality, double check that there are actually new app settings.
    // Otherwise don't deploy.
    if (!noNewValues) {
      // Alter appsettings resource to use secureString parameters (in ARM template)
      for (const appSettingKey of Object.keys(appSettingsValues)) {
        // Don't secureString-ify template functions (some can be, but list ones can't, so we just won't for all of them)
        if (
          appSettingsValues[appSettingKey][0] !== '[' &&
          appSettingsValues[appSettingKey][appSettingsValues[appSettingKey].length - 1] !== ']'
        ) {
          // Establish the parameter within the deployment template
          templateParameterSettings[appSettingKey] = {
            type: 'secureString',
          };

          // Configure the value of the parameter to be sent in the ARM deployment request body
          templateParameters[appSettingKey] = {
            value: appSettingsValues[appSettingKey],
          };

          appSettingsValues[appSettingKey] = `[parameters('${appSettingKey}')]`;
        }
      }

      resourcesToDeploy.push({
        apiVersion: CommonConstants.ApiVersions.sitesApiVersion20201201,
        dependsOn: appSettingsDependencies,
        name: `${functionAppId}/appsettings`,
        properties: appSettingsValues,
        type: 'Microsoft.Web/sites/config',
      });
    }
  }

  return getArmDeploymentTemplate(resourcesToDeploy, templateParameterSettings, templateParameters);
};

export const getNewContainerArmTemplate = (
  containerName: string,
  armResources: IArmResourceTemplate[],
  databaseAccountName: string,
  databaseName: string
): IArmResourceTemplate => {
  const containerTemplate: IArmResourceTemplate = {
    apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20210415,
    name: `${databaseAccountName}/${databaseName}/${containerName}`,
    properties: {
      resource: {
        id: `${containerName}`,
        partitionKey: {
          kind: 'Hash',
          paths: ['/id'],
        },
      },
    },
    type: `${CommonConstants.ResourceTypes.cosmosDbAccount}/sqlDatabases/containers`,
  };

  // If we're creating a new DB account and/or database, make sure to dependsOn it
  if (!databaseAccountName && !databaseName) {
    for (const resource of armResources) {
      if (resource.type === CommonConstants.ResourceTypes.cosmosDbAccount) {
        containerTemplate.dependsOn = [
          `[resourceId('${CommonConstants.ResourceTypes.cosmosDbAccount}/sqlDatabases', '${databaseAccountName}', '${databaseName}')]`,
        ];
        break;
      }
    }
  } else {
    containerTemplate.dependsOn = [
      `[resourceId('${CommonConstants.ResourceTypes.cosmosDbAccount}/sqlDatabases', '${databaseAccountName}', '${databaseName}')]`,
    ];
  }

  return containerTemplate;
};

export const getNewDatabaseArmTemplate = (
  databaseName: string,
  armResources: IArmResourceTemplate[],
  databaseAccountName: string
): IArmResourceTemplate => {
  const databaseTemplate: IArmResourceTemplate = {
    apiVersion: CommonConstants.ApiVersions.documentDBApiVersion20210415,
    name: `${databaseAccountName}/${databaseName}`,
    properties: {
      resource: {
        id: `${databaseName}`,
      },
    },
    type: `${CommonConstants.ResourceTypes.cosmosDbAccount}/sqlDatabases`,
  };

  // If we're creating a new DB account, make sure to dependsOn it
  if (!databaseAccountName) {
    if (armResources.find(armResource => armResource.type === CommonConstants.ResourceTypes.cosmosDbAccount)) {
      databaseTemplate.dependsOn = [`[resourceId('${CommonConstants.ResourceTypes.cosmosDbAccount}', '${databaseAccountName}')]`];
    }
  } else {
    databaseTemplate.dependsOn = [`[resourceId('${CommonConstants.ResourceTypes.cosmosDbAccount}', '${databaseAccountName}')]`];
  }

  return databaseTemplate;
};

export const removeCurrentContainerArmTemplate = (
  armResources: IArmResourceTemplate[],
  setArmResources: TSetArmResourceTemplates,
  setStoredArmTemplate?: TSetArmResourceTemplate
) => {
  removeTemplateConditionally(
    armResources,
    setArmResources,
    armResource => armResource.type.toLowerCase().includes('containers') || armResource.type.toLowerCase().includes('collections'),
    setStoredArmTemplate
  );
};

export const removeCurrentDatabaseAccountArmTemplate = (
  armResources: IArmResourceTemplate[],
  setArmResources: TSetArmResourceTemplates,
  setStoredArmTemplate?: TSetArmResourceTemplate
) => {
  removeTemplateConditionally(
    armResources,
    setArmResources,
    armResource => armResource.type === CommonConstants.ResourceTypes.cosmosDbAccount,
    setStoredArmTemplate
  );
};

export const removeCurrentDatabaseArmTemplate = (
  armResources: IArmResourceTemplate[],
  setArmResources: TSetArmResourceTemplates,
  setStoredArmTemplate?: TSetArmResourceTemplate
) => {
  removeTemplateConditionally(
    armResources,
    setArmResources,
    armResource => armResource.type.toLowerCase().includes('databases') && armResource.name.split('/').length === 2,
    setStoredArmTemplate
  );
};

export const removeTemplateConditionally = (
  armResources: IArmResourceTemplate[],
  setArmResources: TSetArmResourceTemplates,
  condition: (resource: IArmResourceTemplate) => boolean,
  setStoredArmTemplate?: TSetArmResourceTemplate
) => {
  const modifiableArmResources = armResources;

  armResources.forEach((resource, index) => {
    if (condition(resource)) {
      setStoredArmTemplate?.(resource);
      modifiableArmResources.splice(index, 1);
      setArmResources(modifiableArmResources);
    }
  });
};

export const storeTemplateAndClearResources = (
  armResources: IArmResourceTemplate[],
  setArmResources: TSetArmResourceTemplates,
  setStoredArmTemplate: TSetArmResourceTemplate
) => {
  for (const armResource of armResources) {
    if (armResource.type.toLowerCase().includes('databaseaccounts') && armResource.name.split('/').length === 1) {
      setStoredArmTemplate(armResource);
      setArmResources([]);
      break;
    }
  }
};
