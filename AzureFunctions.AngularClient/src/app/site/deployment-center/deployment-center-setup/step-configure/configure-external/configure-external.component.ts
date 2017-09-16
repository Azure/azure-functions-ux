import { Component, OnInit } from '@angular/core';
import { SelectOption } from 'app/shared/models/select-option';

@Component({
    selector: 'app-configure-external',
    templateUrl: './configure-external.component.html',
    styleUrls: ['./configure-external.component.scss', '../step-configure.component.scss']
})
export class ConfigureExternalComponent implements OnInit {
    public RepoTypeOptions: SelectOption<string>[] = [
        {
            displayLabel: 'Mercurial',
            value: 'Mercurial'
        },
        {
            displayLabel: 'Git',
            value: 'Git'
        }
    ];
    public repoMode = 'Git';
    constructor() {}

    ngOnInit() {}

    repoTypeChanged(evt) { 
      this.repoMode = evt;
      console.log(evt);
    }
}
