import GraphService from '../../../../ApiHelpers/GraphService';
import PortalCommunicator from '../../../../portal-communicator';
import { ArmResourceDescriptor } from '../../../../utils/resourceDescriptors';
import { getTelemetryInfo } from './FunctionsUtility';

export const fetchAuthToken = async (portalCommunicator: PortalCommunicator) => {
  return portalCommunicator.getAdToken('microsoft.graph').then(authTokenResponse => {
    if (authTokenResponse) {
      return authTokenResponse;
    } else {
      portalCommunicator.log(
        getTelemetryInfo('error', 'getAuthToken', 'failed', {
          message: 'Failed to get user authentication token',
        })
      );
    }
  });
};

export const fetchUserId = async (portalCommunicator: PortalCommunicator) => {
  const authToken = await fetchAuthToken(portalCommunicator);
  if (authToken) {
    return GraphService.getUser(authToken).then(response => {
      if (response.metadata.success) {
        return response.data.id;
      } else {
        portalCommunicator.log(
          getTelemetryInfo('error', 'getUser', 'failed', {
            message: 'Failed to get user data',
          })
        );
      }
    });
  }
};

const removeDashes = (stringToSanitize: string) => {
  return stringToSanitize.replaceAll('-', '');
};

export const getVsCodeForTheWebLink = (resourceId: string, userAccountId: string, mode: 'deployed' | 'saved') => {
  const descriptor = new ArmResourceDescriptor(resourceId);
  const subscription = descriptor.subscription;
  const resourceGroup = descriptor.resourceGroup;
  const resource = descriptor.parts[7];

  const userAccountIdWithoutDashes = removeDashes(userAccountId);
  const encodedIdentifiers = btoa(`${subscription}+${resourceGroup}+${resource}+${userAccountIdWithoutDashes}`);

  return `https://vscode.dev/+ms-azuretools.vscode-azure-functions-remote-web/${encodedIdentifiers}/home/${userAccountIdWithoutDashes}/${resource}?useCodeVersion=${mode}`;
};
