import { NationalCloudArmUris, ScenarioIds } from './../../models/constants';
import { AzureEnvironment } from './azure.environment';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { Injector } from '@angular/core';

export class NationalCloudEnvironment extends AzureEnvironment {
    name = 'NationalCloud';
    disabledBindings: string[] = [
        'apiHubFile',
        'apiHubTable',
        'apiHubFileTrigger'
    ];

    public static isNationalCloud() {
        return this.isMooncake() || this.isFairFax() || this.isBlackforest();
    }

    public static isFairFax() {
        return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.fairfax.toLowerCase();
    }

    public static isMooncake() {
        return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.mooncake.toLowerCase();
    }

    public static isBlackforest() {
        return window.appsvc.env.azureResourceManagerEndpoint.toLowerCase() === NationalCloudArmUris.blackforest.toLowerCase();
    }

    constructor(injector: Injector) {
        super(injector);
        this.scenarioChecks[ScenarioIds.addResourceExplorer] = {
            id: ScenarioIds.addResourceExplorer,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addPushNotifications] = {
            id: ScenarioIds.addPushNotifications,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addTinfoil] = {
            id: ScenarioIds.addTinfoil,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addLogicApps] = {
            id: ScenarioIds.addLogicApps,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.enableAppInsights] = {
            id: ScenarioIds.enableAppInsights,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addMsi] = {
            id: ScenarioIds.addMsi,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.enableExportToPowerApps] = {
            id: ScenarioIds.enableExportToPowerApps,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.disabledBindings] = {
            id: ScenarioIds.disabledBindings,
            runCheck: () => {
                return this._getDisabledBindings();
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return NationalCloudEnvironment.isNationalCloud();
    }

    private _getDisabledBindings() {
        return <ScenarioResult>{
            status: 'enabled',
            data: this.disabledBindings
        };
    }
}
