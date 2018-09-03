import { Component, Input } from '@angular/core';
import { ContainerConfigureData, Container, ACRRegistry } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { ContainerACRService } from '../../../../shared/services/container-acr.service';

@Component({
    selector: 'container-image-source-acr',
    templateUrl: './container-image-source-acr.component.html',
    styleUrls: [
        './../../container-settings.component.scss',
        './../container-image-source.component.scss',
        './container-image-source-acr.component.scss']
})
export class ContainerImageSourceACRComponent {

    @Input() set containerConfigureInfoInput(containerConfigureInfoInput: ContainerConfigureData) {
        this.containerConfigureInfo = containerConfigureInfoInput;
        this._reset();
        this._loadRegistries();
    }

    public loadingRegistries: boolean;
    public loadingRepo: boolean;
    public loadingTag: boolean;

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
    public username: string;
    public password: string;

    constructor(
        private _containerSettingsManager: ContainerSettingsManager,
        private _acrService: ContainerACRService,
    ) {
        this._containerSettingsManager.selectedContainer$.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
            this.containerConfigureInfo.container = selectedContainer;
        });

        this._setupRegistrySubscription();
        this._setupRepositorySubscription();
    }

    private _reset() {
        this.loadingRegistries = false;
        this.loadingRepo = false;
        this.loadingTag = false;

        this.registryDropdownItems = [];
        this.registryItems = [];
        this.repositoryDropdownItems = [];
        this.repositoryItems = [];
        this.tagDropdownItems = [];
        this.tagItems = [];
        this.username = '';
        this.password = '';

        this._containerSettingsManager.selectedAcrRegistry$.next('');
        this._containerSettingsManager.selectedAcrRepo$.next('');
        this._containerSettingsManager.selectedAcrTag$.next('');
    }

    private _setupRegistrySubscription() {
        this._containerSettingsManager.selectedAcrRegistry$
            .distinctUntilChanged()
            .subscribe(registry => {
                const acrRegistry = this.registryItems.find(registryItem => registryItem.loginServer === registry);

                if (acrRegistry) {
                    this._acrService
                        .getCredentials(acrRegistry.resourceId)
                        .do((credential) => {
                            if (credential.isSuccessful) {
                                this.username = credential.result.username;
                                this.password = credential.result.passwords[0].value;
                                this.selectedRegistry = registry;

                                if (this.username && this.password) {
                                    this._loadRepositories();
                                }
                            }
                        });
                }
            });
    }

    private _setupRepositorySubscription() {
        this._containerSettingsManager.selectedAcrRepo$
            .distinctUntilChanged()
            .subscribe(repository => {
                this.selectedRepository = repository;

                if (repository) {
                    this._loadTags();
                }
            });
    }

    private _loadRegistries() {
        this.loadingRegistries = true;
        this._acrService
            .getRegistries(this.containerConfigureInfo.subscriptionId)
            .do((registryResources) => {
                if (registryResources.isSuccessful) {
                    this.registryItems = registryResources.result.value.map(registryResource => ({ ...registryResource.properties, resourceId: registryResource.id }));

                    this.registryDropdownItems = registryResources.result.value.map(registryResource => ({
                        displayLabel: registryResource.name,
                        value: registryResource.properties.loginServer,
                    }));

                    this._containerSettingsManager.selectedAcrRegistry$.next(this.registryItems[0].loginServer);

                    this.loadingRegistries = false;
                }
            });
    }

    private _loadRepositories() {
        this.loadingRepo = true;
        this._acrService
            .getRepositories(
                this.containerConfigureInfo.subscriptionId,
                this.selectedRegistry,
                this.username,
                this.password)
            .do((repositories) => {
                this.repositoryItems = repositories.repositories;

                this.repositoryDropdownItems = this.repositoryItems.map(item => ({
                    displayLabel: item,
                    value: item,
                }));

                this._containerSettingsManager.selectedAcrRepo$.next(this.repositoryItems[0]);

                this.loadingRepo = false;
            });
    }

    private _loadTags() {
        this.loadingTag = true;
        this._acrService
            .getTags(
                this.containerConfigureInfo.subscriptionId,
                this.selectedRegistry,
                this.selectedRepository,
                this.username,
                this.password)
            .do((tags) => {
                this.tagItems = tags.tags;

                this.tagDropdownItems = this.tagItems.map(item => ({
                    displayLabel: item,
                    value: item,
                }));

                this._containerSettingsManager.selectedAcrTag$.next(this.tagItems[0]);

                this.loadingTag = false;
            });
    }
}
