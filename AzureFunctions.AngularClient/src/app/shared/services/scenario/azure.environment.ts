import { ScenarioIds, ServerFarmSku } from './../../models/constants';
import { Observable } from 'rxjs/Observable';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { Environment } from 'app/shared/services/scenario/scenario.models';

export class AzureEnvironment extends Environment {
    name = 'Azure';

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.addSiteFeaturesTab] = {
            id: ScenarioIds.addSiteFeaturesTab,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addSiteQuotas] = {
            id: ScenarioIds.addSiteQuotas,
            runCheck: (input: ScenarioCheckInput) => {
                return this._showSiteQuotas(input);
            }
        };

        this.scenarioChecks[ScenarioIds.addSiteFileStorage] = {
            id: ScenarioIds.addSiteFileStorage,
            runCheck: (input: ScenarioCheckInput) => {
                return this._showSiteFileStorage(input);
            }
        };

        this.scenarioChecks[ScenarioIds.getSiteSlotLimits] = {
            id: ScenarioIds.getSiteSlotLimits,
            runCheckAsync: (input: ScenarioCheckInput) => {
                return Observable.of(this._getSlotLimit(input));
            }
        };

        this.scenarioChecks[ScenarioIds.enablePlatform64] = {
            id: ScenarioIds.enablePlatform64,
            runCheck: (input: ScenarioCheckInput) => {
                return this._enableIfBasicOrHigher(input);
            }
        };

        this.scenarioChecks[ScenarioIds.enableAlwaysOn] = {
            id: ScenarioIds.enableAlwaysOn,
            runCheck: (input: ScenarioCheckInput) => {
                return this._enableIfBasicOrHigher(input);
            }
        };

        this.scenarioChecks[ScenarioIds.enableAutoSwap] = {
            id: ScenarioIds.enableAutoSwap,
            runCheck: (input: ScenarioCheckInput) => {
                return this._enableIfStandardOrHigher(input);
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return window.appsvc.env.runtimeType === 'Azure';
    }

    private _enableIfBasicOrHigher(input: ScenarioCheckInput) {
        const disabled = input
            && input.site
            && (input.site.properties.sku === ServerFarmSku.free
                || input.site.properties.sku === ServerFarmSku.shared);

        return <ScenarioResult>{
            status: disabled ? 'disabled' : 'enabled',
            data: null
        };
    }

    private _enableIfStandardOrHigher(input: ScenarioCheckInput) {
        const disabled = input
            && input.site
            && (input.site.properties.sku === ServerFarmSku.free
                || input.site.properties.sku === ServerFarmSku.shared
                || input.site.properties.sku === ServerFarmSku.basic);

        return <ScenarioResult>{
            status: disabled ? 'disabled' : 'enabled',
            data: null
        };
    }

    private _showSiteQuotas(input: ScenarioCheckInput) {
        const site = input && input.site;

        if (!site) {
            throw Error('No site input specified');
        }

        const showQuotas = input.site.properties.sku === ServerFarmSku.free
            || input.site.properties.sku === ServerFarmSku.shared;

        return <ScenarioResult>{
            status: showQuotas ? 'enabled' : 'disabled',
            data: null
        };
    }

    private _showSiteFileStorage(input: ScenarioCheckInput) {
        const site = input && input.site;

        if (!site) {
            throw Error('No site input specified');
        }

        const showFileStorage = input.site.properties.sku !== ServerFarmSku.free
            && input.site.properties.sku !== ServerFarmSku.shared;

        return <ScenarioResult>{
            status: showFileStorage ? 'enabled' : 'disabled',
            data: null
        };
    }

    private _getSlotLimit(input: ScenarioCheckInput) {
        const site = input && input.site;
        if (!site) {
            throw Error('No site input specified');
        }

        let limit: number;

        switch (site.properties.sku) {
            case ServerFarmSku.free:
            case ServerFarmSku.basic:
                limit = 0;
                break;
            case ServerFarmSku.dynamic:
                limit = 1;
                break;
            case ServerFarmSku.standard:
                limit = 5;
                break;
            case ServerFarmSku.premium:
            case ServerFarmSku.premiumV2:
            case ServerFarmSku.isolated:
                limit = 20;
                break;
            default:
                limit = 0;
        }

        return <ScenarioResult>{
            status: 'enabled',
            data: limit
        };
    }
}
