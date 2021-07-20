import { ArmObj } from '../models/arm-obj';
import { ISubscription } from '../models/subscription';
import { acrARGInfo } from '../pages/app/deployment-center/DeploymentCenter.types';
import { CommonConstants } from '../utils/CommonConstants';
import { ARGRequest, MakeAzureResourceGraphCall } from './ArgHelper';
import MakeArmCall from './ArmHelper';

export default class TagsService {
  public static updateTags = (resourceId: string, tags: any, apiVersion = CommonConstants.ApiVersions.antaresApiVersion20181101) => {
    return MakeArmCall<ArmObj<void>>({
      resourceId,
      method: 'PATCH',
      commandName: 'updateTags',
      apiVersion: apiVersion,
      body: tags,
    });
  };

  public static fetchAcrResourceId = (acrName: string, subscriptions: ISubscription[]) => {
    const subscriptionIds = !!subscriptions ? subscriptions.map(subscription => subscription.subscriptionId) : [];
    const queryString =
      `where type == 'microsoft.containerregistry/registries'` +
      `| where name == '${acrName}'` +
      `| project id,name,type,resourceGroup,location,subscriptionId`;

    const request: ARGRequest = {
      subscriptions: subscriptionIds,
      query: queryString,
    };

    return MakeAzureResourceGraphCall<ArmObj<acrARGInfo>[]>(request, 'fetchAcr');
  };
}
