import MakeArmCall from '../ApiHelpers/ArmHelper';
import { CommonConstants } from './CommonConstants';
import { HttpResponseObject } from '../ArmHelper.types';
import { ArmObj, ArmArray } from '../models/arm-obj';

export interface Permissions {
  actions: string[];
  notActions: string[];
}

export interface PermissionsAsRegExp {
  actions: RegExp[];
  notActions: RegExp[];
}

export interface Lock {
  level: string;
  notes: string;
}

export interface IAuthzService {
  hasPermission(resourceId: string, requestedActions: string[]): Promise<boolean>;
  hasReadOnlyLock(resourceId: string): Promise<boolean>;
}

export default class RbacHelper {
  public static readScope = './read';
  public static writeScope = './write';
  public static deleteScope = './delete';
  public static actionScope = './action';
  public static activeDirectoryWriteScope = 'Microsoft.Authorization/*/Write';
  public static permissionsSuffix = '/providers/microsoft.authorization/permissions';
  public static authSuffix = '/providers/Microsoft.Authorization/locks';
  public static _wildCardEscapeSequence = '\\*';
  public static async hasPermission(resourceId: string, requestedActions: string[]): Promise<boolean> {
    const authId = `${resourceId}${this.permissionsSuffix}`;
    try {
      const permissionsSetCall = await MakeArmCall<any>({
        resourceId: authId,
        commandName: 'RbacCheck',
        skipBuffer: false,
        apiVersion: CommonConstants.ApiVersions.armRbacApiVersion,
      });
      const t = this.checkPermissions(resourceId, requestedActions, permissionsSetCall.data.value);
      return t;
    } catch (e) {
      return false;
    }
  }

  public static async hasReadOnlyLock(resourceId: string): Promise<boolean> {
    try {
      const readOnlyLocks = await this.getLocks(resourceId);
      return !!readOnlyLocks.find(l => {
        return (
          l.properties.level === 'ReadOnly' &&
          l.id.split('/providers/')[1].toLocaleLowerCase() === resourceId.split('/providers/')[1].toLocaleLowerCase()
        );
      });
    } catch (e) {
      return false;
    }
  }

  public static isNoAccessResponse(response: HttpResponseObject<any>) {
    return response.metadata.error && (response.metadata.error === 401 || response.metadata.error === 403);
  }

  private static async getLocks(resourceId: string): Promise<ArmObj<Lock>[]> {
    const lockId = `${resourceId}${RbacHelper.authSuffix}`;
    const logCall = await MakeArmCall<ArmArray<Lock>>({
      resourceId: lockId,
      commandName: 'getLocks',
      apiVersion: CommonConstants.ApiVersions.armLocksApiVersion,
    });

    return logCall.data.value;
  }

  private static getResourceType(resourceId: string) {
    const parts = resourceId.split('/').filter(part => !!part);
    let resourceType = parts[5];
    for (let i = 6; i < parts.length; i += 2) {
      resourceType = `${resourceType}/${parts[i]}`;
    }

    return resourceType;
  }

  private static checkPermissions(resourceId: string, requestedActions: string[], permissionsSet: Permissions[]) {
    if (!requestedActions || !permissionsSet || permissionsSet.length === 0) {
      // If there are no requested actions or no available actions the caller has no permissions
      return false;
    }

    const resourceType = this.getResourceType(resourceId);
    const permissionSetRegexes = permissionsSet.map(permission => {
      return this.permissionsToRegExp(permission);
    });

    return requestedActions.every(action => {
      let actionN = action;
      if (actionN.length > 1 && actionN.charAt(0) === '.' && actionN.charAt(1) === '/') {
        // Special case: turn leading ./ to {resourceType}/ for formatting.
        actionN = resourceType + action.substring(1);
      }

      return !!permissionSetRegexes.find(availableRegex => {
        return this.isAllowed(actionN, availableRegex);
      });
    });
  }

  private static permissionsToRegExp(permissions: Permissions): PermissionsAsRegExp {
    const actions = permissions.actions.map(pattern => {
      return this.convertWildCardPatternToRegex(pattern);
    });

    const notActions = permissions.notActions.map(pattern => {
      return this.convertWildCardPatternToRegex(pattern);
    });

    return {
      actions,
      notActions,
    };
  }

  /*
   * 1. All allowed character escapes are taken into account: \*, \t, \n, \r, \\, \'
   *    a. \0 is explicitly not supported
   * 2. All non-escaped wildcards match 0 or more characters of anything
   * 3. The entire wildcard pattern is matched from beginning to end, and no more (e.g., a*d matches add but not adding or bad).
   * 4. The pattern matching should be case insensitive.
   */
  private static convertWildCardPatternToRegex(wildCardPattern: string): RegExp {
    const wildCardPatternNew = wildCardPattern.replace(this._wildCardEscapeSequence, '\0'); // sentinel for escaped wildcards
    const regex = this.escapeRegExp(wildCardPatternNew) // escape the rest of the regex
      .replace(this._wildCardEscapeSequence, '.*') // the previous command escaped legitimate wildcards - replace them with Regex wildcards
      .replace('\0', this._wildCardEscapeSequence) // replace sentinels with truly escaped wildcards
      .replace('\\t', '\t') // tabs
      .replace('\\n', '\n') // newlines
      .replace('\\r', '\r') // carriage returns
      .replace('\\\\', '\\') // backslashes
      .replace("\\'", "'"); // single quotes
    return new RegExp(`^${regex}$`, 'i'); // perform case insensitive compares
  }

  // Escape reserved regex characters so that they are not interpreted by regex evaluation.
  private static escapeRegExp(regex: string): string {
    return regex.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  }

  private static isAllowed(requestedAction: string, permission: PermissionsAsRegExp): boolean {
    const actionAllowed = !!permission.actions.find(action => {
      return action.test(requestedAction);
    });
    const actionDenied = !!permission.notActions.find(notAction => {
      return notAction.test(requestedAction);
    });

    return actionAllowed && !actionDenied;
  }
}
