import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-vso-dashboard',
    templateUrl: './kudu-vso-dashboard.component.html',
    styleUrls: ['./kudu-vso-dashboard.component.scss']
})
export class KuduVsoDashboardComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
