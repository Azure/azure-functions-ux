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
  public static slotswapScope = './slotsswap/action';
  public static applySlotConfigScope = './applySlotConfig/action';
  public static resetSlotConfigScope = './resetSlotConfig/action';
  public static activeDirectoryWriteScope = 'Microsoft.Authorization/*/Write';
  public static websiteContributorScope = 'Microsoft.web/sites/*';

  constructor(private _portalService: PortalService) {}

  hasPermission(resourceId: string, requestedActions: string[]): Observable<boolean> {
    return this._portalService.hasPermission(resourceId, requestedActions);
  }

  hasReadOnlyLock(resourceId: string): Observable<boolean> {
    return this._portalService.hasLock(resourceId, 'ReadOnly');
  }
}
