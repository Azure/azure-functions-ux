import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DropDownElement } from '../../../../shared/models/drop-down-element';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { ArmService } from '../../../../shared/services/arm.service';
import { ArmResourceDescriptor } from '../../../../shared/resourceDescriptors';

@Component({
    selector: 'app-step-test',
    templateUrl: './step-test.component.html',
    styleUrls: ['./step-test.component.scss']
})
export class StepTestComponent implements OnDestroy {

    private _ngUnsubscribe = new Subject();

    testEnvironmentOptions =
        [{ displayLabel: 'No', value: false },
        { displayLabel: 'Yes', value: true }];

    newAppServicePlanOptions =
        [{ displayLabel: 'New', value: true },
        { displayLabel: 'Existing', value: false }];
    appServicePlanList: DropDownElement<string>[] = [];
    appsList: DropDownElement<string>[] = [];

    selectedAppServicePlan = '';
    selectedWebApp = '';

    appServicePlansLoading = false;
    appsLoading = false;
    private _appServicePlanSubscription = new Subject<string>();
    private _appsSubscription = new Subject<string>();

    newAppName = 'newAppName';
    resourceGroup = 'resourceGroupName';
    appServicePlanName = 'asp Name';
    pricingTier = '(S1) Standard';
    location = 'South Central US';

    constructor(
        public wizard: DeploymentCenterStateManager,
        private _armService: ArmService
    ) {
        this._appServicePlanSubscription
            .switchMap(subscriptionId => this._armService.get(`/subscriptions/${subscriptionId}/providers/Microsoft.Web/serverFarms`))
            .subscribe(r => {
                const armList = r.json().value;
                this.appServicePlanList = armList.map(plan => {
                    return {
                        displayLabel: `${plan.name} (${plan.properties.resourceGroup})`,
                        value: plan.id
                    };
                });
                this.appServicePlansLoading = false;
            });

        this._appsSubscription
            .switchMap(aspId => this._armService.get(`${aspId}/sites`))
            .subscribe(r => {
                const siteList = r.json().value;
                this.appsList = siteList.map(site => {
                    return {
                        displayLabel: site.name,
                        value: site.id
                    };
                });
                this.appsLoading = false;
            })
        wizard.resourceIdStream.subscribe(r => {
            this.appServicePlansLoading = true;
            const armResource = new ArmResourceDescriptor(r);
            this._appServicePlanSubscription.next(armResource.subscription);
        });
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
    }

    aspChanged(event: DropDownElement<string>) {
        this.appsLoading = true;
        this._appsSubscription.next(event.value);
    }
}
