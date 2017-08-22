import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-onedrive-essentials',
    templateUrl: './kudu-onedrive-essentials.component.html',
    styleUrls: ['./kudu-onedrive-essentials.component.scss']
})
export class KuduOnedriveEssentialsComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
