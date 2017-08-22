import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-local-git-essentials',
    templateUrl: './kudu-local-git-essentials.component.html',
    styleUrls: ['./kudu-local-git-essentials.component.scss']
})
export class KuduLocalGitEssentialsComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
