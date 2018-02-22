import { Component, OnInit } from '@angular/core';
import { SelectOption } from '../../../../../shared/models/select-option';
//import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
//import { TranslateService } from '@ngx-translate/core';
//import { PortalResources } from '../../../../../shared/models/portal-resources';

@Component({
  selector: 'app-configure-vsts-build',
  templateUrl: './configure-vsts-build.component.html',
  styleUrls: ['./configure-vsts-build.component.scss', '../step-configure.component.scss']
})
export class ConfigureVstsBuildComponent implements OnInit {

  public NewVsoAccountOptions: SelectOption<string>[];
  
  constructor(
   // private _translateService: TranslateService
  // private _wizard: DeploymentCenterStateManager
  ) { 
    this.NewVsoAccountOptions =
            [{ displayLabel: 'New', value: 'new' },
            { displayLabel: 'Existing', value: 'existing' }];

  }

  get newOrExisting() {
    return 'new';
  }
  ngOnInit() {
  }

}
