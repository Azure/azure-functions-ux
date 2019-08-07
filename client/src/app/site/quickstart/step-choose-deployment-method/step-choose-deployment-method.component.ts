import { devEnvironmentOptions } from './../wizard-logic/quickstart-models';
import { QuickstartService } from './../quickstart.service';
import { Component, OnDestroy } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { DeploymentCard } from 'app/site/quickstart/Models/deployment-card';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { Subject } from 'rxjs/Subject';
import { KeyCodes } from 'app/shared/models/constants';

@Component({
  selector: 'step-choose-deployment-method',
  templateUrl: './step-choose-deployment-method.component.html',
  styleUrls: ['./step-choose-deployment-method.component.scss', '../quickstart.component.scss'],
})
export class StepChooseDeploymentMethodComponent implements OnDestroy {
  public readonly deploymentCenterCard: DeploymentCard = {
    id: 'deploymentCenter',
    name: this._translateService.instant(PortalResources.deploymentCenterCardTitle),
    icon: 'image/deployment_center_color.svg',
    color: '#54B4D9',
    description: this._translateService.instant(PortalResources.deploymentCenterCardDescription),
  };

  public readonly vsDirectPublishCard: DeploymentCard = {
    id: 'vsDirectPublish',
    name: this._translateService.instant(PortalResources.directPublishCardTitle),
    icon: 'image/publish.svg',
    color: '#BA141A',
    description: this._translateService.instant(PortalResources.vsDirectPublishCardDescription),
  };

  public readonly vscodeDirectPublishCard: DeploymentCard = {
    id: 'vscodeDirectPublish',
    name: this._translateService.instant(PortalResources.directPublishCardTitle),
    icon: 'image/publish.svg',
    color: '#BA141A',
    description: this._translateService.instant(PortalResources.vscodeDirectPublishCardDescription),
  };

  public readonly coretoolsDirectPublishCard: DeploymentCard = {
    id: 'coretoolsDirectPublish',
    name: this._translateService.instant(PortalResources.directPublishCardTitle),
    icon: 'image/publish.svg',
    color: '#BA141A',
    description: this._translateService.instant(PortalResources.coretoolsDirectPublishCardDescription),
  };

  public readonly mavenDirectPublishCard: DeploymentCard = {
    id: 'mavenDirectPublish',
    name: this._translateService.instant(PortalResources.directPublishCardTitle),
    icon: 'image/publish.svg',
    color: '#BA141A',
    description: this._translateService.instant(PortalResources.mavenDirectPublishCardDescription),
  };

  public selectedDeploymentCard: DeploymentCard = null;

  public devEnvironment: devEnvironmentOptions;
  public deploymentCards: DeploymentCard[];

  private _ngUnsubscribe = new Subject();

  constructor(
    private _wizardService: QuickstartStateManager,
    private _translateService: TranslateService,
    private _quickstartService: QuickstartService
  ) {
    this.devEnvironment = this._wizardService.devEnvironment.value;
    this.deploymentCards = this._getDeploymentCards();

    this._wizardService.devEnvironment.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.devEnvironment = this._wizardService.devEnvironment.value;
      this.deploymentCards = this._getDeploymentCards();
    });
  }

  public selectDeployment(card: DeploymentCard) {
    this.selectedDeploymentCard = card;
    this._wizardService.deployment.setValue(card.id);
  }

  public getInstructions() {
    const markdownFileName = this._getMarkdownFileName();
    this._quickstartService.getQuickstartFile(markdownFileName).subscribe(file => {
      this._wizardService.instructions.setValue(file);
    });
  }

  public onKeyPress(event: KeyboardEvent, card: DeploymentCard) {
    if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      this.selectDeployment(card);
    }
  }

  private _getDeploymentCards(): DeploymentCard[] {
    switch (this.devEnvironment) {
      case 'vs':
        return [this.vsDirectPublishCard, this.deploymentCenterCard];
      case 'vscode':
        return [this.vscodeDirectPublishCard, this.deploymentCenterCard];
      case 'coretools':
        return [this.coretoolsDirectPublishCard, this.deploymentCenterCard];
      case 'maven':
        return [this.mavenDirectPublishCard, this.deploymentCenterCard];
      default:
        return [];
    }
  }

  private _getMarkdownFileName(): string {
    switch (this.selectedDeploymentCard.id) {
      case 'deploymentCenter':
        return this._getDeploymentCenterMarkdownFileName();
      case 'vsDirectPublish':
        return 'vsDirectPublish';
      case 'vscodeDirectPublish':
        return 'vscodeDirectPublish';
      case 'coretoolsDirectPublish':
        return 'coretoolsDirectPublish';
      case 'mavenDirectPublish':
        return 'mavenDirectPublish';
      default:
        return null;
    }
  }

  private _getDeploymentCenterMarkdownFileName(): string {
    switch (this.devEnvironment) {
      case 'vs':
        return 'vsDeploymentCenter';
      case 'vscode':
        return 'vscodeDeploymentCenter';
      case 'coretools':
        return 'coretoolsDeploymentCenter';
      case 'maven':
        return 'mavenDeploymentCenter';
      default:
        return null;
    }
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }
}
