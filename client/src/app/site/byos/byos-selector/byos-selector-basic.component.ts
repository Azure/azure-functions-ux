import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { ByosConfigureData, StorageType } from '../byos';
import { FormGroup } from '@angular/forms';
import { StorageAccount, ContainerResult, ShareResult } from 'app/shared/models/storage-account';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { StorageService } from 'app/shared/services/storage.service';
import { ByosManager } from '../byos-manager';

@Component({
  selector: 'byos-selector-basic',
  templateUrl: './byos-selector-basic.component.html',
  styleUrls: ['./../byos.component.scss'],
})
export class ByosSelectorBasicComponent extends FeatureComponent<ByosConfigureData> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosConfigureData) {
    this.selectedStorageAccountName = null;
    this._setupForm(viewInfo.form);
    this.setInput(viewInfo);
  }

  public byosConfigureData: ByosConfigureData;
  public form: FormGroup;
  public loadingAccounts = false;
  public loadingContainers = false;
  public loadingFileShares = false;
  public storageAccounts: ArmObj<StorageAccount>[] = [];
  public storageAccountItems: DropDownElement<string>[] = [];
  public containers: ContainerResult[] = [];
  public containerItems: DropDownElement<string>[] = [];
  public fileShares: ShareResult[] = [];
  public fileShareItems: DropDownElement<string>[] = [];

  public selectedStorageAccountName: string;
  public selectedContainer: string;
  public selectedFileShare: string;

  public storageTypeBlob = StorageType.azureBlob;
  public storageTypeFiles = StorageType.azureFiles;

  public os: string;

  constructor(public byosManager: ByosManager, private _storageService: StorageService, injector: Injector) {
    super('ByosSelectorBasicComponent', injector, 'dashboard');
    this.isParentComponent = false;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosConfigureData>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap((input: ByosConfigureData) => {
        this.os = input.os.toLowerCase();
        this.loadingAccounts = true;
        this.byosConfigureData = input;

        return this._storageService.getAccounts(input.subscriptionId);
      })
      .do(accountsResult => {
        if (accountsResult.isSuccessful && accountsResult.result.value && accountsResult.result.value.length > 0) {
          this.storageAccounts = accountsResult.result.value;

          this.storageAccountItems = this.storageAccounts.map(item => ({
            displayLabel: item.name,
            value: item.name,
          }));

          this.loadingAccounts = false;
        }
      });
  }

  public accountChanged(element: DropDownElement<string>) {
    this._resetContainers();
    this._resetFileShares();

    const selectedAccount = this.storageAccounts.find(item => item.name === element.value);

    this._storageService.listAccountKeys(selectedAccount.id).subscribe(keysResult => {
      if (keysResult.isSuccessful) {
        const accessKey = keysResult.result.keys[0].value;
        this.form.controls.accessKey.setValue(accessKey);
        this._loadContainersAndShares(selectedAccount.name, accessKey);
      }
    });
  }

  public storageTypeChanged(storageType: StorageType) {
    const selectedItem = storageType === StorageType.azureBlob ? this.selectedContainer : this.selectedFileShare;

    this.form.controls.containerName.setValue(selectedItem);
  }

  private _resetContainers() {
    this.containerItems = [];
    this.containers = [];
    this.selectedContainer = null;
    this.loadingContainers = true;
  }

  private _resetFileShares() {
    this.fileShareItems = [];
    this.fileShares = [];
    this.selectedFileShare = null;
    this.loadingFileShares = true;
  }

  private _setupForm(form: FormGroup) {
    const advancedForm = this.byosManager.getAdvancedForm(form);
    advancedForm.disable();
    this.form = this.byosManager.getBasicForm(form);
    this.form.enable();
  }

  private _loadContainersAndShares(accountName: string, accessKey: string) {
    Observable.zip(
      this._storageService.getContainers(accountName, accessKey),
      this._storageService.getFileShares(accountName, accessKey)
    ).subscribe(results => {
      const [containersResult, fileSharesResult] = results;

      if (containersResult.isSuccessful) {
        this.loadingContainers = false;
        this.containers = containersResult.result;
        this.containerItems = this.containers.map(item => ({
          displayLabel: item.name,
          value: item.name,
        }));
      }

      if (fileSharesResult.isSuccessful) {
        this.loadingFileShares = false;
        this.fileShares = fileSharesResult.result;
        this.fileShareItems = this.fileShares.map(item => ({
          displayLabel: item.name,
          value: item.name,
        }));
      }
    });
  }
}
