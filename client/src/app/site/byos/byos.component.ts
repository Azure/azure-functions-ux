import { Component, OnDestroy, Input, Injector } from '@angular/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ByosInput, ByosInputData, StorageType } from './byos';
import { Observable } from 'rxjs/Observable';
import { PortalService } from 'app/shared/services/portal.service';

@Component({
  selector: 'byos',
  templateUrl: './byos.component.html',
  styleUrls: ['./byos.component.scss'],
})
export class ByosComponent extends FeatureComponent<ByosInput<ByosInputData>> implements OnDestroy {
  @Input()
  set viewInfoInput(viewInfo: ByosInput<ByosInputData>) {
    this.setInput(viewInfo);
  }

  public resourceId: string;

  constructor(private _portalService: PortalService, injector: Injector) {
    super('ByosComponent', injector, 'dashboard');
    this.isParentComponent = true;
    this.featureName = 'Byos';
  }

  protected setup(inputEvents: Observable<ByosInput<ByosInputData>>) {
    return inputEvents.do((input: ByosInput<ByosInputData>) => {
      this.resourceId = input.data.resourceId;
    });
  }

  public closeme() {
    this._portalService.returnByosSelections({
      type: StorageType.azureBlob,
      accountName: 'sa1',
      shareName: 'share1',
      accessKey: 'accessKey',
      mountPath: 'path',
      appResourceId: this.resourceId,
    });
  }
}
