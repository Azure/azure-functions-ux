import { SiteService } from './../shared/services/site.service';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { Component, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SlotsNode } from '../tree-view/slots-node';
import { AiService } from '../shared/services/ai.service';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { Site } from '../shared/models/arm/site';
import { PortalService } from '../shared/services/portal.service';
import { AppNode } from '../tree-view/app-node';
import { RequiredValidator } from '../shared/validators/requiredValidator';
import { PortalResources } from '../shared/models/portal-resources';
import { SlotNameValidator } from '../shared/validators/slotNameValidator';
import { errorIds } from '../shared/models/error-ids';
import { AuthzService } from '../shared/services/authz.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Constants } from 'app/shared/models/constants';
import { NavigableComponent, ExtendedTreeViewInfo } from '../shared/components/navigable-component';

@Component({
  selector: 'slot-new',
  templateUrl: './slot-new.component.html',
  styleUrls: ['./slot-new.component.scss'],
})
export class SlotNewComponent extends NavigableComponent {
  public Resources = PortalResources;
  public slotOptinEnabled: boolean;
  public hasCreatePermissions: boolean;
  public newSlotForm: FormGroup;
  public slotNamePlaceholder: string;
  public hasReachedDynamicQuotaLimit: boolean;
  public isLoading = true;

  private _slotsNode: SlotsNode;
  private _siteId: string;
  private _slotsList: ArmObj<Site>[];
  private _siteObj: ArmObj<Site>;

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _portalService: PortalService,
    private _aiService: AiService,
    private _siteService: SiteService,
    private _functionAppService: FunctionAppService,
    private authZService: AuthzService,
    private injector: Injector
  ) {
    super('slot-new', injector, DashboardType.CreateSlotDashboard);
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(v =>
        this._functionAppService.getAppContext(v.siteDescriptor.getTrimmedResourceId()).map(r =>
          Object.assign(v, {
            context: r,
          })
        )
      )
      .switchMap(viewInfo => {
        this._slotsNode = <SlotsNode>viewInfo.node;
        const validator = new RequiredValidator(this._translateService);

        // parse the site resourceId from slot's
        this._siteId = viewInfo.context.site.id;
        const slotNameValidator = new SlotNameValidator(this.injector, this._siteId);
        this.newSlotForm = this.fb.group({
          name: [null, validator.validate.bind(validator), slotNameValidator.validate.bind(slotNameValidator)],
        });

        return Observable.zip(
          this.authZService.hasPermission(this._siteId, [AuthzService.writeScope]),
          this.authZService.hasReadOnlyLock(this._siteId),
          this._siteService.getSite(this._siteId),
          this._functionAppService.getSlotsList(viewInfo.context),
          this._siteService.getAppSettings(this._siteId)
        );
      })
      .do(r => {
        const writePermission = r[0];
        const readOnlyLock = r[1];
        this._siteObj = r[2].result;
        this._slotsList = r[3].result;
        const as = r[4];

        this.hasCreatePermissions = writePermission && !readOnlyLock;

        this.slotOptinEnabled =
          this._slotsList.length > 0 ||
          (as.isSuccessful && as.result.properties[Constants.slotsSecretStorageSettingsName] === Constants.slotsSecretStorageSettingsValue);

        const sku = this._siteObj.properties.sku;
        this.hasReachedDynamicQuotaLimit = !!sku && sku.toLowerCase() === 'dynamic' && this._slotsList.length === 1;
        this.isLoading = false;
      });
  }

  onFunctionAppSettingsClicked() {
    const appNode = <AppNode>this._slotsNode.parent;
    appNode.openSettings();
  }

  createSlot() {
    const newSlotName = this.newSlotForm.controls['name'].value;
    let notificationId = null;
    this.setBusy();
    // show create slot start notification
    this._portalService
      .startNotification(
        this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName),
        this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName)
      )
      .first()
      .switchMap(s => {
        notificationId = s.id;
        return this._siteService.createSlot(this._siteObj.id, newSlotName, this._siteObj.location, this._siteObj.properties.serverFarmId);
      })
      .subscribe(r => {
        this.clearBusy();

        // update notification
        const notifyTitle = r.isSuccessful
          ? PortalResources.slotNew_startCreateSuccessNotifyTitle
          : PortalResources.slotNew_startCreateFailureNotifyTitle;
        this._portalService.stopNotification(
          notificationId,
          r.isSuccessful,
          this._translateService.instant(notifyTitle).format(newSlotName)
        );

        if (r.isSuccessful) {
          let slotsNode = <SlotsNode>this.viewInfo.node;
          // If someone refreshed the app, it would created a new set of child nodes under the app node.
          slotsNode = <SlotsNode>this.viewInfo.node.parent.children.find(node => node.title === slotsNode.title);
          slotsNode.addChild(r.result);
          slotsNode.isExpanded = true;
        } else {
          this.showComponentError({
            message: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
            details: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
            errorId: errorIds.failedToCreateSlot,
            resourceId: this._siteObj.id,
          });
          this._aiService.trackEvent(errorIds.failedToCreateApp, { error: r.error.result, id: this._siteObj.id });
        }
      });
  }
}
