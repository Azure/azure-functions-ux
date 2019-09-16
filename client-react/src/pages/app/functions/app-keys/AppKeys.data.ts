import { AppKeysFormValues } from './AppKeys.types';
import SiteService from '../../../../ApiHelpers/SiteService';

export default class AppKeysData {
  public convertStateToForm = (props: AppKeysFormValues): AppKeysFormValues => {
    const { site, hostKeys, systemKeys } = props;
    return {
      site,
      hostKeys,
      systemKeys,
    };
  };

  public getSiteObject = (resourceId: string) => {
    return SiteService.fetchSite(resourceId);
  };
}
