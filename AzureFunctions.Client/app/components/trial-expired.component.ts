import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'trial-expired',
    templateUrl: 'templates/trial-expired.component.html',
    styleUrls: ['styles/trial-expired.styles.css']
})
export class TrialExpiredComponent implements OnInit {

    public freeTrialUri: string;

    constructor() {
        var freeTrialExpireCachedQuery = `try_functionstimer`;
        this.freeTrialUri = `${window.location.protocol}//azure.microsoft.com/${window.navigator.language}/free?WT.mc_id=${freeTrialExpireCachedQuery}`;
    }

    ngOnInit() { }
}