import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-dropbox-essentials',
    templateUrl: './kudu-dropbox-essentials.component.html',
    styleUrls: ['./kudu-dropbox-essentials.component.scss']
})
export class KuduDropboxEssentialsComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
