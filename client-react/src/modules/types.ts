import { IPortalServiceState } from './portal/portal-service-reducer';
import { ISiteState } from './site/reducer';
import { IWebConfigState } from './site/config/web/reducer';
import { IMetadataConfigState } from './site/config/metadata/reducer';
import { IAppSettingsState } from './site/config/appsettings/reducer';
import { IConnectionStringState } from './site/config/connectionstrings/reducer';
import { IStacksState } from './service/available-stacks/reducer';
import { ISlotListState } from './site/slots/reducer';
import { IRbacState } from './service/rbac/reducer';
import { IBillingMetersState } from './service/billing/reducer';
import { IPlanState } from './plan/reducer';
import { ISlotConfigNamesState } from './site/config/slotConfigNames/reducer';

export default interface IState {
  portalService: IPortalServiceState;
  /*ARM values */
  site: ISiteState;
  webConfig: IWebConfigState;
  metadata: IMetadataConfigState;
  appSettings: IAppSettingsState;
  connectionStrings: IConnectionStringState;
  stacks: IStacksState;
  slots: ISlotListState;
  rbac: IRbacState;
  billingMeter: IBillingMetersState;
  plan: IPlanState;
  slotConfigNames: ISlotConfigNamesState;
}
