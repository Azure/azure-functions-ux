import { Component, OnDestroy, Input, Injector, ViewChild, ElementRef } from '@angular/core';
import { FeatureComponent } from '../../shared/components/feature-component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ContainerSettingsInput, ContainerSettingsData, Container } from './container-settings';
import { Observable } from 'rxjs/Observable';
import { ContainerSettingsManager } from './container-settings-manager';
import { ContainerConfigureComponent } from './container-configure/container-configure.component';
import { KeyCodes } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';
import { SiteService } from '../../shared/services/site.service';
import { HttpResult } from '../../shared/models/http-result';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { ApplicationSettings } from '../../shared/models/arm/application-settings';
import { SiteConfig } from '../../shared/models/arm/site-config';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';

@Component({
    selector: 'container-settings',
    templateUrl: './container-settings.component.html',
    styleUrls: ['./container-settings.component.scss'],
})
export class ContainerSettingsComponent extends FeatureComponent<TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>> implements OnDestroy {
    @ViewChild(ContainerConfigureComponent) containerConfigureComponent: ContainerConfigureComponent;
    @ViewChild('containerSettingsTabs') containerSettingsTabs: ElementRef;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>>) {
        this.setInput(viewInfo);
    }

    public containerSettingsInfo: ContainerSettingsData;
    public selectedContainer: Container;
    public applyButtonDisabled = false;
    public savevButtonDisabled = false;
    public discardButtonDisabled = false;
    public isUpdating = false;
    public fromMenu = false;
    public loading = true;

    constructor(
        private _siteService: SiteService,
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
            .distinctUntilChanged()
            .concatMap((r): Observable<any[]> => {
                this.containerSettingsInfo = r.data.data;
                this.fromMenu = !!this.containerSettingsInfo.fromMenu;
                this.containerSettingsManager.resetSettings(r.data);

                if (this.fromMenu) {
                    return Observable.zip(
                        this._siteService.getAppSettings(this.containerSettingsInfo.resourceId),
                        this._siteService.getSiteConfig(this.containerSettingsInfo.resourceId),
                        this._siteService.getPublishingCredentials(this.containerSettingsInfo.resourceId));
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
                            this.containerSettingsInfo.os,
                            appSettingsResponse.result.properties,
                            siteConfigResponse.result.properties,
                            publishingCredentialsResponse.result.properties);
                    }
                } else {
                    this.containerSettingsManager.initializeForCreate(this.containerSettingsInfo.os);
                }

                this._setSelectedContainer();

                this.containerSettingsManager.form.controls.containerType.valueChanges.subscribe(value => {
                    this._setSelectedContainer();
                });

                this.loading = false;
            });
    }

    public selectContainer(container: Container) {
        this.containerSettingsManager.form.controls.containerType.setValue(container.id);
    }

    public onContainerTabKeyPress(event: KeyboardEvent) {
        const containers = this.containerSettingsManager.containers;
        if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowLeft) {
            let curIndex = containers.findIndex(container => container === this.selectedContainer);
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
    }

    public clickSave() {
    }

    public clickDiscard() {
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

    private _setSelectedContainer() {
        this.selectedContainer = this.containerSettingsManager.containers.find(
            c => c.id === this.containerSettingsManager.form.controls.containerType.value);
    }
}
