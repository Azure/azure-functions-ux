import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ByosInput, ByosInputData, ByosConfigureData } from './byos';
import { Observable } from 'rxjs/Observable';
import { PortalService } from 'app/shared/services/portal.service';
import { ByosManager } from './byos-manager';
import { FormGroup, FormControl } from '@angular/forms';
import { OsType } from 'app/shared/models/arm/stacks';
import { Links } from 'app/shared/models/constants';

@Component({
  selector: 'byos',
  templateUrl: './byos.component.html',
  styleUrls: ['./byos.component.scss'],
})
export class ByosComponent extends FeatureComponent<ByosInput<ByosInputData>> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosInput<ByosInputData>) {
    this._os = null;
    this.byosConfigureData = null;
    this.setInput(viewInfo);
  }

  public byosConfigureData: ByosConfigureData;
  public byosLearnMoreLink = Links.byosLearnMore;
  private _os: OsType;

  constructor(private _byosManager: ByosManager, private _portalService: PortalService, injector: Injector) {
    super('ByosComponent', injector, 'dashboard');
    this.isParentComponent = true;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosInput<ByosInputData>>) {
    return inputEvents.do((input: ByosInput<ByosInputData>) => {
      this._os = input.data.os.toLowerCase() === OsType.Linux.toLowerCase() ? OsType.Linux : OsType.Windows;
      this._byosManager.initialize(this._os, input.data.currentNames || []);
      this.byosConfigureData = { ...input.data, form: this._byosManager.form };
    });
  }

  public clickApply() {
    this._markFormGroupDirtyAndValidate(this.byosConfigureData.form);

    if (this.byosConfigureData.form.valid) {
      const form = this._byosManager.getConfiguredForm(this.byosConfigureData.form);
      let storageAccountName = form.controls.account.value;

      if (this._os === OsType.Windows) {
        // NOTE(michinoy): This is a temporary fix. Windows backend is throwing an error if the
        // dns suffix is not explicitly part of the name.
        storageAccountName = `${storageAccountName}.file.core.windows.net`;
      }

      this._portalService.returnByosSelections({
        type: form.controls.storageType.value,
        accountName: form.controls.account.value,
        shareName: form.controls.containerName.value,
        accessKey: form.controls.accessKey.value,
        mountPath: form.controls.mountPath.value,
        appResourceId: this.byosConfigureData.resourceId,
        name: this.byosConfigureData.form.controls.name.value,
      });
    }
  }

  private _markFormGroupDirtyAndValidate(formGroup: FormGroup) {
    if (formGroup.controls) {
      const keys = Object.keys(formGroup.controls);
      for (let i = 0; i < keys.length; i++) {
        const control = formGroup.controls[keys[i]];
        if (control.enabled) {
          if (control instanceof FormControl && !control.dirty) {
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
