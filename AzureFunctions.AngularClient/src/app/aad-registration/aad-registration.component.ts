import { Component, OnInit, Input, Output } from '@angular/core';
import { MicrosoftGraphHelper } from '../pickers/microsoft-graph/microsoft-graph-helper';
import { AiService } from '../shared/services/ai.service';
import { CacheService } from './../shared/services/cache.service';
import { FunctionApp } from './../shared/function-app';
import { AADPermissions, AADRegistrationInfo, AADDescriptionDescriptions } from './../shared/models/microsoft-graph';
import { PortalService } from '../shared/services/portal.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import { ErrorIds } from './../shared/models/error-ids';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'aad-registration',
  templateUrl: './aad-registration.component.html',
  styleUrls: ['./aad-registration.component.scss']
})
export class AadRegistrationComponent implements OnInit {

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
  @Output() configured: BehaviorSubject<boolean> = new BehaviorSubject(false);
  binding: string;
  isAdditionalPermissionsBinding: boolean;
  private _functionApp: FunctionApp;
  private _bindingsWithAdditionalPermissions = ['token', 'GraphWebhook', 'GraphWebhookCreator'];


  constructor(
        private _aiService: AiService,
        private _cacheService: CacheService,
        private _portalService: PortalService,
        private _globalService: GlobalStateService,
        private _broadcastService: BroadcastService
      ) { }

  @Input() set functionApp(functionApp: FunctionApp) {
    if (functionApp) {
      this._functionApp = functionApp;
      this.helper = new MicrosoftGraphHelper(functionApp, this._cacheService, this._aiService);
      this.setModel();
    }
  }

  @Input() set AADPermissions(value: AADPermissions[]) {
    this.necessaryPerms = value;
    this.setModel();
  }

  @Input() set bindingInput(value: string){
    this.binding = value;
    this.isAdditionalPermissionsBinding = !!this._bindingsWithAdditionalPermissions.find(item => {
      return item.toLocaleLowerCase() === this.binding.toLocaleLowerCase();
    });
  }

  ngOnInit() {
    this._portalService.getStartupInfo().first().subscribe(info => {
      this.graphToken = info.graphToken;
      this.setModel();
    });
  }

  openAuth() {
      this._portalService.openBlade({
          detailBlade: 'AppAuth',
          detailBladeInputs: { resourceUri: this._functionApp.site.id }
      }, 'aad-registration');
  }

  configureAAD() {
    this._globalService.setBusyState();
    this.helper.configureAAD(this.necessaryPerms, this.graphToken).subscribe(() => {
      this._globalService.clearBusyState();
      this.setModel();
    }, err => {
      this.processError(err, 'Error configuring AAD application');
    });
  }

  addPermissions() {
    this._globalService.setBusyState();
    this.helper.addPermissions(this.necessaryPerms, this.graphToken).subscribe(() => {
      this._globalService.clearBusyState();
      this.setModel();
    }, err => {
      this.processError(err, 'Error adding permissions to AAD application');
    });
  }

  private setModel() {
      if (this.helper && this.necessaryPerms && this.graphToken) {
        this.helper.getADDAppRegistrationInfo(this.necessaryPerms, this.graphToken).subscribe((result: AADRegistrationInfo) => {
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

        }, err => {
          this.processError(err, 'Error adding permissions to AAD application');
        });
      }
  }

  private processError(err: Error, message: string) {
    this._globalService.clearBusyState();
    this._aiService.trackException(err, message);
     this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
         message: message,
         errorId: ErrorIds.failedAadRegistration,
         errorType: ErrorType.UserError,
         resourceId: this.functionApp.site.id
     });
  }

}
