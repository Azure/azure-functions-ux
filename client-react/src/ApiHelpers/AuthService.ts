import { ArmArray, ArmObj, MsiIdentity } from '../models/arm-obj';
import { ManagedIdentityType, RoleAssignment } from '../pages/app/deployment-center/DeploymentCenter.types';
import { CommonConstants } from '../utils/CommonConstants';
import { Guid } from '../utils/Guid';

import MakeArmCall from './ArmHelper';

export default class AuthService {
  public static async hasRoleAssignment(roleDefinitionId: string, roleAssignments: ArmObj<RoleAssignment>[]) {
    return roleAssignments.some(assignment => {
      const assignmentId = assignment.properties.roleDefinitionId.split(CommonConstants.singleForwardSlash).pop();
      return assignmentId === roleDefinitionId;
    });
  }

  public static async getRoleAssignmentsWithScope(
    scope: string,
    principalId: string,
    apiVersion: string = CommonConstants.ApiVersions.roleAssignmentApiVersion20180701
  ) {
    const resourceString = `${scope}/providers/Microsoft.Authorization/roleAssignments?`;
    const queryString = `$filter=atScope()+and+assignedTo('{${principalId}}')`;
    const resourceId = resourceString + queryString;

    return await MakeArmCall<ArmArray<RoleAssignment>>({
      resourceId,
      commandName: 'getRoleAssignments',
      apiVersion: apiVersion,
    });
  }

  public static async putRoleAssignmentWithScope(
    roleDefinitionId: string,
    scope: string,
    principalId: string,
    principalType?: string,
    apiVersion: string = CommonConstants.ApiVersions.roleAssignmentApiVersion20180901Preview
  ) {
    const roleGuid = Guid.newGuid();
    const resourceString = `${scope}/providers/Microsoft.Authorization/roleAssignments/${roleGuid}?`;
    const queryString = `&$filter=atScope()+and+assignedTo('{${principalId}}')`;
    const resourceId = resourceString + queryString;

    const body = {
      properties: {
        roleDefinitionId: `${scope}/providers/Microsoft.Authorization/roleDefinitions/${roleDefinitionId}`,
        principalId,
        principalType,
      },
    };

    return await MakeArmCall({
      body,
      resourceId,
      commandName: 'setRoleAssignment',
      apiVersion: apiVersion,
      method: 'PUT',
    });
  }

  public static async enableSystemAssignedIdentity(
    resourceId: string,
    identity?: MsiIdentity,
    apiVersion: string = CommonConstants.ApiVersions.enableSystemAssignedIdentityApiVersion20210201
  ) {
    return await MakeArmCall({
      resourceId,
      commandName: 'enableSystemAssignedIdentity',
      method: 'PATCH',
      apiVersion: apiVersion,
      body: {
        identity: this._getIdentity(identity) as MsiIdentity,
      },
    });
  }

  private static _getIdentity(identity?: MsiIdentity) {
    if (identity?.userAssignedIdentities) {
      return {
        type: ManagedIdentityType.systemAssigned + ', ' + ManagedIdentityType.userAssigned,
        userAssignedIdentities: identity.userAssignedIdentities,
      };
    } else {
      return {
        type: ManagedIdentityType.systemAssigned,
      };
    }
  }
}
