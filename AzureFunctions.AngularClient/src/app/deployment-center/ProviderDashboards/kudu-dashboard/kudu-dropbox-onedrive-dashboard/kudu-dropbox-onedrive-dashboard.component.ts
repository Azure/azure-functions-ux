import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-dropbox-essentials',
    templateUrl: './kudu-dropbox-onedrive-dashboard.component.html',
    styleUrls: ['./kudu-dropbox-onedrive-dashboard.component.scss']
})
export class KuduDropboxOnedriveDashboardComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
