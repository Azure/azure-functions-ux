import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { ArmService } from '../../../../shared/services/arm.service';
import { Site } from '../../../../shared/models/arm/site';
import { ArmObj, Sku } from '../../../../shared/models/arm/arm-obj';
import { Guid } from '../../../../shared/Utilities/Guid';
import { ArmResourceDescriptor } from '../../../../shared/resourceDescriptors';
import { ServerFarm } from '../../../../shared/models/server-farm';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';

@Component({
  selector: 'app-step-test',
  templateUrl: './step-test.component.html',
  styleUrls: ['./step-test.component.scss', '../deployment-center-setup.component.scss'],
})
export class StepTestComponent implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();

  testEnvironmentOptions = [{ displayLabel: 'No', value: false }, { displayLabel: 'Yes', value: true }];

  newAppServicePlanOptions = [{ displayLabel: 'New', value: true }, { displayLabel: 'Existing', value: false }];
  appServicePlanList: DropDownElement<string>[] = [];
  appsList: DropDownElement<string>[] = [];

  selectedAppServicePlan = '';
  selectedWebApp = '';

  appServicePlansLoading = false;
  appsLoading = false;
  private _appServicePlanSubscription$ = new Subject<string>();
  private _appsSubscription$ = new Subject<string>();
  private _currentAppData$ = new Subject<string>();
  private _currentPlanData$ = new Subject<string>();

  private _currentPlanData: ArmObj<ServerFarm>;
  private _currentAppData: ArmObj<Site>;
  newAppName = 'newAppName';
  resourceGroup = 'resourceGroupName';
  appServicePlanName = 'asp Name';
  pricingTierData: Sku = null;
  location = 'South Central US';
  subId = '';
  constructor(public wizard: DeploymentCenterStateManager, private _armService: ArmService, private _translateService: TranslateService) {
    this._currentAppData$.switchMap(resourceId => this._armService.get(resourceId)).subscribe(r => {
      this._currentAppData = r.json();
      this.newAppName = `${this._currentAppData.name.substring(0, 30)}-loadtest-${Guid.newTinyGuid()}`;
      this.resourceGroup = this._currentAppData.properties.resourceGroup;
      this.appServicePlanName = `${this._currentAppData.name.substring(0, 30)}-loadtest-${Guid.newTinyGuid()}`;
      this.location = this._currentAppData.location;
      this._currentPlanData$.next(this._currentAppData.properties.serverFarmId);
    });

    this._currentPlanData$.switchMap(resourceId => this._armService.get(resourceId)).subscribe(r => {
      this._currentPlanData = r.json();
      this.pricingTierData = this._currentPlanData.sku;
      this.exitingNewChanged(true);
    });

    this._appServicePlanSubscription$
      .switchMap(subscriptionId => this._armService.get(`/subscriptions/${subscriptionId}/providers/Microsoft.Web/serverFarms`))
      .subscribe(r => {
        const armList = r.json().value;
        this.appServicePlanList = armList.map(plan => {
          return {
            displayLabel: `${plan.name} (${plan.properties.resourceGroup})`,
            value: plan.id,
          };
        });
        this.appServicePlansLoading = false;
      });

    this._appsSubscription$.switchMap(aspId => this._armService.get(`${aspId}/sites`)).subscribe(r => {
      const siteList = r.json().value;
      this.appsList = siteList.filter(x => x.location === this.location).map(site => {
        return {
          displayLabel: site.name,
          value: site.id,
        };
      });
      this.appsLoading = false;
    });

    if (!this.wizard.canCreateNewSite) {
      wizard.wizardValues = {
        ...wizard.wizardValues,
        testEnvironment: {
          ...wizard.wizardValues.testEnvironment,
          newApp: false,
        },
      };
    }
    wizard.resourceIdStream$.subscribe(r => {
      this.appServicePlansLoading = true;
      const armResource = new ArmResourceDescriptor(r);
      this.subId = armResource.subscription;
      this._appServicePlanSubscription$.next(armResource.subscription);
      this._currentAppData$.next(r);
    });
  }

  get pricingTier() {
    if (this.pricingTierData) {
      const tier = this.pricingTierData.tier;
      const name = this.pricingTierData.name;
      return `${tier} (${name})`;
    } else {
      return this._translateService.instant(PortalResources.loading);
    }
  }

  exitingNewChanged(value) {
    if (value) {
      const values = this.wizard.wizardValues;
      values.testEnvironment = {
        ...values.testEnvironment,
        webAppId: `/subscriptions/${this.subId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/sites/${this.newAppName}`,
        appServicePlanId: `/subscriptions/${this.subId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/serverFarms/${
          this.appServicePlanName
        }`,
      };
      this.wizard.wizardValues = values;
    } else {
      this.wizard.testEnvironmentSettings.controls['webAppId'].reset();
      this.wizard.testEnvironmentSettings.controls['appServicePlanId'].reset();
    }
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  aspChanged(event: DropDownElement<string>) {
    this.appsLoading = true;
    this._appsSubscription$.next(event.value);
  }
}
