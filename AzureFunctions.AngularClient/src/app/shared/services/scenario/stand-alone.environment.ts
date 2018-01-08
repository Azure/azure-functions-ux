import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { ScenarioCheckInput, ScenarioResult } from './scenario.models';
import { ScenarioIds } from './../../models/constants';
import { Environment } from 'app/shared/services/scenario/scenario.models';

export class StandaloneEnvironment extends Environment {
    name = 'Standalone';

    constructor() {
        super();
        this.scenarioChecks[ScenarioIds.addSiteConfigTab] = {
            id: ScenarioIds.addSiteConfigTab,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.addSiteFeaturesTab] = {
            id: ScenarioIds.addSiteFeaturesTab,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.showSitePin] = {
            id: ScenarioIds.showSitePin,
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

        this.scenarioChecks[ScenarioIds.showCreateRefreshSub] = {
            id: ScenarioIds.showCreateRefreshSub,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.deleteAppDirectly] = {
            id: ScenarioIds.deleteAppDirectly,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.createApp] = {
            id: ScenarioIds.createApp,
            runCheck: () => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.filterAppNodeChildren] = {
            id: ScenarioIds.filterAppNodeChildren,
            runCheck: (input: ScenarioCheckInput) => {
                return this._filterAppNodeChildren(input);
            }
        };

        this.scenarioChecks[ScenarioIds.headerOnTopOfSideNav] = {
            id: ScenarioIds.headerOnTopOfSideNav,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.topBarWarning] = {
            id: ScenarioIds.topBarWarning,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.userMenu] = {
            id: ScenarioIds.userMenu,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.standAloneUserMenu] = {
            id: ScenarioIds.standAloneUserMenu,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.standAloneUserMenu] = {
            id: ScenarioIds.useCustomFunctionInputPicker,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.quickStartLink] = {
            id: ScenarioIds.quickStartLink,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.noPaddingOnSideNav] = {
            id: ScenarioIds.noPaddingOnSideNav,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'enabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.downloadWithAppSettings] = {
            id: ScenarioIds.downloadWithAppSettings,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.downloadWithVsProj] = {
            id: ScenarioIds.downloadWithVsProj,
            runCheck: (input: ScenarioCheckInput) => {
                return { status: 'disabled' };
            }
        };

    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        return window.appsvc.env.runtimeType === 'Standalone';
    }

    private _filterAppNodeChildren(input: ScenarioCheckInput) {
        const data = input.appNodeChildren.find(c => c.dashboardType === DashboardType.FunctionsDashboard);
        return <ScenarioResult>{
            status: 'enabled',
            data: [data]
        };
    }
}
