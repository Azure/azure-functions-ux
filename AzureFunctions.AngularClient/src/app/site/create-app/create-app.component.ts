import { Links } from './../../shared/models/constants';
import { Subscription } from './../../shared/models/subscription';
import { AppNode } from './../../tree-view/app-node';
import { ErrorIds } from './../../shared/models/error-ids';
import { ErrorEvent, ErrorType } from './../../shared/models/error-event';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { AiService } from './../../shared/services/ai.service';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { CacheService } from './../../shared/services/cache.service';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { TranslateService } from '@ngx-translate/core';
import { SiteNameValidator } from './../../shared/validators/siteNameValidator';
import { ArmService } from './../../shared/services/arm.service';
import { AppsNode } from './../../tree-view/apps-node';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PortalResources } from './../../shared/models/portal-resources';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { Component, OnInit, Input, Injector } from '@angular/core';
import { RequiredValidator } from "app/shared/validators/requiredValidator";
import { Site } from "app/shared/models/arm/site";
import { BroadcastEvent } from "app/shared/models/broadcast-event";

@Component({
  selector: 'create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss']
})
export class CreateAppComponent implements OnInit {
  public Resources = PortalResources;
  public group : FormGroup;
  public viewInfoStream : Subject<TreeViewInfo>;
  public FwdLinks = Links;

  private _viewInfo : TreeViewInfo;
  private _subscriptionId : string;

  constructor(
    private _broadcastService : BroadcastService,
    private _cacheService : CacheService,
    private _globalStateService : GlobalStateService,
    private _translateService : TranslateService,
    private _armService : ArmService,
    private _fb : FormBuilder,
    private _aiService : AiService,
    injector : Injector) {
    this._armService.subscriptions
    .first()
    .subscribe(subs =>{
      let sub = subs.find(s => s.state === "Enabled");
      if(!sub){
        return;
      }

      this._subscriptionId = sub.subscriptionId;

      let required = new RequiredValidator(this._translateService);
      let siteNameValidator = new SiteNameValidator(injector, sub.subscriptionId);

      this.group = _fb.group({
        name : [
          null,
          required.validate.bind(required),
          siteNameValidator.validate.bind(siteNameValidator)]
      })
    })

    this.viewInfoStream = new Subject<TreeViewInfo>();
      this.viewInfoStream
      .subscribe(viewInfo =>{
        this._viewInfo = viewInfo;
    })
    
  }

  @Input() set viewInfoInput(viewInfo : TreeViewInfo){
    this.viewInfoStream.next(viewInfo);
  }

  ngOnInit() {
  }

  create(){
    let name = this.group.controls['name'].value;

    let id = `/subscriptions/${this._subscriptionId}/resourceGroups/StandaloneResourceGroup/providers/Microsoft.Web/sites/${name}`;

    let body = {
        properties: {
            siteConfig: {
                appSettings: []
            },
            sku: 'Dynamic',
            clientAffinityEnabled: false
        },
        location: "local",
        kind: 'functionapp'
    };

    this._globalStateService.setBusyState();
    this._cacheService.putArm(id, null, body)
    .subscribe(r =>{
      this._globalStateService.clearBusyState();
      
      let siteObj = <ArmObj<Site>>r.json();
      let appsNode = <AppsNode>this._viewInfo.node;
      appsNode.addChild(siteObj);
    }, error =>{
      this._globalStateService.clearBusyState();

      this._broadcastService.broadcast<ErrorEvent>(
        BroadcastEvent.Error, {
          message : this._translateService.instant(PortalResources.createApp_fail),
          details : this._translateService.instant(PortalResources.createApp_fail),
          errorId : ErrorIds.failedToCreateApp,
          errorType : ErrorType.Fatal
        });

        this._aiService.trackEvent(ErrorIds.failedToCreateApp, { error : error, id : id });
    });

  }

}
