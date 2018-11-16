import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ByosInput, ByosInputData, StorageType, ByosConfigureData } from './byos';
import { Observable } from 'rxjs/Observable';
import { PortalService } from 'app/shared/services/portal.service';
import { ByosManager } from './byos-manager';

@Component({
  selector: 'byos',
  templateUrl: './byos.component.html',
  styleUrls: ['./byos.component.scss'],
})
export class ByosComponent extends FeatureComponent<ByosInput<ByosInputData>> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosInput<ByosInputData>) {
    this.byosConfigureData = null;
    this.setInput(viewInfo);
  }

  public byosConfigureData: ByosConfigureData;

  constructor(private _byosManager: ByosManager, private _portalService: PortalService, injector: Injector) {
    super('ByosComponent', injector, 'dashboard');
    this.isParentComponent = true;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosInput<ByosInputData>>) {
    return inputEvents.do((input: ByosInput<ByosInputData>) => {
      this._byosManager.initialize();
      this.byosConfigureData = { ...input.data, form: this._byosManager.form };
    });
  }

  public closeme() {
    this._portalService.returnByosSelections({
      type: StorageType.azureBlob,
      accountName: 'sa1',
      shareName: 'share1',
      accessKey: 'accessKey',
      mountPath: 'path',
      appResourceId: this.byosConfigureData.resourceId,
    });
  }
}
