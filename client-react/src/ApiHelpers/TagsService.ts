import { ArmObj } from '../models/arm-obj';
import { KeyValue } from '../models/portal-models';
import { acrARGInfo } from '../pages/app/deployment-center/DeploymentCenter.types';
import { CommonConstants } from '../utils/CommonConstants';

import { ARGRequest, MakeAzureResourceGraphCall } from './ArgHelper';
import MakeArmCall from './ArmHelper';

export default class TagsService {
  public static updateTags = (
    resourceId: string,
    tags: ArmObj<KeyValue<string>>,
    apiVersion = CommonConstants.ApiVersions.antaresApiVersion20181101
  ) => {
    return MakeArmCall<ArmObj<KeyValue<string>>>({
      resourceId,
      method: 'PATCH',
      commandName: 'updateTags',
      apiVersion: apiVersion,
      body: tags,
    });
  };

  public static fetchAcrResourceId = (acrName: string) => {
    const queryString =
      `where type == 'microsoft.containerregistry/registries'` +
      `| where name =~ '${acrName}'` +
      `| project id,name,type,resourceGroup,location,subscriptionId`;

    const request: ARGRequest = {
      query: queryString,
      options: {
        $top: 1000,
      },
    };

    return MakeAzureResourceGraphCall<ArmObj<acrARGInfo>[]>(request, 'fetchAcr', CommonConstants.ApiVersions.argApiVersion20210301);
  };
}
