import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PortalService } from './portal.service';
import 'rxjs/add/operator/map';

export interface IAuthzService {
  hasPermission(resourceId: string, requestedActions: string[]): Observable<boolean>;
  hasReadOnlyLock(resourceId: string): Observable<boolean>;
}

@Injectable()
export class AuthzService implements IAuthzService {
  public static readScope = './read';
  public static writeScope = './write';
  public static deleteScope = './delete';
  public static actionScope = './action';
  public static activeDirectoryWriteScope = 'Microsoft.Authorization/*/Write';
  public static permissionsSuffix = '/providers/microsoft.authorization/permissions';
  public static authSuffix = '/providers/Microsoft.Authorization/locks';

  constructor(private _portalService: PortalService) {}

  hasPermission(resourceId: string, requestedActions: string[]): Observable<boolean> {
    return this._portalService.hasPermission(resourceId, requestedActions).map(r => r);
  }

  hasReadOnlyLock(resourceId: string): Observable<boolean> {
    return this._portalService.hasLock(resourceId, 'ReadOnly').map(r => r);
  }
}
