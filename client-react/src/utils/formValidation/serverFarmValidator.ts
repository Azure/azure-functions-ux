import ServerFarmService from '../../ApiHelpers/ServerFarmService';
import { Guid } from '../Guid';

const SERVERFARM_MAX_LENGTH = 40;
const RESTRICTED_NAME = 'default';

export const getServerFarmValidator = <T>(subscriptionId: string, resourceGroupName: string, errorMessageOverride?: string) => {
  return (name: string, props?: T) => {
    return new Promise((resolve, reject) => {
      const errors: any = {};

      if (!name) {
        resolve(errors);
        return;
      }

      if (name.length > SERVERFARM_MAX_LENGTH) {
        errors.maxLength = `The name of your plan may not exceed ${SERVERFARM_MAX_LENGTH} characters`;
      }

      if (name.toLowerCase() === RESTRICTED_NAME) {
        errors.restrictedName = `The name '${name}' is restricted. Please choose another name.`;
      }

      const serverFarmId = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Web/serverFarms/${name}`;
      return ServerFarmService.fetchServerFarm(serverFarmId).then(r => {
        if (r.metadata.success) {
          errors.notUnique = `A plan named '${name}' already exists under the resource group ${resourceGroupName}`;
        }

        Object.keys(errors).length > 0 ? reject(errors) : resolve(errors);
      });
    });
  };
};

export const getDefaultServerFarmName = (siteName: string) => {
  let name = `ASP-${siteName}`;
  const tinyGuid = Guid.newTinyGuid();

  if (name.length > SERVERFARM_MAX_LENGTH - tinyGuid.length - 1) {
    name = name.slice(0, SERVERFARM_MAX_LENGTH - tinyGuid.length - 1);
  }

  return `${name}-${tinyGuid}`;
};
