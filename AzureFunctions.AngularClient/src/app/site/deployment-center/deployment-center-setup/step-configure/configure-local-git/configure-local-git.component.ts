import { Component, OnInit } from '@angular/core';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';

@Component({
  selector: 'app-configure-local-git',
  templateUrl: './configure-local-git.component.html',
  styleUrls: ['./configure-local-git.component.scss', '../../deployment-center-setup.component.scss']
})
export class ConfigureLocalGitComponent implements OnInit {

  constructor(
    wizard: DeploymentCenterStateManager
  ) {
    wizard.sourceSettings.get('repoUrl').setValidators([]);
    wizard.sourceSettings.get('branch').setValidators([]);
    wizard.sourceSettings.get('isMercurial').setValidators([]);
    wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
    wizard.sourceSettings.get('branch').updateValueAndValidity();
    wizard.sourceSettings.get('isMercurial').updateValueAndValidity();
  }

  ngOnInit() {
  }

}
