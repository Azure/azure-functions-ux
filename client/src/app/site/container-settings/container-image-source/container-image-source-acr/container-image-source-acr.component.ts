import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { ACRRegistry, ContainerImageSourceData, ACRRepositories, ACRTags } from '../../container-settings';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { ContainerACRService } from '../../services/container-acr.service';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { ContainerMultiConfigService } from '../../services/container-multiconfig.service';
import { ContainerConstants } from 'app/shared/models/constants';
import { Response } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'container-image-source-acr',
  templateUrl: './container-image-source-acr.component.html',
  styleUrls: [
    './../../container-settings.component.scss',
    './../container-image-source.component.scss',
    './container-image-source-acr.component.scss',
  ],
})
export class ContainerImageSourceACRComponent extends FeatureComponent<ContainerImageSourceData> implements OnDestroy {
  @Input()
  set containerImageSourceInfoInput(containerImageSourceInfo: ContainerImageSourceData) {
    this.setInput(containerImageSourceInfo);
  }

  public loadingRegistries: boolean;
  public loadingRepo: boolean;
  public loadingTag: boolean;
  public registriesMissing: boolean;
  public registryDropdownItems: DropDownElement<string>[];
  public registryItems: ACRRegistry[];
  public repositoryDropdownItems: DropDownElement<string>[];
  public repositoryItems: string[] = [];
  public tagDropdownItems: DropDownElement<string>[];
  public tagItems: string[] = [];
  public containerImageSourceInfo: ContainerImageSourceData;
  public selectedRegistry: string;
  public selectedRepository: string;
  public selectedTag: string;
  public imageSourceForm: FormGroup;
  public cotainsCrossSubscriptionRegistry = false;
  public credentialsErrorMessage: string;
  public repositoriesErrorMessage = '';
  public tagsErrorMessage = '';

  constructor(
    private _acrService: ContainerACRService,
    private _multiConfigService: ContainerMultiConfigService,
    private _ts: TranslateService,
    injector: Injector
  ) {
    super('ContainerImageSourceACRComponent', injector, 'dashboard');
    this.featureName = 'ContainerSettings';
  }

  protected setup(inputEvents: Observable<ContainerImageSourceData>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(containerImageSourceInfo => {
        this.containerImageSourceInfo = containerImageSourceInfo;
        this.imageSourceForm = containerImageSourceInfo.imageSourceForm;
        this._reset();
        this.loadingRegistries = true;
        this.selectedRegistry = this.imageSourceForm.controls.registry.value;
        this.selectedRepository = this.imageSourceForm.controls.repository ? this.imageSourceForm.controls.repository.value : '';
        this.selectedTag = this.imageSourceForm.controls.tag ? this.imageSourceForm.controls.tag.value : '';

        return this._acrService.getRegistries(this.containerImageSourceInfo.subscriptionId);
      })
      .do(registryResources => {
        if (
          registryResources.isSuccessful &&
          registryResources.result.value &&
          registryResources.result.value.length > 0 &&
          (!this.selectedRegistry ||
            registryResources.result.value.find(resource => resource.properties.loginServer === this.selectedRegistry))
        ) {
          this.registryItems = registryResources.result.value.map(registryResource => ({
            ...registryResource.properties,
            resourceId: registryResource.id,
          }));

          this.registryDropdownItems = registryResources.result.value
            .sort((resourceA, resourceB) => resourceA.name.localeCompare(resourceB.name))
            .map(registryResource => ({
              displayLabel: registryResource.name,
              value: registryResource.properties.loginServer,
            }));

          this.loadingRegistries = false;
          this.registriesMissing = false;
          this.cotainsCrossSubscriptionRegistry = false;

          if (this.selectedRegistry) {
            this._loadRepositories();
          }
        } else if (this.selectedRegistry) {
          // NOTE(michinoy): This means the user is referencing ACR from cross subscription using private registry.
          this.cotainsCrossSubscriptionRegistry = true;
          const selectedRegitryName = this.selectedRegistry.toLowerCase().replace(`.${ContainerConstants.acrUriHost}`, '');
          this.registryDropdownItems = [
            {
              displayLabel: selectedRegitryName,
              value: this.selectedRegistry,
            },
          ];

          this.imageSourceForm.controls.registry.disable();

          this.loadingRegistries = false;
          this.registriesMissing = false;

          this._loadRepositories();
        } else {
          this.registriesMissing = true;
        }
      });
  }

  public registryChanged(element: DropDownElement<string>) {
    this.selectedRepository = '';
    this.repositoryItems = [];
    this.repositoryDropdownItems = [];
    this.selectedTag = '';
    this.tagItems = [];
    this.tagDropdownItems = [];
    this.loadingRepo = true;
    this.credentialsErrorMessage = null;
    this.repositoriesErrorMessage = '';
    this.tagsErrorMessage = '';

    const acrRegistry = this.registryItems.find(item => item.loginServer === element.value);

    this._acrService.getCredentials(acrRegistry.resourceId).subscribe(credentialResponse => {
      if (credentialResponse.isSuccessful) {
        const username = credentialResponse.result.username;
        const password = credentialResponse.result.passwords[0].value;

        if (username && password) {
          this.imageSourceForm.controls.login.setValue(username);
          this.imageSourceForm.controls.password.setValue(password);
          this._loadRepositories();
        }
      } else {
        this.credentialsErrorMessage = credentialResponse.error && credentialResponse.error.message;
        this.loadingRepo = false;
      }
    });
  }

  public respositoryChanged(element: DropDownElement<string>) {
    this.selectedTag = '';
    this.tagItems = [];
    this.tagDropdownItems = [];
    this.tagsErrorMessage = '';
    this._loadTags();
  }

  public extractConfig(event) {
    this._multiConfigService
      .extractConfig(event.target)
      .first()
      .subscribe(config => {
        this.imageSourceForm.controls.config.setValue(config);
      });
  }

  private _reset() {
    this.loadingRegistries = false;
    this.repositoryItems = [];
    this.loadingRepo = false;
    this.tagItems = [];
    this.loadingTag = false;
    this.registriesMissing = false;
    this.repositoriesErrorMessage = '';
    this.tagsErrorMessage = '';
  }

  private _loadRepositories() {
    this.loadingRepo = true;
    this._acrService
      .getRepositories(this.selectedRegistry, this.imageSourceForm.controls.login.value, this.imageSourceForm.controls.password.value)
      .catch(err => {
        // NOTE(michinoy): Unfortunately we are not receiving any error messages from ACR, just a status code of 400.
        return Observable.of(null);
      })
      .subscribe((response: Response) => {
        if (response && response.status === 200) {
          const acrRepositories = response.json() as ACRRepositories;
          const repositories: string[] =
            acrRepositories && acrRepositories.repositories && acrRepositories.repositories.length > 0 ? acrRepositories.repositories : [];
          this.repositoryItems.push(...repositories);

          const nextLink = this._acrService.getNextLink(this.selectedRegistry, response);
          if (!nextLink) {
            this.repositoryItems.sort();
            this.repositoryDropdownItems = this.repositoryItems.map(item => ({
              displayLabel: item,
              value: item,
            }));
            this.loadingRepo = false;

            if (this.selectedRepository) {
              this._loadTags();
            }
          }
        } else {
          this.loadingRepo = false;
          this.repositoriesErrorMessage = this._ts.instant('failedToFetchRepositories');
        }
      });
  }

  private _loadTags() {
    this.loadingTag = true;
    this._acrService
      .getTags(
        this.selectedRegistry,
        this.selectedRepository,
        this.imageSourceForm.controls.login.value,
        this.imageSourceForm.controls.password.value
      )
      .catch(err => {
        // NOTE(michinoy): Unfortunately we are not receiving any error messages from ACR, just a status code of 400.
        return Observable.of(null);
      })
      .subscribe((response: Response) => {
        if (response && response.status === 200) {
          const tags: string[] = (response.json() as ACRTags).tags;
          this.tagItems.push(...tags);

          const nextLink = this._acrService.getNextLink(this.selectedRegistry, response);
          if (!nextLink) {
            this.tagItems.sort();
            this.tagDropdownItems = this.tagItems.map(item => ({
              displayLabel: item,
              value: item,
            }));
            this.loadingTag = false;
          }
        } else {
          this.loadingTag = false;
          this.tagsErrorMessage = this._ts.instant('failedToFetchTags');
        }
      });
  }
}
