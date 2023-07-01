import { ArmObj } from '../models/arm-obj';

import { ARGRequest, MakeAzureResourceGraphCall } from './ArgHelper';

export default class KeyVaultService {
  public static fetchKeyVaultReference = (subscriptionId: string, keyVaultUri: string) => {
    const queryString = `where type == 'microsoft.keyvault/vaults' | where properties.vaultUri startswith '${keyVaultUri}'`;

    const request: ARGRequest = {
      subscriptions: [subscriptionId],
      query: queryString,
    };
    return MakeAzureResourceGraphCall<ArmObj<Record<string, any>>>(request, 'fetchKeyVaultReference');
  };
}
