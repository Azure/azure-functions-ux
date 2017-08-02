import { Component, OnInit } from '@angular/core';
import { UIResource } from '../shared/models/ui-resource';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { FunctionsService } from '../shared/services/functions.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { GlobalStateService } from '../shared/services/global-state.service';
import { AiService } from '../shared/services/ai.service';


@Component({
    selector: 'try-now',
    templateUrl: './try-now.component.html',
    styleUrls: ['./try-now.component.scss']
})
export class TryNowComponent implements OnInit {
    private uiResource: UIResource;
    private endTime: Date;

    public freeTrialUri: string;
    public timerText: string;
    public discoverMoreUri: string;

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService) {
        // TODO: Add cookie referer details like in try
        this.freeTrialUri = `${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free`;
        this.discoverMoreUri = `${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/services/functions/`;

        const callBack = () => {
            window.setTimeout(() => {
                let mm;
                const now = new Date();

                const msLeft = this.endTime.getTime() - now.getTime();
                if (this.endTime >= now) {
                    // http://stackoverflow.com/questions/1787939/check-time-difference-in-javascript
                    mm = Math.floor(msLeft / 1000 / 60);
                    if (mm < 1) {
                        this.timerText = (this._translateService.instant(PortalResources.tryNow_lessThanOneMinute));
                    } else {
                        this.timerText = this.pad(mm, 2) + ' ' + this._translateService.instant(PortalResources.tryNow_minutes);
                    }
                    window.setTimeout(callBack, 1000);
                } else {
                    this.timerText = this._translateService.instant(PortalResources.tryNow_trialExpired);
                    this._globalStateService.TrialExpired = true;
                    this._broadcastService.broadcast(BroadcastEvent.TrialExpired);
                }
            });
        };

        this._functionsService.getTrialResource()
            .subscribe((resource) => {
                this.uiResource = resource;
                this.endTime = new Date();
                this.endTime.setSeconds(this.endTime.getSeconds() + resource.timeLeft);
                callBack();
            });
    }

    ngOnInit() { }

    // http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
    pad(n, width) {
        const z = '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    trackLinkClick(buttonName: string) {
        if (buttonName) {
            try {
                this._aiService.trackLinkClick(buttonName, this._globalStateService.TrialExpired.toString());
            } catch (error) {
                this._aiService.trackException(error, 'trackLinkClick');
            }
        }
    }
}
