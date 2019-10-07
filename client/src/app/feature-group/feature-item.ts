import { ScenarioResult } from './../shared/services/scenario/scenario.models';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { DisableInfo } from './feature-item';
import { PortalService } from '../shared/services/portal.service';
import { OpenBladeInfo, FrameBladeParams } from '../shared/models/portal';
import { SiteTabIds } from 'app/shared/models/constants';
import { PortalResources } from 'app/shared/models/portal-resources';

export interface DisableInfo {
  enabled: boolean;
  disableMessage: string;
}

export class FeatureItem {
  public title: string | null;
  public keywords: string | null; // Space delimited
  public enabled = true;
  public info: string | null;
  public warning: string | null;
  public isHighlighted: boolean | null;
  public isEmpty: boolean | null; // Used to reserve blank space when filtering results
  public highlight: boolean | null;
  public iconUrl = 'image/activity-log.svg';
  public superScriptIconUrl: string | null = null;
  public nameFocusable: boolean;
  public imageFocusable: boolean;
  public onName = false;
  public onImage = false;

  constructor(title: string, keywords: string, info: string, iconUrl?: string, superScriptIconUrl?: string) {
    this.title = title;
    this.keywords = keywords;
    this.info = info;
    this.iconUrl = iconUrl ? iconUrl : this.iconUrl;

    this.superScriptIconUrl = superScriptIconUrl;
  }

  click() {}

  dispose() {}
}

export class DisableableFeature extends FeatureItem {
  private _enabledRxSub: RxSubscription;
  private _overrideSub: RxSubscription;
  public enabled = false;

  constructor(
    title: string,
    keywords: string,
    info: string,
    imageUrl: string,
    superScriptIconUrl?: string,
    _disableInfoStream?: Subject<DisableInfo>,
    overrideDisableInfo?: ScenarioResult, // If the feature is known to be disabled before any async logic, then use this disable immediately
    overrideDisableStream?: Subject<ScenarioResult>
  ) {
    super(title, keywords, info, imageUrl, superScriptIconUrl);

    if (overrideDisableInfo) {
      this.setWarningandEnabled(overrideDisableInfo);
    } else if (overrideDisableStream) {
      this._overrideSub = overrideDisableStream.subscribe(streamInfo => {
        this.setWarningandEnabled(streamInfo);
      });
    } else if (_disableInfoStream) {
      this._enabledRxSub = _disableInfoStream.subscribe(disableInfo => {
        this.enabled = disableInfo.enabled;

        if (!this.enabled) {
          this.warning = disableInfo.disableMessage;
        }
      });
    }
  }

  dispose() {
    if (this._enabledRxSub) {
      this._enabledRxSub.unsubscribe();
      this._enabledRxSub = null;
    }

    if (this._overrideSub) {
      this._overrideSub.unsubscribe();
      this._overrideSub = null;
    }
  }

  setWarningandEnabled(scenarioResult: ScenarioResult) {
    if (scenarioResult.status === 'disabled') {
      this.warning = scenarioResult.data;
    }

    this.enabled = scenarioResult.status !== 'disabled';
  }
}

abstract class BaseDisableableBladeFeature<T = any> extends DisableableFeature {
  constructor(
    title: string,
    keywords: string,
    info: string,
    imageUrl: string,
    protected _bladeInfo: OpenBladeInfo<T>,
    protected _portalService: PortalService,
    disableInfoStream?: Subject<DisableInfo>,
    overrideDisableInfo?: ScenarioResult
  ) {
    super(title, keywords, info, imageUrl, null, disableInfoStream, overrideDisableInfo);
  }
}

export class DisableableBladeFeature extends BaseDisableableBladeFeature<any> {
  click() {
    this._portalService.openBlade(this._bladeInfo, 'site-manage');
  }
}

export class DisableableFrameBladeFeature<T = any> extends BaseDisableableBladeFeature<FrameBladeParams<T>> {
  click() {
    this._portalService.openFrameBlade(this._bladeInfo, 'site-manage');
  }
}

abstract class BaseBladeFeature<T = any> extends FeatureItem {
  constructor(
    title: string,
    keywords: string,
    info: string,
    imageUrl: string,
    public bladeInfo: OpenBladeInfo<T>,
    protected _portalService: PortalService
  ) {
    super(title, keywords, info, imageUrl);
  }
}

export class BladeFeature extends BaseBladeFeature<any> {
  click() {
    this._portalService.openBlade(this.bladeInfo, 'site-manage');
  }
}

export class FrameBladeFeature<T = any> extends BaseBladeFeature<FrameBladeParams<T>> {
  click() {
    this._portalService.openFrameBlade(this.bladeInfo, 'site-manage');
  }
}

export class OpenBrowserWindowFeature extends FeatureItem {
  constructor(title: string, keywords: string, info: string, private _url: string) {
    super(title, keywords, info);
  }

  click() {
    window.open(this._url);
  }
}

export class TabFeature extends FeatureItem {
  constructor(
    title: string,
    keywords: string,
    info: string,
    imageUrl: string,
    public featureId: string,
    private _broadcastService: BroadcastService
  ) {
    super(title, keywords, info, imageUrl, 'image/new-tab.svg');

    if (featureId === SiteTabIds.logicApps) {
      this.warning = PortalResources.tab_logicAppsDeprecation;
    }
  }

  click() {
    this._broadcastService.broadcastEvent(BroadcastEvent.OpenTab, this.featureId);
  }
}

export class DisableableTabFeature extends DisableableFeature {
  constructor(
    title: string,
    keywords: string,
    info: string,
    imageUrl: string,
    public featureId: string,
    private _broadcastService: BroadcastService,
    disableInfoStream?: Subject<DisableInfo>,
    overrideDisableInfo?: ScenarioResult
  ) {
    super(title, keywords, info, imageUrl, 'image/new-tab.svg', disableInfoStream, overrideDisableInfo);
  }

  click() {
    this._broadcastService.broadcastEvent(BroadcastEvent.OpenTab, this.featureId);
  }
}
