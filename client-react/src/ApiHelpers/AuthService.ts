import { ACRManagedIdentityType, RoleAssignment } from '../pages/app/deployment-center/DeploymentCenter.types';
import { KeyValue } from '../models/portal-models';
import { Guid } from '../utils/Guid';
import { CommonConstants, RBACRoleId } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';

export default class AuthService {
  public static async hasAcrPullPermission(acrResourceId: string, principalId: string) {
    const roleAssignments = await this.getRoleAssignments(acrResourceId, principalId);
    if (roleAssignments) {
      return roleAssignments.data.value.some(assignment => {
        const roleDefinitionId = assignment.properties.roleDefinitionId.split(CommonConstants.singleForwardSlash).pop();
        return roleDefinitionId === RBACRoleId.acrPull;
      });
    }
  }

  public static async getRoleAssignments(
    scope: string,
    principalId: string,
    apiVersion: string = CommonConstants.ApiVersions.roleAssignmentApiVersion20180701
  ) {
    const urlString = `${scope}/providers/Microsoft.Authorization/roleAssignments?`;
    const queryString = `$filter=atScope()+and+assignedTo('{${principalId}}')`;
    const url = urlString + queryString;

    const response = await MakeArmCall<ArmArray<RoleAssignment>>({
      resourceId: url,
      commandName: 'getRoleAssignments',
      apiVersion: apiVersion,
    });

    if (response.metadata.success && !!response.data) {
      return response;
    }
  }

  public static async setAcrPullPermission(
    acrResourceId: string,
    principalId: string,
    apiVersion: string = CommonConstants.ApiVersions.roleAssignmentApiVersion20180701
  ) {
    const roleId = RBACRoleId.acrPull;
    const roleGuid = Guid.newGuid();

    const urlString = `${acrResourceId}/providers/Microsoft.Authorization/roleAssignments/${roleGuid}?`;
    const queryString = `&$filter=atScope()+and+assignedTo('{${principalId}}')`;
    const url = urlString + queryString;

    const body = {
      properties: {
        roleDefinitionId: `${acrResourceId}/providers/Microsoft.Authorization/roleDefinitions/${roleId}`,
        principalId: `${principalId}`,
      },
    };

    const response = await MakeArmCall({
      body,
      resourceId: url,
      commandName: 'setAcrPullPermissions',
      apiVersion: apiVersion,
      method: 'PUT',
    });

    return response.metadata.success;
  }

  public static async enableSystemAssignedIdentity(
    resourceId: string,
    userAssignedIdentities?: KeyValue<KeyValue<string>>,
    apiVersion: string = CommonConstants.ApiVersions.enableSystemAssignedIdentityApiVersion20210201
  ) {
    return MakeArmCall({
      resourceId: resourceId,
      commandName: 'enableSystemAssignedIdentity',
      method: 'PATCH',
      apiVersion: apiVersion,
      body: {
        identity: this._getIdentity(userAssignedIdentities),
      },
    });
  }

  private static _getIdentity(userAssignedIdentities?: KeyValue<KeyValue<string>>) {
    if (userAssignedIdentities) {
      const userAssignedIdentitiesObj = {};
      for (const identity in userAssignedIdentities) {
        userAssignedIdentitiesObj[identity] = {};
      }
      return {
        type: ACRManagedIdentityType.systemAssigned + ', ' + ACRManagedIdentityType.userAssigned,
        userAssignedIdentities: userAssignedIdentitiesObj,
      };
    } else {
      return {
        type: ACRManagedIdentityType.systemAssigned,
      };
    }
  }
}
