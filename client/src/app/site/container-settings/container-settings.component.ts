import { Component, OnDestroy, Input, Injector, ViewChild, ElementRef } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ContainerSettingsInput, ContainerSettingsData, Container, ContainerConfigureData } from './container-settings';
import { Observable } from 'rxjs/Observable';
import { ContainerSettingsManager } from './container-settings-manager';
import { KeyCodes, LogCategories } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';
import { SiteService } from '../../shared/services/site.service';
import { HttpResult } from '../../shared/models/http-result';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { ApplicationSettings } from '../../shared/models/arm/application-settings';
import { SiteConfig } from '../../shared/models/arm/site-config';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { FormGroup, FormControl } from '@angular/forms';
import { LogService } from '../../shared/services/log.service';
import { errorIds } from '../../shared/models/error-ids';
import { ErrorEvent } from '../../shared/models/error-event';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { PortalService } from '../../shared/services/portal.service';

export interface StatusMessage {
    message: string;
    level: 'error' | 'success';
  }

@Component({
    selector: 'container-settings',
    templateUrl: './container-settings.component.html',
    styleUrls: ['./container-settings.component.scss'],
})
export class ContainerSettingsComponent extends FeatureComponent<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>> implements OnDestroy {
    @ViewChild('containerSettingsTabs') containerSettingsTabs: ElementRef;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>) {
        this.setInput(viewInfo);
        this._viewInfo = viewInfo;
    }

    public containerConfigureInfo: ContainerConfigureData;
    public applyButtonDisabled = false;
    public savevButtonDisabled = false;
    public discardButtonDisabled = false;
    public isUpdating = false;
    public fromMenu = false;
    public loading = true;
    public form: FormGroup;
    public statusMessage: StatusMessage;
    private _viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>;

    constructor(
        private _siteService: SiteService,
        private _logService: LogService,
        private _ts: TranslateService,
        private _portalService: PortalService,
        public containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('ContainerSettingsComponent', injector, 'dashboard');

        this.isParentComponent = true;
        this.featureName = 'ContainerSettings';
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    protected setup(inputEvents: Observable<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>>) {
        return inputEvents
            .concatMap((r): Observable<any[]> => {
                this.containerConfigureInfo = { ...r.data.data, container: null, form: null, containerForm: null };
                this.fromMenu = !!this.containerConfigureInfo.fromMenu;
                this.containerSettingsManager.resetSettings(this.containerConfigureInfo);

                if (this.fromMenu) {
                    return Observable.zip(
                        this._siteService.getAppSettings(this.containerConfigureInfo.resourceId),
                        this._siteService.getSiteConfig(this.containerConfigureInfo.resourceId),
                        this._siteService.getPublishingCredentials(this.containerConfigureInfo.resourceId));
                } else {
                    return Observable.zip(Observable.of(r.data.data));
                }
            })
            .do(r => {
                if (this.fromMenu) {
                    const appSettingsResponse: HttpResult<ArmObj<ApplicationSettings>> = r[0];
                    const siteConfigResponse: HttpResult<ArmObj<SiteConfig>> = r[1];
                    const publishingCredentialsResponse: HttpResult<ArmObj<PublishingCredentials>> = r[2];

                    if (appSettingsResponse.isSuccessful
                        && siteConfigResponse.isSuccessful
                        && publishingCredentialsResponse.isSuccessful) {
                        this.containerSettingsManager.initializeForConfig(
                            this.containerConfigureInfo.os,
                            appSettingsResponse.result.properties,
                            siteConfigResponse.result.properties,
                            publishingCredentialsResponse.result.properties);
                    } else {
                        if (!appSettingsResponse.isSuccessful) {
                            this._logService.error(LogCategories.containerSettings, errorIds.failedToGetAppSettings, appSettingsResponse.error);
                        }

                        if (!siteConfigResponse.isSuccessful) {
                            this._logService.error(LogCategories.containerSettings, errorIds.failedToGetSiteConfig, siteConfigResponse.error);
                        }

                        if (!publishingCredentialsResponse.isSuccessful) {
                            this._logService.error(LogCategories.containerSettings, errorIds.failedToGetPublishingCredentials, publishingCredentialsResponse.error);
                        }

                        const error: ErrorEvent = {
                            errorId: errorIds.failedToGetContainerConfigData,
                            resourceId: this.containerConfigureInfo.resourceId,
                            message: this._ts.instant(PortalResources.failedToGetContainerConfigData),
                        };
                        this.showComponentError(error);
                    }
                } else {
                    this.containerSettingsManager.initializeForCreate(this.containerConfigureInfo.os, this.containerConfigureInfo.containerFormData);
                }

                this.form = this.containerSettingsManager.form;
                this.containerConfigureInfo.form = this.form;

                this.containerConfigureInfo.container = this.containerSettingsManager.containers
                    .find(c => c.id === this.form.controls.containerType.value);

                this.containerConfigureInfo.containerForm = this.containerSettingsManager.getContainerForm(
                    this.form,
                    this.containerConfigureInfo.container.id);

                this.loading = false;
            });
    }

    public selectContainer(container: Container) {
        this.form.controls.containerType.setValue(container.id);
        this.containerConfigureInfo.containerForm = this.containerSettingsManager.getContainerForm(this.form, container.id);
        this.containerConfigureInfo.container = container;
    }

    public onContainerTabKeyPress(event: KeyboardEvent) {
        const containers = this.containerSettingsManager.containers;
        if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowLeft) {
            let curIndex = containers.findIndex(container => container === this.containerConfigureInfo.container);
            const tabElements = this._getTabElements();
            this._updateContainerFocusTab(false, tabElements, curIndex);

            if (event.keyCode === KeyCodes.arrowRight) {
                curIndex = this._getTargetIndex(containers, curIndex + 1);
            } else {
                curIndex = this._getTargetIndex(containers, curIndex - 1);
            }

            this.selectContainer(containers[curIndex]);
            this._updateContainerFocusTab(true, tabElements, curIndex);

            event.preventDefault();
        }
    }

    public clickApply() {
        this.statusMessage = null;
        this._markFormGroupDirtyAndValidate(this.form);
        if (this.form.valid) {
            const data = this.containerSettingsManager.containerFormData;
            this._portalService.returnPcv3Results<string>(JSON.stringify(data));
        } else {
            this.statusMessage = {
                level: 'error',
                message: this._ts.instant(PortalResources.formIsInvalid),
            };
        }
    }

    public clickSave() {
        this.statusMessage = null;
        this._markFormGroupDirtyAndValidate(this.form);
        if (this.form.valid) {
            const data = this.containerSettingsManager.containerFormData;
            this._portalService.updateDirtyState(true, this._ts.instant(PortalResources.clearDirtyConfirmation));
            this.isUpdating = true;

            this.containerSettingsManager
                .saveContainerConfig(this.containerConfigureInfo.resourceId, this.containerConfigureInfo.os, data)
                .catch(error => {
                    this.isUpdating = false;
                    this.statusMessage = {
                        level: 'error',
                        message: error.message,
                    };

                    return Observable.of(false);
                })
                .subscribe(updateSuccess => {
                    this._portalService.updateDirtyState(!updateSuccess);
                    this.isUpdating = false;

                    if (updateSuccess) {
                        this.statusMessage = {
                            level: 'success',
                            message: this._ts.instant(PortalResources.containerSettingsUpdateSuccess),
                        };
                    }
                });
        } else {
            this.statusMessage = {
                level: 'error',
                message: this._ts.instant(PortalResources.errorsInContainerSettings),
            };
        }
    }

    public clickDiscard() {
        this.setInput(this._viewInfo);
    }

    private _getTargetIndex(containers: Container[], targetIndex: number) {
        if (targetIndex < 0) {
            targetIndex = containers.length - 1;
        } else if (targetIndex >= containers.length) {
            targetIndex = 0;
        }

        return targetIndex;
    }

    private _getTabElements() {
        return this.containerSettingsTabs.nativeElement.children;
    }

    private _updateContainerFocusTab(set: boolean, elements: HTMLCollection, index: number) {
        const tab = Dom.getTabbableControl(<HTMLElement>elements[index]);

        if (set) {
            Dom.setFocus(tab);
        } else {
            Dom.clearFocus(tab);
        }
    }

    private _markFormGroupDirtyAndValidate(formGroup: FormGroup) {
        if (formGroup.controls) {
            const keys = Object.keys(formGroup.controls);
            for (let i = 0; i < keys.length; i++) {
                const control = formGroup.controls[keys[i]];
                if (control.enabled) {
                    if (control instanceof FormControl) {
                        control.markAsDirty();
                        control.updateValueAndValidity();
                    } else if (control instanceof FormGroup) {
                        this._markFormGroupDirtyAndValidate(control);
                    }
                }
            }
        }
    }
}
