import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ContainerConfigureData, Container, ACRRegistry, ContainerType } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { ContainerACRService } from '../../services/container-acr.service';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'container-image-source-acr',
    templateUrl: './container-image-source-acr.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-acr.component.scss',
    ],
})
export class ContainerImageSourceACRComponent extends FeatureComponent<ContainerConfigureData> implements OnDestroy {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureData) {
        this.setInput(containerConfigureInfo);
    }

    public loadingRegistries: boolean;
    public loadingRepo: boolean;
    public loadingTag: boolean;
    public registriesMissing: boolean;
    public registryDropdownItems: DropDownElement<string>[];
    public registryItems: ACRRegistry[];
    public repositoryDropdownItems: DropDownElement<string>[];
    public repositoryItems: string[];
    public tagDropdownItems: DropDownElement<string>[];
    public tagItems: string[];
    public selectedContainer: Container;
    public containerConfigureInfo: ContainerConfigureData;
    public selectedRegistry: string;
    public selectedRepository: string;
    public selectedTag: string;
    public form: FormGroup;

    private _username: string;
    private _password: string;

    constructor(
        private _containerSettingsManager: ContainerSettingsManager,
        private _acrService: ContainerACRService,
        injector: Injector) {
        super('ContainerImageSourceACRComponent', injector, 'dashboard');
        this.featureName = 'ContainerSettings';

        this._containerSettingsManager.form.controls.containerType.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .subscribe((containerType: ContainerType) => {
                this._setSelectedContainer(this._containerSettingsManager.containers.find(c => c.id === containerType));
            });
    }

    protected setup(inputEvents: Observable<ContainerConfigureData>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(containerConfigureInfo => {
                this.containerConfigureInfo = containerConfigureInfo;
                this._setSelectedContainer(containerConfigureInfo.container);
                this._reset();
                this.loadingRegistries = true;

                return this._acrService.getRegistries(this.containerConfigureInfo.subscriptionId);
            })
            .do(registryResources => {
                if (registryResources.isSuccessful
                    && registryResources.result.value
                    && registryResources.result.value.length > 0) {
                    this.registryItems = registryResources.result.value
                        .map(registryResource => ({ ...registryResource.properties, resourceId: registryResource.id }));

                    this.registryDropdownItems = registryResources.result.value
                        .map(registryResource => ({
                            displayLabel: registryResource.name,
                            value: registryResource.properties.loginServer,
                        }));

                    this.selectedRegistry = this.form.controls.acrRegistry.value;

                    this.loadingRegistries = false;
                    this.registriesMissing = false;
                } else {
                    this.registriesMissing = true;
                }
            });
    }

    public registryChanged(element: DropDownElement<string>) {
        this.selectedRepository = '';
        this.repositoryDropdownItems = [];
        this.selectedTag = '';
        this.tagDropdownItems = [];
        this.loadingRepo = true;

        const acrRegistry = this.registryItems.find(item => item.loginServer === element.value);

        this._acrService
            .getCredentials(acrRegistry.resourceId)
            .subscribe((credential) => {
                if (credential.isSuccessful) {
                    this._username = credential.result.username;
                    this._password = credential.result.passwords[0].value;

                    if (this._username && this._password) {
                        this._loadRepositories();
                    }
                }
            });
    }

    public respositoryChanged(element: DropDownElement<string>) {
        this.selectedTag = '';
        this._loadTags();
    }

    public extractConfig(event) {
        const input = event.target;
        const reader = new FileReader();
        reader.onload = () => {
            this.form.controls.config.setValue(reader.result);
        };
        reader.readAsText(input.files[0]);
    }

    private _reset() {
        this.loadingRegistries = false;
        this.loadingRepo = false;
        this.loadingTag = false;
        this.registriesMissing = false;

        this.registryDropdownItems = [];
        this.registryItems = [];
        this.repositoryDropdownItems = [];
        this.repositoryItems = [];
        this.tagDropdownItems = [];
        this.tagItems = [];
        this._username = '';
        this._password = '';
    }

    private _loadRepositories() {
        this.loadingRepo = true;
        this._acrService
            .getRepositories(
                this.containerConfigureInfo.subscriptionId,
                this.containerConfigureInfo.resourceId,
                this.selectedRegistry,
                this._username,
                this._password)
            .subscribe((response) => {
                if (response.isSuccessful
                    && response.result
                    && response.result.repositories
                    && response.result.repositories.length > 0) {
                    this.repositoryItems = response.result.repositories;

                    this.repositoryDropdownItems = this.repositoryItems.map(item => ({
                        displayLabel: item,
                        value: item,
                    }));

                    this.loadingRepo = false;
                }
            });
    }

    private _loadTags() {
        this.loadingTag = true;
        this._acrService
            .getTags(
                this.containerConfigureInfo.subscriptionId,
                this.containerConfigureInfo.resourceId,
                this.selectedRegistry,
                this.selectedRepository,
                this._username,
                this._password)
            .subscribe((response) => {
                if (response.isSuccessful
                    && response.result
                    && response.result.tags
                    && response.result.tags.length > 0) {
                    this.tagItems = response.result.tags;

                    this.tagDropdownItems = this.tagItems.map(item => ({
                        displayLabel: item,
                        value: item,
                    }));

                    this.loadingTag = false;
                }
            });
    }

    private _setSelectedContainer(container: Container) {
        this.selectedContainer = container;
        this.containerConfigureInfo.container = container;
        this.form = this._containerSettingsManager.getImageSourceForm(container.id, 'azureContainerRegistry');
    }
}
