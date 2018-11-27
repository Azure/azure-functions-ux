import { Component, OnChanges, OnDestroy, Input, Injector, SimpleChanges } from '@angular/core';
import { ConfigSaveComponent, ArmSaveConfigs } from 'app/shared/components/config-save-component';
import { FormGroup } from '@angular/forms';
import { ResourceId, ArmObj } from 'app/shared/models/arm/arm-obj';
import { SiteTabIds } from 'app/shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { PortalService } from 'app/shared/services/portal.service';
import { Site } from 'app/shared/models/arm/site';
import { SiteService } from 'app/shared/services/site.service';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { OsType } from 'app/shared/models/arm/stacks';
import { EventMessage, BroadcastEvent } from 'app/shared/models/broadcast-event';
import { ByosData } from 'app/site/byos/byos';

// TODO(michinoy): Will send a separate PR with these changes.

@Component({
  selector: 'mount-storage',
  templateUrl: './mount-storage.component.html',
  styleUrls: ['./../site-config.component.scss'],
})
export class MountStorageComponent extends ConfigSaveComponent implements OnChanges, OnDestroy {
  @Input()
  mainForm: FormGroup;
  @Input()
  resourceId: ResourceId;

  private _site: ArmObj<Site>;
  public enableAddItemLink: boolean;

  constructor(private _portalService: PortalService, private _siteService: SiteService, injector: Injector) {
    super('MountStorageComponent', injector, ['SiteConfig'], SiteTabIds.applicationSettings);
    this._setupByosConfigSubscription();
  }

  protected get _isPristine() {
    // TODO(michinoy): implement this pristine logic.
    return true;
  }

  protected setup(inputEvents: Observable<ResourceId>) {
    return inputEvents
      .switchMap(resourceId => {
        return this._siteService.getSite(resourceId);
      })
      .do(r => {
        this._site = r.result;
        this.enableAddItemLink = true;
      });
  }

  protected _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs {
    // TODO(michinoy): implement this form.
    throw new Error('_getConfigsFromForms not implemented.');
  }

  ngOnChanges(changes: SimpleChanges) {
    // TODO(michinoy): implement handling of changes.
    if (changes['resourceId']) {
      this.setInput(this.resourceId);
    }
  }

  addItem() {
    const descriptor: ArmSiteDescriptor = new ArmSiteDescriptor(this._site.id);
    this._portalService.openBlade(
      {
        detailBlade: 'ByosPickerFrameBlade',
        detailBladeInputs: {
          id: this._site.id,
          data: {
            resourceId: this._site.id,
            isFunctionApp: false,
            subscriptionId: descriptor.subscription,
            location: this._site.location,
            os: ArmUtil.isLinuxApp(this._site) ? OsType.Linux : OsType.Windows,
          },
        },
      },
      'site-config'
    );
  }

  private _setupByosConfigSubscription() {
    this._broadcastService
      .getEvents<EventMessage<ByosData>>(BroadcastEvent.ByosConfigReceived)
      .filter(m => {
        return m.resourceId.toLowerCase() === this.resourceId.toLowerCase();
      })
      .subscribe(message => {
        const byosConfig = message.metadata;
        console.log(byosConfig);
      });
  }
}
