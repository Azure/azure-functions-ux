import { SiteTabComponent } from './../../site-dashboard/site-tab/site-tab.component';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { DefaultDocumentsConfig } from './../../../shared/models/arm/default-documents-config'
import { SaveResult } from './../site-config.component';
import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
  selector: 'default-documents',
  templateUrl: './default-documents.component.html',
  styleUrls: ['./../site-config.component.scss']
})
export class DefaultDocumentsComponent implements OnChanges, OnDestroy {
  public debug = false; //for debugging

  public Resources = PortalResources;
  public groupArray: FormArray;

  private _resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;

  private _busyState: BusyStateComponent;
  private _busyStateScopeManager: BusyStateScopeManager;

  private _saveError: string;

  private _requiredValidator: RequiredValidator;
  private _uniqueDocumentValidator: UniqueValidator;

  private _defaultDocsArm: ArmObj<DefaultDocumentsConfig>;

  public loadingFailureMessage: string;

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _authZService: AuthzService,
    siteTabComponent: SiteTabComponent
  ) {
    this._busyState = siteTabComponent.busyState;
    this._busyStateScopeManager = this._busyState.getScopeManager();

    this._resetPermissionsAndLoadingState();

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyStateScopeManager.setBusy();
        this._saveError = null;
        this._defaultDocsArm = null;
        this.groupArray = null;
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
          this.hasWritePermissions ?
            this._cacheService.postArm(`${this.resourceId}/config/web`, true) : Observable.of(null),
          (h, d) => ({ hasWritePermissions: h, defaultDocsResponse: d })
        )
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/default-documents", error);
        this._setupForm(this._defaultDocsArm);
        this.loadingFailureMessage = this._translateService.instant(PortalResources.loading);
        this.showPermissionsMessage = true;
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        if (r.hasWritePermissions) {
          this._defaultDocsArm = r.defaultDocsResponse.json();
          this._setupForm(this._defaultDocsArm);
        }
        this.showPermissionsMessage = true;
        this._busyStateScopeManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this._defaultDocsArm);
    }
  }

  ngOnDestroy(): void {
    if (this._resourceIdSubscription) {
      this._resourceIdSubscription.unsubscribe(); this._resourceIdSubscription = null;
    }
    this._busyStateScopeManager.dispose();
  }

  private _resetPermissionsAndLoadingState() {
    this.hasWritePermissions = true;
    this.permissionsMessage = "";
    this.showPermissionsMessage = false;
    this.loadingFailureMessage = "";
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
    if (!writePermission) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    }
    else if (readOnlyLock) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    }
    else {
      this.permissionsMessage = "";
    }

    this.hasWritePermissions = writePermission && !readOnlyLock;
  }


  private _setupForm(defaultDocsArm: ArmObj<DefaultDocumentsConfig>) {
    if (!!defaultDocsArm) {
      if (!this._saveError || !this.groupArray) {
        this.groupArray = this._fb.array([]);

        this._requiredValidator = new RequiredValidator(this._translateService);
        this._uniqueDocumentValidator = new UniqueValidator(
          "name",
          this.groupArray,
          this._translateService.instant(PortalResources.validation_duplicateError));

        if (defaultDocsArm.properties.defaultDocuments) {
          defaultDocsArm.properties.defaultDocuments.forEach(document => {
            this.groupArray.push(this._fb.group({
              name: [
                document,
                Validators.compose([
                  this._requiredValidator.validate.bind(this._requiredValidator),
                  this._uniqueDocumentValidator.validate.bind(this._uniqueDocumentValidator)])]
            }));
          })
        }
      }

      if (this.mainForm.contains("defaultDocs")) {
        this.mainForm.setControl("defaultDocs", this.groupArray);
      }
      else {
        this.mainForm.addControl("defaultDocs", this.groupArray);
      }
    }
    else {
      this.groupArray = null;
      if (this.mainForm.contains("defaultDocs")) {
        this.mainForm.removeControl("defaultDocs");
      }
    }

    this._saveError = null;
  }

  validate() {
    let defaultDocGroups = this.groupArray.controls;
    defaultDocGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for (let controlName in controls) {
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });
  }

  save(): Observable<SaveResult> {
    let defaultDocGroups = this.groupArray.controls;

    if (this.mainForm.valid) {
      let defaultDocsArm: ArmObj<DefaultDocumentsConfig> = JSON.parse(JSON.stringify(this._defaultDocsArm));
      defaultDocsArm.properties = {
        defaultDocuments: []
      };

      defaultDocGroups.forEach(group => {
        defaultDocsArm.properties.defaultDocuments.push((group as FormGroup).controls["name"].value);
      })

      return this._cacheService.putArm(`${this.resourceId}/config/web`, null, defaultDocsArm)
        .map(defaultDocsResponse => {
          this._defaultDocsArm = defaultDocsResponse.json();
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
    }
    else {
      let configGroupName = this._translateService.instant(PortalResources.feature_defaultDocumentsName);
      let failureMessage = this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
      return Observable.of({
        success: false,
        error: failureMessage
      });
    }
  }

  deleteDocument(group: FormGroup) {
    let defaultDocs = this.groupArray;
    let index = defaultDocs.controls.indexOf(group);
    if (index >= 0) {
      defaultDocs.markAsDirty();
      defaultDocs.removeAt(index);
      defaultDocs.updateValueAndValidity();
    }
  }

  addDocument() {
    let defaultDocs = this.groupArray;
    let group = this._fb.group({
      name: [
        null,
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueDocumentValidator.validate.bind(this._uniqueDocumentValidator)])],
      value: [null]
    });

    (<CustomFormGroup>group)._msStartInEditMode = true;
    defaultDocs.markAsDirty();
    defaultDocs.push(group);
  }
}
