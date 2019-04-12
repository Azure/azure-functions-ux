import { ApplicationSettings } from './../../shared/models/arm/application-settings';
import { devEnvironmentOptions, workerRuntimeOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';
import { SiteService } from './../../shared/services/site.service';
import { SiteTabIds, Constants, SubscriptionQuotaIds, ContainerConstants } from 'app/shared/models/constants';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Component, OnDestroy } from '@angular/core';
import { QuickstartStateManager } from 'app/site/quickstart/wizard-logic/quickstart-state-manager';
import { FormBuilder } from '@angular/forms';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BusyStateScopeManager } from '../../busy-state/busy-state-scope-manager';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../shared/models/portal-resources';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { errorIds } from 'app/shared/models/error-ids';
import { UserService } from 'app/shared/services/user.service';
import { Subject } from 'rxjs/Subject';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { Subscription as Subs } from 'app/shared/models/subscription';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { BillingService } from './../../shared/services/billing.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'quickstart',
  templateUrl: './quickstart.component.html',
  styleUrls: ['./quickstart.component.scss'],
  providers: [QuickstartStateManager],
})
export class QuickstartComponent extends FunctionAppContextComponent implements OnDestroy {
  public quickstartTitle = this._translateService.instant(PortalResources.topBar_quickStart);
  public workerRuntime: workerRuntimeOptions;
  public isElastic: boolean;
  public isBYOC: boolean;
  public isLinux: boolean;
  public isLinuxConsumption: boolean;
  public canUseQuickstart: boolean;
  public loading = true;
  public showDeploymentStep: boolean;
  public devEnvironment: devEnvironmentOptions;
  public appSettingsArm: ArmObj<ApplicationSettings>;
  public runtime: string;
  public isDreamspark: boolean;
  public possibleRuntimes: DropDownElement<string>[] = [
    {
      displayLabel: '.NET',
      value: 'dotnet',
    },
    {
      displayLabel: 'JavaScript',
      value: 'node',
    },
  ];

  private _ngUnsubscribe = new Subject();
  private _busyManager: BusyStateScopeManager;
  private _subs: Subs[];
  private readonly _validWorkerRuntimes = ['dotnet', 'node', 'nodejs', 'python', 'java', 'powershell'];

  constructor(
    private _wizardService: QuickstartStateManager,
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _translateService: TranslateService,
    private _billingService: BillingService,
    broadcastService: BroadcastService,
    functionAppService: FunctionAppService,
    userService: UserService
  ) {
    super('quickstart', functionAppService, broadcastService, () => this._busyManager.setBusy());

    this._wizardService.wizardForm = this._fb.group({
      // wizard values
      devEnvironment: [null],
      workerRuntime: [null],
      portalTemplate: [null],
      deployment: [null],
      instructions: [null],

      // app values
      context: [null],
      isLinux: [null],
      isLinuxConsumption: [null],
      isElastic: [null],
      isBYOC: [null],
      subscriptionName: [null],
      isDreamspark: [null],
    });

    userService
      .getStartupInfo()
      .first()
      .subscribe(info => {
        this._subs = info.subscriptions;
      });

    this._wizardService.devEnvironment.statusChanges.takeUntil(this._ngUnsubscribe).subscribe(() => {
      this.devEnvironment = this._wizardService.devEnvironment.value;
      this.showDeploymentStep = this._checkShowDeploymentStep();
    });

    this._busyManager = new BusyStateScopeManager(broadcastService, SiteTabIds.quickstart);
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .takeUntil(this.ngUnsubscribe)
      .switchMap(viewInfo => {
        this._busyManager.setBusy();
        const subscriptionId = new ArmSiteDescriptor(viewInfo.context.site.id).subscription;
        return Observable.zip(
          this._siteService.getAppSettings(viewInfo.context.site.id),
          this._billingService.checkIfSubscriptionHasQuotaId(subscriptionId, SubscriptionQuotaIds.dreamSparkQuotaId)
        );
      })
      .subscribe(r => {
        if (r[0].isSuccessful) {
          this.appSettingsArm = r[0].result;
          if (this.appSettingsArm.properties.hasOwnProperty(Constants.functionsWorkerRuntimeAppSettingsName)) {
            const workerRuntimeSetting = this.appSettingsArm.properties[Constants.functionsWorkerRuntimeAppSettingsName].toLowerCase();

            if (this._validWorkerRuntimes.indexOf(workerRuntimeSetting) !== -1) {
              this.isDreamspark = r[1];
              this._useValidWorkerRuntime(workerRuntimeSetting);
            } else {
              this.canUseQuickstart = false;
            }
          } else {
            this.canUseQuickstart = false;
          }
          this.isBYOC =
            ArmUtil.isContainerApp(this.context.site) &&
            this.appSettingsArm.properties[ContainerConstants.appServiceStorageSetting] === 'false';
        } else {
          this.showComponentError({
            errorId: errorIds.quickstartLoadError,
            message: `${r[0].error}`,
            resourceId: this.context.site.id,
          });
        }
        this.loading = false;
        this._busyManager.clearBusy();
      });
  }

  private _useValidWorkerRuntime(workerRuntime: string) {
    this.workerRuntime = workerRuntime as workerRuntimeOptions;
    this.isElastic = ArmUtil.isElastic(this.context.site);
    this.isLinux = ArmUtil.isLinuxApp(this.context.site);
    this.isLinuxConsumption = ArmUtil.isLinuxDynamic(this.context.site);

    this._setInitalProperties();
    this._setQuickstartTitle();
    this.canUseQuickstart = true;
  }

  private _setQuickstartTitle() {
    switch (this.workerRuntime) {
      case 'dotnet':
        this.quickstartTitle = this._translateService.instant(PortalResources.quickstartDotnetTitle);
        break;
      case 'node':
      case 'nodejs':
        this.quickstartTitle = this._translateService.instant(PortalResources.quickstartNodeTitle);
        break;
      case 'python':
        this.quickstartTitle = this._translateService.instant(PortalResources.quickstartPythonTitle);
        break;
      case 'java':
        this.quickstartTitle = this._translateService.instant(PortalResources.quickstartJavaTitle);
        break;
      case 'powershell':
        this.quickstartTitle = this._translateService.instant(PortalResources.quickstartPowershellTitle);
        break;
    }
  }

  private _setInitalProperties() {
    const currentFormValues = this._wizardService.wizardValues;
    currentFormValues.workerRuntime = this.workerRuntime;
    currentFormValues.context = this.context;
    currentFormValues.isLinux = this.isLinux;
    currentFormValues.isLinuxConsumption = this.isLinuxConsumption;
    currentFormValues.isElastic = this.isElastic;
    currentFormValues.isBYOC = this.isBYOC;
    currentFormValues.subscriptionName = this._findSubscriptionName();
    currentFormValues.isDreamspark = this.isDreamspark;
    this._wizardService.wizardValues = currentFormValues;
  }

  private _findSubscriptionName(): string {
    const descriptor = new ArmSiteDescriptor(this.context.site.id);
    const subscriptionId = descriptor.subscription;

    return this._subs ? this._subs.find(s => s.subscriptionId === subscriptionId).displayName : '{subscriptionName}';
  }

  private _checkShowDeploymentStep(): boolean {
    return (
      this.devEnvironment === 'vs' ||
      this.devEnvironment === 'maven' ||
      (this.devEnvironment === 'vscode' && (!this.isLinux || (this.isLinux && !this.isLinuxConsumption))) ||
      (this.devEnvironment === 'coretools' && (!this.isLinux || (this.isLinux && !this.isLinuxConsumption)))
    );
  }

  onRuntimeChanged(runtime: string) {
    this.runtime = runtime;
  }

  setRuntime() {
    this._busyManager.setBusy();

    this.appSettingsArm.properties[Constants.functionsWorkerRuntimeAppSettingsName] = this.runtime;

    this._siteService
      .updateAppSettings(this.context.site.id, this.appSettingsArm)
      .do(null, e => {
        this._busyManager.clearBusy();
        this.showComponentError(e);
      })
      .subscribe(() => {
        this._useValidWorkerRuntime(this.runtime);
        this._busyManager.clearBusy();
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }
}
