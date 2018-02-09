import { FeatureComponent } from 'app/shared/components/feature-component';
import { LogCategories } from './../../../shared/models/constants';
import { Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { VirtualApplication, VirtualDirectory } from './../../../shared/models/arm/virtual-application';
import { SiteConfig } from './../../../shared/models/arm/site-config';
import { SaveOrValidationResult } from './../site-config.component';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ResourceId } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { ConfigTableWrapperComponent } from './../config-table-wrapper/config-table-wrapper.component';

@Component({
    selector: 'virtual-directories',
    templateUrl: './virtual-directories.component.html',
    styleUrls: ['./../site-config.component.scss']
})
export class VirtualDirectoriesComponent extends FeatureComponent<ResourceId> implements OnChanges, OnDestroy {
    @Input() mainForm: FormGroup;
    @Input() resourceId: ResourceId;

    public Resources = PortalResources;
    public groupArray: FormArray;
    public hasWritePermissions: boolean;
    public permissionsMessage: string;
    public showPermissionsMessage: boolean;
    public showReadOnlySettingsMessage: string;
    public loadingFailureMessage: string;
    public loadingMessage: string;
    public getNewItem: () => CustomFormGroup;

    private _busyManager: BusyStateScopeManager;
    private _saveError: string;
    private _requiredValidator: RequiredValidator;
    private _uniqueValidator: UniqueValidator;
    private _webConfigArm: ArmObj<SiteConfig>;

    @ViewChild(ConfigTableWrapperComponent) configTableWrapper: ConfigTableWrapperComponent;

    constructor(
        private _cacheService: CacheService,
        private _fb: FormBuilder,
        private _translateService: TranslateService,
        private _logService: LogService,
        private _authZService: AuthzService,
        injector: Injector
    ) {
        super('VirtualDirectoriesComponent', injector);
        this._busyManager = new BusyStateScopeManager(this._broadcastService, 'site-tabs');

        this.getNewItem =
            () => {
                return (this._fb.group({
                    virtualPath: [
                        null,
                        Validators.compose([
                            this._requiredValidator.validate.bind(this._requiredValidator),
                            this._uniqueValidator.validate.bind(this._uniqueValidator)])],
                    physicalPath: [
                        null,
                        this._requiredValidator.validate.bind(this._requiredValidator)],
                    isApplication: [false]
                }) as CustomFormGroup);
            };

        this._resetPermissionsAndLoadingState();
    }

    protected setup(inputEvents: Observable<ResourceId>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(() => {
                this._busyManager.setBusy();
                this._saveError = null;
                this._webConfigArm = null;
                this.groupArray = null;
                this._resetPermissionsAndLoadingState();
                return Observable.zip(
                    this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(this.resourceId),
                    (wp, rl) => ({ writePermission: wp, readOnlyLock: rl })
                );
            })
            .mergeMap(p => {
                this._setPermissions(p.writePermission, p.readOnlyLock);
                return Observable.zip(
                    Observable.of(this.hasWritePermissions),
                    this._cacheService.getArm(`${this.resourceId}/config/web`, true),
                    (h, w) => ({ hasWritePermissions: h, webConfigResponse: w })
                );
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
            .do(r => {
                this._webConfigArm = r.webConfigResponse.json();
                this._setupForm(this._webConfigArm);
                this.loadingMessage = null;
                this.showPermissionsMessage = true;
                this._busyManager.clearBusy();
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resourceId']) {
            this.setInput(this.resourceId);
        }
        if (changes['mainForm'] && !changes['resourceId']) {
            this._setupForm(this._webConfigArm);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
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
            this.permissionsMessage = '';
        }

        this.hasWritePermissions = writePermission && !readOnlyLock;
    }

    private _setupForm(webConfigArm: ArmObj<SiteConfig>) {
        if (!!webConfigArm) {
            if (!this._saveError || !this.groupArray) {
                this.groupArray = this._fb.array([]);

                this._requiredValidator = new RequiredValidator(this._translateService);
                this._uniqueValidator = new UniqueValidator(
                    'virtualPath',
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
                            });
                        }
                    });
                }
            }

            if (this.mainForm.contains('virtualDirectories')) {
                this.mainForm.setControl('virtualDirectories', this.groupArray);
            } else {
                this.mainForm.addControl('virtualDirectories', this.groupArray);
            }
        } else {
            this.groupArray = null;
            if (this.mainForm.contains('virtualDirectories')) {
                this.mainForm.removeControl('virtualDirectories');
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
        const group = this._fb.group({
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
        const result = {
            success: false,
            error: this._validationFailureMessage()
        };

        if (this.configTableWrapper && this.configTableWrapper.configTable) {
            this.configTableWrapper.configTable.purgePristineNewItems();
            this.configTableWrapper.configTable.validateAllControls();

            if (this.groupArray.valid) {
                result.success = true;
                result.error = null;
            }
        }

        return result;
    }

    save(): Observable<SaveOrValidationResult> {
        // Don't make unnecessary PATCH call if these settings haven't been changed
        if (this.groupArray.pristine) {
            return Observable.of({
                success: true,
                error: null
            });
        } else if (this.mainForm.contains('virtualDirectories') && this.mainForm.controls['virtualDirectories'].valid) {
            const virtualDirGroups = this.groupArray.controls;

            const webConfigArm: ArmObj<any> = JSON.parse(JSON.stringify(this._webConfigArm));
            webConfigArm.properties = {};

            const virtualApplications: VirtualApplication[] = [];
            const virtualDirectories: VirtualDirectory[] = [];

            virtualDirGroups.forEach(group => {
                if ((group as CustomFormGroup).msExistenceState !== 'deleted') {
                    const formGroup = (group as FormGroup);
                    if (formGroup.controls['isApplication'].value) {
                        virtualApplications.push({
                            virtualPath: this._getNormalizedVirtualPath(formGroup.controls['virtualPath'].value),
                            physicalPath: formGroup.controls['physicalPath'].value,
                            virtualDirectories: []
                        });
                    } else {
                        virtualDirectories.push({
                            virtualPath: this._getNormalizedVirtualPath(formGroup.controls['virtualPath'].value),
                            physicalPath: formGroup.controls['physicalPath'].value
                        });
                    }
                }
            });

            // TODO: Prevent savinng config with no applictions defined
            // if (virtualApplications.length === 0) { //DO SOMETHING - MAYBE HANDLE IN FRORM VALIDATION }
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
                // TODO: Prevent saving config with "orphan" virtual directory
                // if (!parentFound) { // DO SOMETHING }
            });

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
            const failureMessage = this._validationFailureMessage();
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
}
