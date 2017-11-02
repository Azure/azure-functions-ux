import { UserService } from './../../shared/services/user.service';
import { Links } from './../../shared/models/constants';
import { Component, OnInit, OnDestroy, Input, Injector } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
        const sub = info.subscriptions.find(s => s.state === 'Enabled');
        if (!sub) {
          return;
        }

        this._subscriptionId = sub.subscriptionId;

        let required = new RequiredValidator(this._translateService);
        let siteNameValidator = new SiteNameValidator(injector, sub.subscriptionId);

        this.group = _fb.group({
          name: [
            null,
            required.validate.bind(required),
            siteNameValidator.validate.bind(siteNameValidator)]
        });
      });

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
    const name = this.group.controls['name'].value;

    const id = `/subscriptions/${this._subscriptionId}/resourceGroups/StandaloneResourceGroup/providers/Microsoft.Web/sites/${name}`;

    const body = {
      properties: {
        siteConfig: {
          appSettings: []
        },
        sku: 'Dynamic',
        clientAffinityEnabled: false
      },
      location: 'local',
      kind: 'functionapp'
    };

    this._globalStateService.setBusyState();
    this._cacheService.putArm(id, null, body)
      .subscribe(r => {
        this._globalStateService.clearBusyState();
        const siteObj = <ArmObj<Site>>r.json();
        const appsNode = <AppsNode>this._viewInfo.node;
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
