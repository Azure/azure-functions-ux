import { Response } from '@angular/http';
import { LanguageService } from './../../shared/services/language.service';
import { Observable, Subject, Subscription as RxSubscription } from 'rxjs/Rx';
import { CacheService } from './../../shared/services/cache.service';
import { Site } from './../../shared/models/arm/site';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { Component, Input, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ArmService } from '../../shared/services/arm.service';
import { PortalService } from '../../shared/services/portal.service';
import { FunctionContainer } from '../../shared/models/function-container';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event'
import { FunctionsService } from '../../shared/services/functions.service';
import { Constants } from '../../shared/models/constants';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { TranslatePipe } from 'ng2-translate/ng2-translate';
import { AiService } from '../../shared/services/ai.service';

@Component({
  selector: 'function-runtime',
  templateUrl: './function-runtime.component.html',
  styleUrls: ['./function-runtime.component.scss'],
  inputs: ['viewInfoInput']
})
export class FunctionRuntimeComponent implements OnDestroy {
  public site: ArmObj<Site>;
  public memorySize: number | string;
  public dirty: boolean;
  public needUpdateExtensionVersion;
  public extensionVersion: string;
  public latestExtensionVersion: string;
  public dailyMemoryTimeQuota: string;
  public showDailyMemoryWarning: boolean = false;
  public showDailyMemoryInfo: boolean = false;
  private showTryView: boolean;

  private _viewInfoStream = new Subject<TreeViewInfo>();
  private _viewInfoSub: RxSubscription;
  private _appNode: AppNode;

  constructor(
    private _armService: ArmService,
    private _cacheService: CacheService,
    private _portalService: PortalService,
    private _broadcastService: BroadcastService,
    private _functionsService: FunctionsService,
    private _globalStateService: GlobalStateService,
    private _aiService: AiService,
    private _languageService: LanguageService) {

    this.showTryView = this._globalStateService.showTryView;
    this._viewInfoSub = this._viewInfoStream
      .switchMap(viewInfo => {

        this._globalStateService.setBusyState();

        this._appNode = (<AppNode>viewInfo.node);

        return Observable.zip(
          this._cacheService.getArm(viewInfo.resourceId),
          this._cacheService.postArm(`${viewInfo.resourceId}/config/appsettings/list`),
          (s: Response, a: Response) => ({ siteResponse: s, appsettingsResponse: a }))

      })
      .subscribe(r => {
        let appSettings: ArmObj<any> = r.appsettingsResponse.json();
        this.site = r.siteResponse.json();

        this.dailyMemoryTimeQuota = this.site.properties.dailyMemoryTimeQuota
          ? this.site.properties.dailyMemoryTimeQuota.toString()
          : "0";

        if (this.dailyMemoryTimeQuota === "0") {
          this.dailyMemoryTimeQuota = "";
        }
        else {
          this.showDailyMemoryInfo = true;
        }

        this.showDailyMemoryWarning = (!this.site.properties.enabled && this.site.properties.siteDisabledReason === 1);

        this.memorySize = this.site.properties.containerSize;
        this.latestExtensionVersion = Constants.runtimeVersion;
        this.extensionVersion = appSettings.properties[Constants.runtimeVersionAppSettingName];

        this.needUpdateExtensionVersion =
          Constants.runtimeVersion !== this.extensionVersion && Constants.latest !== this.extensionVersion.toLowerCase();

        this._globalStateService.clearBusyState();
        
      })
  }

  set viewInfoInput(viewInfo: TreeViewInfo) {
    this._viewInfoStream.next(viewInfo);
  }

  onChange(value: string | number, event?: any) {
    if (this.isIE()) {
      value = event.srcElement.value;
      this.memorySize = value;
    }
    this.dirty = (typeof value === 'string' ? parseInt(value) : value) !== this.site.properties.containerSize;
  }

  ngOnDestroy() {
    if (this._viewInfoSub) {
      this._viewInfoSub.unsubscribe();
      this._viewInfoSub = null;
    }
  }

  saveMemorySize(value: string | number) {
    this._globalStateService.setBusyState();
    this._updateMemorySize(this.site, value)
      .subscribe(r => { this._globalStateService.clearBusyState(); Object.assign(this.site, r); this.dirty = false; });
  }

  isIE(): boolean {
    return navigator.userAgent.toLocaleLowerCase().indexOf("trident") !== -1;
  }

  updateVersion() {
    this._aiService.trackEvent('/actions/app_settings/update_version');
    this._globalStateService.setBusyState();
    this._cacheService.postArm(`${this.site.id}/config/appsettings/list`, true)
      .flatMap(r => {
        return this._updateContainerVersion(this.site, r.json());
      })
      .subscribe(r => {
        this.needUpdateExtensionVersion = false;
        this._globalStateService.clearBusyState();
        this._cacheService.clearCachePrefix(this.site.id);
        this._appNode.refresh(null);
      })
  }

  setQuota() {
    var dailyMemoryTimeQuota = +this.dailyMemoryTimeQuota;

    if (dailyMemoryTimeQuota > 0) {
      this._globalStateService.setBusyState();
      this._updateDailyMemory(this.site, dailyMemoryTimeQuota).subscribe(() => {
        this.showDailyMemoryInfo = true;
        this.site.properties.dailyMemoryTimeQuota = dailyMemoryTimeQuota;
        this._globalStateService.clearBusyState();
      });
    }
  }

  removeQuota() {
    this._globalStateService.setBusyState();
    this._updateDailyMemory(this.site, 0).subscribe(() => {
      this.showDailyMemoryInfo = false;
      this.showDailyMemoryWarning = false;
      this.dailyMemoryTimeQuota = "";
      this.site.properties.dailyMemoryTimeQuota = 0;
      this._globalStateService.clearBusyState();
    });
  }

  private _updateContainerVersion(site: ArmObj<Site>, appSettings: ArmObj<any>) {
    if (appSettings.properties[Constants.azureJobsExtensionVersion]) {
      delete appSettings[Constants.azureJobsExtensionVersion];
    }
    appSettings.properties[Constants.runtimeVersionAppSettingName] = Constants.runtimeVersion;
    appSettings.properties[Constants.nodeVersionAppSettingName] = Constants.nodeVersion;

    return this._cacheService.putArm(appSettings.id, this._armService.websiteApiVersion, appSettings);
  }

  private _updateDailyMemory(site: ArmObj<Site>, value: number) {

    var body = JSON.stringify({
      Location: site.location,
      Properties: {
        dailyMemoryTimeQuota: value
      }
    });

    return this._cacheService.putArm(site.id, this._armService.websiteApiVersion, body)
  }


  private _updateMemorySize(site: ArmObj<Site>, memorySize: string | number) {
    var nMemorySize = typeof memorySize === 'string' ? parseInt(memorySize) : memorySize;
    site.properties.containerSize = nMemorySize;

    return this._cacheService.putArm(site.id, this._armService.websiteApiVersion, site)
      .map<ArmObj<Site>>(r => r.json());
  }
}