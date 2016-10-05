import {Component, OnInit} from '@angular/core';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {AiService} from '../services/ai.service';

declare var mixpanel: any;

@Component({
    selector: 'trial-expired',
    templateUrl: 'templates/trial-expired.component.html',
    styleUrls: ['styles/trial-expired.styles.css'],
    pipes: [TranslatePipe]
})
export class TrialExpiredComponent implements OnInit {

    public freeTrialUri: string;

    constructor(private _aiService: AiService) {
        this.freeTrialUri = `${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free` + ((mixpanel) ? "?correlationId=" + mixpanel.get_distinct_id() : "");;
    }

    ngOnInit() { }

    trackClick(buttonName: string) {
        if (buttonName) {
            try {
                this._aiService.trackEvent(buttonName, { expired: "true" });
            } catch (error) {
                this._aiService.trackException(error, 'trackClick');
            }
        }
    }

}