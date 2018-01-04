import { ScenarioIds } from './../../models/constants';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { PortalResources } from './../../models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { SiteDescriptor } from 'app/shared/resourceDescriptors';
import { ScenarioCheckInput } from './scenario.models';
import { Environment, ScenarioResult } from 'app/shared/services/scenario/scenario.models';

export class SiteSlotEnvironment extends Environment {
    name = 'SiteSlot';

    constructor(translateService: TranslateService) {
        super();
        this.scenarioChecks[ScenarioIds.showSiteAvailability] = {
            id: ScenarioIds.showSiteAvailability,
            runCheck: () => {
                return { status: 'disabled' };
            }
        };

        this.scenarioChecks[ScenarioIds.enableMsi] = {
            id: ScenarioIds.enableMsi,
            runCheck: () => {
                return {
                    status: 'disabled',
                    data: translateService.instant(PortalResources.featureNotSupportedForSlots)
                };
            }
        };

        this.scenarioChecks[ScenarioIds.filterAppNodeChildren] = {
            id: ScenarioIds.filterAppNodeChildren,
            runCheck: (input: ScenarioCheckInput) => {
                return this._filterAppNodeChildren(input);
            }
        };
    }

    public isCurrentEnvironment(input?: ScenarioCheckInput): boolean {
        if (input && input.site) {
            const descriptor = SiteDescriptor.getSiteDescriptor(input.site.id);
            return !!descriptor.slot;
        }

        return false;
    }

    private _filterAppNodeChildren(input: ScenarioCheckInput) {
        const descriptor = new SiteDescriptor(input.site.id);
        let data = input.appNodeChildren;

        if (descriptor.slot) {
            data = input.appNodeChildren.filter(c => c.dashboardType !== DashboardType.SlotsDashboard);
        }

        return <ScenarioResult>{
            status: 'enabled',
            data: data
        };
    }
}
