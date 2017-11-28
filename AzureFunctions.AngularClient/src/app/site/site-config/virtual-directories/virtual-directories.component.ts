import { BroadcastService } from './../../../shared/services/broadcast.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { VirtualApplication, VirtualDirectory } from './../../../shared/models/arm/virtual-application';
import { SiteConfig } from './../../../shared/models/arm/site-config'
import { SaveOrValidationResult } from './../site-config.component';
import { LogCategories, KeyCodes } from 'app/shared/models/constants';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
  selector: 'virtual-directories',
  templateUrl: './virtual-directories.component.html',
  styleUrls: ['./../site-config.component.scss']
})
export class VirtualDirectoriesComponent implements OnChanges, OnDestroy {
  public Resources = PortalResources;
  public groupArray: FormArray;

  private _resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;
  public showReadOnlySettingsMessage: string;

  private _busyManager: BusyStateScopeManager;

  private _saveError: string;

  private _requiredValidator: RequiredValidator;
  private _uniqueValidator: UniqueValidator;

  private _webConfigArm: ArmObj<SiteConfig>;

  public loadingFailureMessage: string;
  public loadingMessage: string;

  public newItem: CustomFormGroup;
  public originalItemsDeleted: number;

  public keyCodes: KeyCodes = KeyCodes;

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _authZService: AuthzService,
    broadcastService: BroadcastService
  ) {
    this._busyManager = new BusyStateScopeManager(broadcastService, 'site-tabs');

    this._resetPermissionsAndLoadingState();

    this.newItem = null;
    this.originalItemsDeleted = 0;

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyManager.setBusy();
        this._saveError = null;
        this._webConfigArm = null;
        this.groupArray = null;
        this.newItem = null;
        this.originalItemsDeleted = 0;
        this._resetPermissionsAndLoadingState();
        return Observable.zip(
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId),
          (wp, rl) => ({ writePermission: wp, readOnlyLock: rl })
        )
      })
      .mergeMap(p => {
        this._setPermissions(p.writePermission, p.readOnlyLock);
        return Observable.zip(
          Observable.of(this.hasWritePermissions),
          this._cacheService.postArm(`${this.resourceId}/config/web`, true),
          (h, w) => ({ hasWritePermissions: h, webConfigResponse: w })
        )
      })
      .do(null, error => {
        this._logService.error(LogCategories.virtualDirectories, '/virtual-directories', error);
        this._setupForm(null);
        this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
        this.loadingMessage = null;
        this.showPermissionsMessage = true;
        this._busyManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._webConfigArm = r.webConfigResponse.json();
        this._setupForm(this._webConfigArm);
        this.loadingMessage = null;
        this.showPermissionsMessage = true;
        this._busyManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this._webConfigArm);
    }
  }

  ngOnDestroy(): void {
    if (this._resourceIdSubscription) {
      this._resourceIdSubscription.unsubscribe();
      this._resourceIdSubscription = null;
    }
    this._busyManager.clearBusy();
  }

  private _resetPermissionsAndLoadingState() {
    this.hasWritePermissions = true;
    this.permissionsMessage = '';
    this.showPermissionsMessage = false;
    this.showReadOnlySettingsMessage = this._translateService.instant(PortalResources.configViewReadOnlySettings);
    this.loadingFailureMessage = '';
    this.loadingMessage = this._translateService.instant(PortalResources.loading);
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
    if (!writePermission) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    } else if (readOnlyLock) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    } else {
      this.permissionsMessage = "";
    }

    this.hasWritePermissions = writePermission && !readOnlyLock;
  }

  private _setupForm(webConfigArm: ArmObj<SiteConfig>) {
    if (!!webConfigArm) {
      if (!this._saveError || !this.groupArray) {
        this.newItem = null;
        this.originalItemsDeleted = 0;
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);
        this._uniqueValidator = new UniqueValidator(
          "virtualPath",
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError),
          this._getNormalizedVirtualPath);

        if (webConfigArm.properties.virtualApplications) {
          webConfigArm.properties.virtualApplications.forEach(virtualApplication => {
            this._addVDirToGroup(
              virtualApplication.virtualPath,
              virtualApplication.physicalPath,
              true
            );
            if (virtualApplication.virtualDirectories) {
              virtualApplication.virtualDirectories.forEach(virtualDirectory => {
                this._addVDirToGroup(
                  this._combinePaths(virtualApplication.virtualPath, virtualDirectory.virtualPath),
                  virtualDirectory.physicalPath,
                  false
                );
              })
            }
          })
        }

        this._validateAllControls(this.groupArray.controls as CustomFormGroup[]);
      }

      if (this.mainForm.contains("virtualDirectories")) {
        this.mainForm.setControl("virtualDirectories", this.groupArray);
      } else {
        this.mainForm.addControl("virtualDirectories", this.groupArray);
      }
    } else {
      this.newItem = null;
      this.originalItemsDeleted = 0;
      this.groupArray = null;
      if (this.mainForm.contains("virtualDirectories")) {
        this.mainForm.removeControl("virtualDirectories");
      }
    }

    this._saveError = null;
  }

  private _getNormalizedVirtualPath(virtualPath: string): string {
    if (virtualPath && virtualPath !== '/') {
      if (virtualPath.endsWith('/')) {
        virtualPath = virtualPath.slice(0, -1);
      }

      if (!virtualPath.startsWith('/')) {
        virtualPath = '/' + virtualPath;
      }
    }

    return virtualPath;
  }

  private _addVDirToGroup(virtualPath: string, physicalPath: string, isApplication: boolean) {
    let group = this._fb.group({
      virtualPath: [
        { value: virtualPath, disabled: !this.hasWritePermissions },
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueValidator.validate.bind(this._uniqueValidator)])],
      physicalPath: [
        { value: physicalPath, disabled: !this.hasWritePermissions },
        this._requiredValidator.validate.bind(this._requiredValidator)],
      isApplication: [{ value: isApplication, disabled: !this.hasWritePermissions }]
    }) as CustomFormGroup;

    group.msExistenceState = 'original';
    this.groupArray.push(group);
  }

  private _combinePaths(basePath: string, subPath: string): string {
    const basePathAdjusted = (basePath && basePath.endsWith('/')) ? basePath : basePath + '/';
    const subPathAdjusted = (subPath && subPath.startsWith('/')) ? subPath.substring(1) : subPath;
    return basePathAdjusted + subPathAdjusted;
  }

  validate(): SaveOrValidationResult {
    let groups = this.groupArray.controls;

    // Purge any added entries that were never modified
    for (let i = groups.length - 1; i >= 0; i--) {
      let group = groups[i] as CustomFormGroup;
      if (group.msStartInEditMode && group.pristine) {
        groups.splice(i, 1);
        if (group === this.newItem) {
          this.newItem = null;
        }
      }
    }

    this._validateAllControls(groups as CustomFormGroup[]);

    return {
      success: this.groupArray.valid,
      error: this.groupArray.valid ? null : this._validationFailureMessage()
    };
  }

  private _validateAllControls(groups: CustomFormGroup[]) {
    groups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for (let controlName in controls) {
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });
  }

  save(): Observable<SaveOrValidationResult> {
    // Don't make unnecessary PATCH call if these settings haven't been changed
    if (this.groupArray.pristine) {
      return Observable.of({
        success: true,
        error: null
      });
    } else if (this.mainForm.contains("virtualDirectories") && this.mainForm.controls["virtualDirectories"].valid) {
      let virtualDirGroups = this.groupArray.controls;

      let webConfigArm: ArmObj<any> = JSON.parse(JSON.stringify(this._webConfigArm));
      webConfigArm.properties = {};

      const virtualApplications: VirtualApplication[] = [];
      const virtualDirectories: VirtualDirectory[] = [];

      virtualDirGroups.forEach(group => {
        if ((group as CustomFormGroup).msExistenceState !== 'deleted') {
          const formGroup = (group as FormGroup);
          if (formGroup.controls["isApplication"].value) {
            virtualApplications.push({
              virtualPath: this._getNormalizedVirtualPath(formGroup.controls["virtualPath"].value),
              physicalPath: formGroup.controls["physicalPath"].value,
              virtualDirectories: []
            });
          } else {
            virtualDirectories.push({
              virtualPath: this._getNormalizedVirtualPath(formGroup.controls["virtualPath"].value),
              physicalPath: formGroup.controls["physicalPath"].value
            });
          }
        }
      })

      //TODO: Prevent savinng config with no applictions defined
      //if (virtualApplications.length === 0) { //DO SOMETHING - MAYBE HANDLE IN FRORM VALIDATION }
      virtualApplications.sort((a, b) => { return b.virtualPath.length - a.virtualPath.length; });

      virtualDirectories.forEach(virtualDirectory => {
        let appFound = false;
        const dirPathLen = virtualDirectory.virtualPath.length;
        for (let i = 0; i < virtualApplications.length && !appFound; i++) {
          const appPathLen = virtualApplications[i].virtualPath.length;
          if (appPathLen < dirPathLen && virtualDirectory.virtualPath.startsWith(virtualApplications[i].virtualPath)) {
            appFound = true;
            virtualDirectory.virtualPath = virtualDirectory.virtualPath.substring(appPathLen);
            virtualApplications[i].virtualDirectories.push(virtualDirectory);
          }
        }
        //TODO: Prevent saving config with "orphan" virtual directory
        //if (!parentFound) { // DO SOMETHING }
      })

      webConfigArm.properties.virtualApplications = virtualApplications;
      return this._cacheService.patchArm(`${this.resourceId}/config/web`, null, webConfigArm)
        .map(webConfigResponse => {
          this._webConfigArm = webConfigResponse.json();
          return {
            success: true,
            error: null
          };
        })
        .catch(error => {
          this._saveError = error._body;
          return Observable.of({
            success: false,
            error: error._body
          });
        });
    } else {
      let failureMessage = this._validationFailureMessage();
      this._saveError = failureMessage;
      return Observable.of({
        success: false,
        error: failureMessage
      });
    }
  }

  private _validationFailureMessage(): string {
    const configGroupName = this._translateService.instant(PortalResources.feature_virtualDirectoriesName);
    return this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
  }

  deleteItem(group: FormGroup) {
    let groups = this.groupArray;
    let index = groups.controls.indexOf(group);
    if (index >= 0) {
      if ((group as CustomFormGroup).msExistenceState === 'original') {
        this._deleteOriginalItem(groups, group);
      } else {
        this._deleteAddedItem(groups, group, index);
      }
    }
  }

  private _deleteOriginalItem(groups: FormArray, group: FormGroup) {
    // Keep the deleted group around with its state set to dirty.
    // This keeps the overall state of this.groupArray and this.mainForm dirty.
    group.markAsDirty();

    // Set the group.msExistenceState to 'deleted' so we know to ignore it when validating and saving.
    (group as CustomFormGroup).msExistenceState = 'deleted';

    // Force the deleted group to have a valid state by clear all validators on the controls and then running validation.
    for (let key in group.controls) {
      const control = group.controls[key];
      control.clearAsyncValidators();
      control.clearValidators();
      control.updateValueAndValidity();
    }

    this.originalItemsDeleted++;

    groups.updateValueAndValidity();
  }

  private _deleteAddedItem(groups: FormArray, group: FormGroup, index: number) {
    // Remove group from groups
    groups.removeAt(index);
    if (group === this.newItem) {
      this.newItem = null;
    }

    // If group was dirty, then groups is also dirty.
    // If all the remaining controls in groups are pristine, mark groups as pristine.
    if (!group.pristine) {
      let pristine = true;
      for (let control of groups.controls) {
        pristine = pristine && control.pristine;
      }

      if (pristine) {
        groups.markAsPristine();
      }
    }

    groups.updateValueAndValidity();
  }

  addItem() {
    let groups = this.groupArray;

    this.newItem = this._fb.group({
      virtualPath: [
        null,
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueValidator.validate.bind(this._uniqueValidator)])],
      physicalPath: [
        null,
        this._requiredValidator.validate.bind(this._requiredValidator)],
      isApplication: [false]
    }) as CustomFormGroup;

    this.newItem.msExistenceState = 'new';
    this.newItem.msStartInEditMode = true;
    groups.push(this.newItem);
  }
}
