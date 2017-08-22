import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-kudu-github-essentials',
    templateUrl: './kudu-github-essentials.component.html',
    styleUrls: ['./kudu-github-essentials.component.scss']
})
export class KuduGithubEssentialsComponent implements OnInit {
    @Input() resourceId: string;
    constructor() {}

    ngOnInit() {}
}
