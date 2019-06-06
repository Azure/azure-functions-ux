import { FunctionAppService } from './../shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Component, OnInit, Input, Output } from '@angular/core';
import { MicrosoftGraphHelper } from '../pickers/microsoft-graph/microsoft-graph-helper';
import { AiService } from '../shared/services/ai.service';
import { CacheService } from './../shared/services/cache.service';
import { AADPermissions, AADRegistrationInfo, AADDescriptionDescriptions } from './../shared/models/microsoft-graph';
import { PortalService } from '../shared/services/portal.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { errorIds } from './../shared/models/error-ids';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { NationalCloudEnvironment } from 'app/shared/services/scenario/national-cloud.environment';

@Component({
  selector: 'aad-registration',
  templateUrl: './aad-registration.component.html',
  styleUrls: ['./aad-registration.component.scss'],
})
export class AadRegistrationComponent extends FunctionAppContextComponent implements OnInit {
  isConfigured: boolean;
  isAADAppCreated: boolean;
  isRequiredPermissionConfigured: boolean;
  helper: MicrosoftGraphHelper;
  necessaryPerms: AADPermissions[];
  graphToken: string;
  model: AADRegistrationInfo;
  descriptionHelper: AADDescriptionDescriptions = new AADDescriptionDescriptions();
  count = 0;
  configuredCount = 0;
  isNationalCloud: boolean;
  @Output()
  configured: BehaviorSubject<boolean> = new BehaviorSubject(false);
  binding: string;
  isAdditionalPermissionsBinding: boolean;
  private _bindingsWithAdditionalPermissions = ['token', 'GraphWebhook', 'GraphWebhookCreator'];

  constructor(
    private _aiService: AiService,
    private _cacheService: CacheService,
    private _portalService: PortalService,
    private _globalService: GlobalStateService,
    private _functionAppService: FunctionAppService,
    broadcastService: BroadcastService
  ) {
    super('aad-registration', _functionAppService, broadcastService);
  }

  setup(): Subscription {
    return this.viewInfoEvents.subscribe(view => {
      this.helper = new MicrosoftGraphHelper(view.context, this._functionAppService, this._cacheService, this._aiService);
      this.setModel();
    });
  }

  @Input()
  set AADPermissions(value: AADPermissions[]) {
    this.necessaryPerms = value;
    this.setModel();
  }

  @Input()
  set bindingInput(value: string) {
    this.binding = value;
    this.isAdditionalPermissionsBinding = !!this._bindingsWithAdditionalPermissions.find(item => {
      return item.toLocaleLowerCase() === this.binding.toLocaleLowerCase();
    });
  }

  ngOnInit() {
    this.isNationalCloud = NationalCloudEnvironment.isNationalCloud();
    this._portalService.getAdToken('graph').subscribe(
      tokenData => {
        this.graphToken = tokenData.result.token;
        this.setModel();
      },
      err => {
        this.processError(err, 'Error retrieving graph token');
      }
    );
  }

  openAuth() {
    this._portalService.openBladeDeprecated(
      {
        detailBlade: 'AppAuth',
        detailBladeInputs: { resourceUri: this.context.site.id },
      },
      'aad-registration'
    );
  }

  configureAAD() {
    this.model = null;
    this.helper.configureAAD(this.necessaryPerms, this.graphToken).subscribe(
      () => {
        this.setModel();
      },
      err => {
        this.processError(err, 'Error configuring AAD application');
      }
    );
  }

  addPermissions() {
    this.model = null;
    this.helper.addPermissions(this.necessaryPerms, this.graphToken).subscribe(
      () => {
        this.setModel();
      },
      err => {
        this.processError(err, 'Error adding permissions to AAD application');
      }
    );
  }

  private setModel() {
    this.model = null;
    if (this.helper && this.necessaryPerms && this.graphToken) {
      this.helper.getADDAppRegistrationInfo(this.necessaryPerms, this.graphToken).subscribe(
        (result: AADRegistrationInfo) => {
          this.count = 0;
          this.configuredCount = 0;
          this.model = result;
          if (this.isAdditionalPermissionsBinding) {
            this.model.isPermissionConfigured = true;
          }
          this.configured.next(this.model.isAADAppCreated && this.model.isPermissionConfigured);
          this.model.permissions.forEach(p => {
            p.resourceAccess.forEach(ra => {
              this.count++;
              if (ra.configured) {
                this.configuredCount++;
              }
            });
          });
        },
        err => {
          this.processError(err, 'Error getting AAD application');
        }
      );
    }
  }

  private processError(err: Error, message: string) {
    this._globalService.clearBusyState();
    this._aiService.trackException(err, message);
    this.showComponentError({
      message: `${message}: ${JSON.stringify(err)}`,
      errorId: errorIds.failedAadRegistration,
      resourceId: 'none',
    });
  }
}
