import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-vsts-essentials',
    templateUrl: './kudu-vsts-essentials.component.html',
    styleUrls: ['./kudu-vsts-essentials.component.scss']
})
export class KuduVstsEssentialsComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
