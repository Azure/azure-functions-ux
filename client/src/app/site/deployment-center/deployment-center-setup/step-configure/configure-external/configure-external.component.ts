import { Component } from '@angular/core';
import { SelectOption } from 'app/shared/models/select-option';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { RequiredValidator } from '../../../../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../../shared/models/portal-resources';

@Component({
  selector: 'app-configure-external',
  templateUrl: './configure-external.component.html',
  styleUrls: ['./configure-external.component.scss', '../step-configure.component.scss', '../../deployment-center-setup.component.scss'],
})
export class ConfigureExternalComponent {
  public RepoTypeOptions: SelectOption<string>[] = [
    {
      displayLabel: 'Mercurial',
      value: 'Mercurial',
    },
    {
      displayLabel: 'Git',
      value: 'Git',
    },
  ];

  public AccessTypeOptions: SelectOption<boolean>[] = [
    {
      displayLabel: this._translateService.instant(PortalResources.no),
      value: false,
    },
    {
      displayLabel: this._translateService.instant(PortalResources.yes),
      value: true,
    },
  ];

  public repoMode = 'Git';
  public privateRepo = false;
  constructor(public wizard: DeploymentCenterStateManager, private _translateService: TranslateService) {
    this.updateFormValidation();
  }

  repoTypeChanged(evt) {
    this.repoMode = evt;
    const wizardValues = this.wizard.wizardValues;
    wizardValues.sourceSettings.isMercurial = evt === 'Mercurial';
    this.wizard.wizardValues = wizardValues;
  }

  accessTypeChanged(evt) {
    this.privateRepo = evt;
    const wizardValues = this.wizard.wizardValues;
    wizardValues.sourceSettings.privateRepo = this.privateRepo;
    this.wizard.wizardValues = wizardValues;
  }

  updateFormValidation() {
    const required = new RequiredValidator(this._translateService, false);
    this.wizard.sourceSettings.get('repoUrl').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('branch').setValidators(required.validate.bind(required));
    this.wizard.sourceSettings.get('repoUrl').updateValueAndValidity();
    this.wizard.sourceSettings.get('branch').updateValueAndValidity();
  }
}
