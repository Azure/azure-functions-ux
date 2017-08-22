import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-external-git-essentials',
    templateUrl: './kudu-external-git-essentials.component.html',
    styleUrls: ['./kudu-external-git-essentials.component.scss']
})
export class KuduExternalGitEssentialsComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
