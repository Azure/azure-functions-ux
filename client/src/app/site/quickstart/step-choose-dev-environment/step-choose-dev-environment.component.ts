import { devEnvironmentOptions } from './../wizard-logic/quickstart-models';
import { Component, OnDestroy } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { TranslateService } from '@ngx-translate/core';
import { DevEnvironmentCard } from '../Models/dev-environment-card';
import { PortalResources } from '../../../shared/models/portal-resources';
import { workerRuntimeOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';
import { Subject } from 'rxjs/Subject';
import { QuickstartService } from 'app/site/quickstart/quickstart.service';
@Component({
  selector: 'step-choose-dev-environment',
  templateUrl: './step-choose-dev-environment.component.html',
  styleUrls: ['./step-choose-dev-environment.component.scss', '../quickstart.component.scss'],
})
export class StepChooseDevEnvironmentComponent implements OnDestroy {
  public readonly vsCard: DevEnvironmentCard = {
    id: 'vs',
    name: this._translateService.instant(PortalResources.vsCardTitle),
    icon: 'image/visual_studio.svg',
    color: '#865FC5',
    description: this._translateService.instant(PortalResources.vsCardDescription),
  };

  public readonly vsCodeCard: DevEnvironmentCard = {
    id: 'vscode',
    name: this._translateService.instant(PortalResources.vscodeCardTitle),
    icon: 'image/vs_code.svg',
    color: '#0067B8',
    description: this._translateService.instant(PortalResources.vscodeCardDescription),
  };

  public readonly coreToolsCard: DevEnvironmentCard = {
    id: 'coretools',
    name: this._translateService.instant(PortalResources.coretoolsCardTitle),
    icon: 'image/terminal.svg',
    color: '#54B4D9',
    description: this._translateService.instant(PortalResources.coretoolsCardDescription),
  };

  public readonly mavenCard: DevEnvironmentCard = {
    id: 'maven',
    name: this._translateService.instant(PortalResources.mavenCardTitle),
    icon: 'image/terminal.svg',
    color: '#54B4D9',
    description: this._translateService.instant(PortalResources.mavenCardDescription),
  };

  public readonly portalCard: DevEnvironmentCard = {
    id: 'portal',
    name: this._translateService.instant(PortalResources.portalCardTitle),
    icon: 'image/azure_mgmt_portal.svg',
    color: '#54B4D9',
    description: this._translateService.instant(PortalResources.portalCardDescription),
  };

  public selectedDevEnvironmentCard: DevEnvironmentCard = null;
  public devEnvironmentCards: DevEnvironmentCard[];
  public workerRuntime: workerRuntimeOptions;
  public isLinux: boolean;
  public isLinuxConsumption: boolean;
  public fileName: string;

  private _ngUnsubscribe = new Subject();

  constructor(
    private _wizardService: QuickstartStateManager,
    private _translateService: TranslateService,
    private _quickstartService: QuickstartService
  ) {
    this.workerRuntime = this._wizardService.workerRuntime.value;
    this.isLinux = this._wizardService.isLinux.value;
    this.isLinuxConsumption = this._wizardService.isLinuxConsumption.value;
    this.devEnvironmentCards = this._getDevEnvironmentCards();

    this._wizardService.workerRuntime.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.workerRuntime = this._wizardService.workerRuntime.value;
      this.devEnvironmentCards = this._getDevEnvironmentCards();
    });

    this._wizardService.isLinux.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.isLinux = this._wizardService.isLinux.value;
      this.devEnvironmentCards = this._getDevEnvironmentCards();
    });

    this._wizardService.isLinuxConsumption.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.isLinuxConsumption = this._wizardService.isLinuxConsumption.value;
      this.devEnvironmentCards = this._getDevEnvironmentCards();
    });
  }

  public selectDevEnvironment(card: DevEnvironmentCard) {
    this.selectedDevEnvironmentCard = card;
    this._wizardService.devEnvironment.setValue(card.id);
    if (this.isLinuxConsumption) {
      this._setDefaultDeploymentMethod(card.id);
    }
  }

  public checkNeedInstructions() {
    if (this.isLinuxConsumption) {
      this._quickstartService.getQuickstartFile(this.fileName).subscribe(file => {
        this._wizardService.instructions.setValue(file);
      });
    }
  }

  private _getDevEnvironmentCards(): DevEnvironmentCard[] {
    switch (this.workerRuntime) {
      case 'dotnet':
        return this._dotnetEnvironmentCards();
      case 'node':
      case 'nodejs':
        return this._nodeEnvironmentCards();
      case 'python':
        return this._pythonEnvironmentCards();
      case 'java':
        return this._javaEnvironmentCards();
      case 'powershell':
        return this._powershellEnvironmentCards();
      default:
        return [];
    }
  }

  private _dotnetEnvironmentCards(): DevEnvironmentCard[] {
    if (this.isLinux) {
      if (this.isLinuxConsumption) {
        return [this.vsCodeCard, this.coreToolsCard];
      }
      return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
    }
    return [this.vsCard, this.vsCodeCard, this.coreToolsCard, this.portalCard];
  }

  private _nodeEnvironmentCards(): DevEnvironmentCard[] {
    if (this.isLinuxConsumption) {
      return [this.vsCodeCard, this.coreToolsCard];
    }
    return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
  }

  private _pythonEnvironmentCards(): DevEnvironmentCard[] {
    return [this.vsCodeCard, this.coreToolsCard];
  }

  private _javaEnvironmentCards(): DevEnvironmentCard[] {
    if (this.isLinux) {
      return [];
    }
    return [this.vsCodeCard, this.mavenCard];
  }

  private _powershellEnvironmentCards(): DevEnvironmentCard[] {
    return [this.vsCodeCard, this.coreToolsCard, this.portalCard];
  }

  private _setDefaultDeploymentMethod(devEnvironment: devEnvironmentOptions) {
    switch (devEnvironment) {
      case 'vscode':
        this._wizardService.deployment.setValue('vscodeDirectPublish');
        this.fileName = 'vscodeDirectPublish';
        break;
      case 'coretools':
        this._wizardService.deployment.setValue('coretoolsDirectPublish');
        this.fileName = 'coretoolsDirectPublish';
        break;
    }
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }
}
