import {Component, OnInit} from '@angular/core';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {AiService} from '../shared/services/ai.service';

@Component({
  selector: 'trial-expired',
  templateUrl: './trial-expired.component.html',
  styleUrls: ['./trial-expired.component.css']
})
export class TrialExpiredComponent implements OnInit {

    public freeTrialUri: string;

    constructor(private _aiService: AiService) {
        this.freeTrialUri = `${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free`;
    }

    ngOnInit() { }

    trackLinkClick(buttonName: string) {
        if (buttonName) {
            try {
                this._aiService.trackLinkClick(buttonName, "true");
            } catch (error) {
                this._aiService.trackException(error, 'trackLinkClick');
            }
        }
    }

}