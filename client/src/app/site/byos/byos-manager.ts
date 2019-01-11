import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RequiredValidator } from '../../shared/validators/requiredValidator';
import { SelectOption } from 'app/shared/models/select-option';
import { ConfigurationOptionType, StorageType } from './byos';
import { PortalResources } from 'app/shared/models/portal-resources';
import { OsType } from 'app/shared/models/arm/stacks';
import { StoragePathValidator } from 'app/shared/validators/storagePathValidator';
import { UniqueStorageNameValidator } from 'app/shared/validators/uniqueStorageNameValidator';

@Injectable()
export class ByosManager {
  form: FormGroup;
  requiredValidator: RequiredValidator;
  storagePathValidator: StoragePathValidator;
  uniqueStorageNameValidator: UniqueStorageNameValidator;
  configurationOptions: SelectOption<ConfigurationOptionType>[] = [];
  storageTypes: SelectOption<StorageType>[] = [];

  constructor(private _fb: FormBuilder, private _ts: TranslateService) {
    this.requiredValidator = new RequiredValidator(this._ts);
    this._setConfigurationOptions();
    this._setStorageTypes();
  }

  public initialize(os: OsType.Linux | OsType.Windows, currentStorageNames: string[]) {
    this.storagePathValidator = new StoragePathValidator(this._ts, os);
    this.uniqueStorageNameValidator = new UniqueStorageNameValidator(this._ts, currentStorageNames);
    this.form = this._fb.group({
      name: [
        '',
        [
          this.requiredValidator.validate.bind(this.requiredValidator),
          this.uniqueStorageNameValidator.validate.bind(this.uniqueStorageNameValidator),
        ],
      ],
      configurationOption: ['basic', this.requiredValidator.validate.bind(this.requiredValidator)],
      basicForm: this._getByosFormGroup(os),
      advancedForm: this._getByosFormGroup(os),
    });
  }

  public getBasicForm(form: FormGroup): FormGroup {
    return <FormGroup>(form && form.controls && form.controls.basicForm);
  }

  public getAdvancedForm(form: FormGroup): FormGroup {
    return <FormGroup>(form && form.controls && form.controls.advancedForm);
  }

  public getConfiguredForm(form: FormGroup): FormGroup {
    const configuration = form.controls.configurationOption.value;
    return configuration === 'basic' ? this.getBasicForm(form) : this.getAdvancedForm(form);
  }

  private _setConfigurationOptions() {
    this.configurationOptions = [
      {
        displayLabel: this._ts.instant(PortalResources.basic),
        value: 'basic',
      },
      {
        displayLabel: this._ts.instant(PortalResources.advanced),
        value: 'advanced',
      },
    ];
  }

  private _setStorageTypes() {
    this.storageTypes = [
      {
        displayLabel: this._ts.instant(PortalResources.blob),
        value: StorageType.azureBlob,
      },
      {
        displayLabel: this._ts.instant(PortalResources.files),
        value: StorageType.azureFiles,
      },
    ];
  }

  private _getByosFormGroup(os: string): FormGroup {
    return this._fb.group({
      account: ['', this.requiredValidator.validate.bind(this.requiredValidator)],
      storageType: [os === OsType.Windows ? StorageType.azureFiles : StorageType.azureBlob],
      containerName: ['', this.requiredValidator.validate.bind(this.requiredValidator)],
      accessKey: ['', this.requiredValidator.validate.bind(this.requiredValidator)],
      mountPath: ['', this.storagePathValidator.validate.bind(this.storagePathValidator)],
    });
  }
}
