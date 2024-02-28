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

export const getVsCodeForTheWebLink = async (resourceId: string, authToken: string) => {
  const descriptor = new ArmResourceDescriptor(resourceId);
  const subscription = descriptor.subscription;
  const resourceGroup = descriptor.resourceGroup;
  const resource = descriptor.parts[7];

  const response = await GraphService.getUser(authToken);
  const userAccountId = response.data.id;

  return `https://insiders.vscode.dev/+ms-azuretools.vscode-azure-functions-remote-web/${subscription}+${resourceGroup}+${resource}+${userAccountId}/functionApp?version=edit`;
};
