import { UserService } from './../../shared/services/user.service';
import { Links, RuntimeImage } from './../../shared/models/constants';
import { Component, OnInit, OnDestroy, Input, Injector } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { ErrorIds } from './../../shared/models/error-ids';
import { ErrorEvent, ErrorType } from './../../shared/models/error-event';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { AiService } from './../../shared/services/ai.service';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { CacheService } from './../../shared/services/cache.service';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { SiteNameValidator } from './../../shared/validators/siteNameValidator';
import { DropDownElement } from './../../shared/models/drop-down-element';
import { AppsNode } from './../../tree-view/apps-node';
import { PortalResources } from './../../shared/models/portal-resources';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { Site } from 'app/shared/models/arm/site';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { DashboardType } from 'app/tree-view/models/dashboard-type';


@Component({
  selector: 'create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss']
})
export class CreateAppComponent implements OnInit, OnDestroy {
  public Resources = PortalResources;
  public group: FormGroup;
  public viewInfoStream: Subject<TreeViewInfo<any>>;
  public FwdLinks = Links;
  public subscriptionOptions: DropDownElement<string>[] = [];
  public runtimeImageOptions: DropDownElement<string>[] = [];

  private _viewInfo: TreeViewInfo<any>;
  private _subscriptionId: string;
  private _ngUnsubscribe = new Subject<void>();

  constructor(
    private _broadcastService: BroadcastService,
    private _cacheService: CacheService,
    private _globalStateService: GlobalStateService,
    private _translateService: TranslateService,
    _fb: FormBuilder,
    private _aiService: AiService,
    userService: UserService,
    injector: Injector) {

    userService.getStartupInfo()
      .first()
      .subscribe(info => {
        const subs = info.subscriptions;
        let defaultSubId: string;
        subs.forEach(sub => {
          if (sub.state === 'Enabled') {
            this.subscriptionOptions.push({
              displayLabel: `${sub.displayName}(${sub.subscriptionId})`,
              value: sub.subscriptionId
            });
            if (!defaultSubId) {
              defaultSubId = sub.subscriptionId;
            }
          }
        });
        const sub = subs.find(s => s.state === 'Enabled');
        if (!sub) {
          return;
        }

        this._subscriptionId = sub.subscriptionId;

        const required = new RequiredValidator(this._translateService);
        const siteNameValidator = new SiteNameValidator(injector, sub.subscriptionId);

        this.group = _fb.group({
          name: [
            null,
            required.validate.bind(required),
            siteNameValidator.validate.bind(siteNameValidator)],
          subscription: defaultSubId,
          runtimeImage: RuntimeImage.v2
        });
      });

    this.runtimeImageOptions.push({
      displayLabel : this._translateService.instant(PortalResources.runtimeImagev1),
      value: RuntimeImage.v1
    });
    this.runtimeImageOptions.push({
      displayLabel : this._translateService.instant(PortalResources.runtimeImagev2),
      value: RuntimeImage.v2,
      default: true
    });
    /* RDBug 10690532:[Functions] Add/Enable custom runtime Image switch for create app page
    this.runtimeImageOptions.push({
      displayLabel : this._translateService.instant(PortalResources.runtimeImageCustom),
      value: RuntimeImage.custom
    });
    */

    this.viewInfoStream = new Subject<TreeViewInfo<any>>();
    this.viewInfoStream
      .subscribe(viewInfo => {
        this._viewInfo = viewInfo;
      });

  }

  @Input() set viewInfoInput(viewInfo: TreeViewInfo<any>) {
    this.viewInfoStream.next(viewInfo);
  }

  ngOnInit() {
    this._broadcastService.getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
    .filter(info => {
      return info.dashboardType === DashboardType.createApp;
    })
    .takeUntil(this._ngUnsubscribe)
    .subscribe(info => {
      this.viewInfoStream.next(info);
    });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
  }

  create() {
    const nameControl = <CustomFormControl>this.group.controls['name'];
    const name = nameControl.value;
    if (!name) {
      nameControl._msRunValidation = true;
      nameControl.updateValueAndValidity();
      return;
    }

    const id = `/subscriptions/${this.group.controls['subscription'].value}/resourceGroups/StandaloneResourceGroup/providers/Microsoft.Web/sites/${name}`;

    const body = {
      properties: {
        siteConfig: {
          appSettings: []
        },
        sku: 'Dynamic',
        clientAffinityEnabled: false,
        runtimeImage: this.group.controls['runtimeImage'].value
      },
      location: 'local',
      kind: 'functionapp'
    };

    this._globalStateService.setBusyState();
    this._cacheService.putArm(id, null, body)
      .subscribe(r => {
        this._globalStateService.clearBusyState();
        const siteObj: ArmObj<Site> = r.json();
        const appsNode: AppsNode = <AppsNode>this._viewInfo.node;
        appsNode.addChild(siteObj);
      }, error => {
        this._globalStateService.clearBusyState();

        this._broadcastService.broadcast<ErrorEvent>(
          BroadcastEvent.Error, {
            message: this._translateService.instant(PortalResources.createApp_fail),
            details: this._translateService.instant(PortalResources.createApp_fail),
            errorId: ErrorIds.failedToCreateApp,
            errorType: ErrorType.Fatal,
            resourceId: id
          });

        this._aiService.trackEvent(ErrorIds.failedToCreateApp, { error: error, id: id });
      });

  }

}
