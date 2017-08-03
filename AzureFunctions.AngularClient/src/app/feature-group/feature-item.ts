import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { DisableInfo } from './feature-item';
import { PortalService } from '../shared/services/portal.service';
import { OpenBladeInfo } from '../shared/models/portal';

export interface DisableInfo {
    enabled: boolean;
    disableMessage: string;
}

export class FeatureItem {
    public title: string | null;
    public keywords: string | null;  // Space delimited
    public enabled = true;
    public info: string | null;
    public warning: string | null;
    public isHighlighted: boolean | null;
    public isEmpty: boolean | null;   // Used to reserve blank space when filtering results
    public highlight: boolean | null;
    public iconUrl = 'images/activity-log.svg';
    public superScriptIconUrl: string | null = null;

    constructor(title: string, keywords: string, info: string, iconUrl?: string, superScriptIconUrl?: string) {
        this.title = title;
        this.keywords = keywords;
        this.info = info;
        this.iconUrl = iconUrl ? iconUrl : this.iconUrl;

        this.superScriptIconUrl = superScriptIconUrl;
    }

    click() {
    }

    dispose() {
    }
}

export class DisableableFeature extends FeatureItem {
    private _enabledRxSub: RxSubscription;
    public enabled = false;

    constructor(
        title: string,
        keywords: string,
        info: string,
        imageUrl: string,
        _disableInfoStream?: Subject<DisableInfo>,
        overrideDisableInfo?: DisableInfo // If the feature is known to be disabled before any async logic, then use this disable immediately
    ) {
        super(title, keywords, info, imageUrl);

        if (overrideDisableInfo) {
            if (!overrideDisableInfo.enabled) {
                this.warning = overrideDisableInfo.disableMessage;
            }

            this.enabled = overrideDisableInfo.enabled;
        } else if (_disableInfoStream) {
            this._enabledRxSub = _disableInfoStream.subscribe(info => {
                this.enabled = info.enabled;

                if (!this.enabled) {
                    this.warning = info.disableMessage;
                }
            })
        }
    }

    dispose() {
        if (this._enabledRxSub) {
            this._enabledRxSub.unsubscribe();
            this._enabledRxSub = null;
        }
    }
}

export class DisableableBladeFeature extends DisableableFeature {
    constructor(
        title: string,
        keywords: string,
        info: string,
        imageUrl: string,
        protected _bladeInfo: OpenBladeInfo,
        protected _portalService: PortalService,
        disableInfoStream?: Subject<DisableInfo>,
        overrideDisableInfo?: DisableInfo) {
        super(title, keywords, info, imageUrl, disableInfoStream, overrideDisableInfo);
    }

    click() {
        this._portalService.openBlade(this._bladeInfo, 'site-manage');
    }
}

export class DisableableDyanmicBladeFeature extends DisableableBladeFeature {
    constructor(
        title: string,
        keywords: string,
        info: string,
        imageUrl: string,
        bladeInfo: OpenBladeInfo,
        portalService: PortalService,
        disableInfoStream?: Subject<DisableInfo>,
        overrideDisableInfoStream?: DisableInfo) {

        super(
            title,
            keywords,
            info,
            imageUrl,
            bladeInfo,
            portalService,
            disableInfoStream,
            overrideDisableInfoStream);
    }

    click() {
        this._portalService.openBlade(this._bladeInfo, 'site-manage');
    }
}

export class BladeFeature extends FeatureItem {
    constructor(title: string,
        keywords: string,
        info: string,
        imageUrl: string,
        public bladeInfo: OpenBladeInfo,
        private _portalService: PortalService) {
        super(title, keywords, info, imageUrl);
    }

    click() {
        this._portalService.openBlade(this.bladeInfo, 'site-manage');
    }
}

export class OpenBrowserWindowFeature extends FeatureItem {
    constructor(
        title: string,
        keywords: string,
        info: string,
        private _url: string) {

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
        private _broadcastService: BroadcastService) {

        super(title, keywords, info, imageUrl, 'images/new-tab.svg');
    }

    click() {
        this._broadcastService.broadcast(BroadcastEvent.OpenTab, this.featureId);
    }
}
