import {Component, OnInit} from '@angular/core';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'trial-expired',
    templateUrl: 'templates/trial-expired.component.html',
    styleUrls: ['styles/trial-expired.styles.css'],
    pipes: [TranslatePipe]
})
export class TrialExpiredComponent implements OnInit {

    public freeTrialUri: string;

    constructor() {
        var freeTrialExpireCachedQuery = `try_functionsexpiredpage`;
        this.freeTrialUri = `${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free?WT.mc_id=${freeTrialExpireCachedQuery}`;
    }

    ngOnInit() { }
}