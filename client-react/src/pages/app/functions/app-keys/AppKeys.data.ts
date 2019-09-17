import { AppKeysFormValues, AppKeysInfo, FormHostKeys } from './AppKeys.types';
import SiteService from '../../../../ApiHelpers/SiteService';
import AppKeyService from '../../../../ApiHelpers/AppKeysService';
import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';
import { sortBy } from 'lodash-es';

export default class AppKeysData {
  public convertStateToForm = (props: { site: ArmObj<Site>; keys: AppKeysInfo | null }): AppKeysFormValues => {
    const { site, keys } = props;
    return {
      site,
      hostKeys: this._retrieveHostKeys(keys),
      systemKeys: this._retrieveSystemKeys(keys),
    };
  };

  public getKeys = (resourceId: string) => {
    return AppKeyService.getKeys(resourceId);
  };

  public getSiteObject = (resourceId: string) => {
    return SiteService.fetchSite(resourceId);
  };

  private _retrieveHostKeys = (keys: AppKeysInfo | null): FormHostKeys[] => {
    if (!keys) {
      return [];
    }
    const { masterKey, functionKeys } = keys;
    const hostKeys = Object.keys(functionKeys).map((key, i) => ({
      name: key,
      value: functionKeys[key],
    }));
    hostKeys.push({ name: '_master', value: masterKey });
    return sortBy(hostKeys, h => h.name.toLowerCase());
  };

  private _retrieveSystemKeys = (keys: AppKeysInfo | null): FormHostKeys[] => {
    if (!keys) {
      return [];
    }
    const { systemKeys } = keys;
    return sortBy(
      Object.keys(systemKeys).map((key, i) => ({
        name: key,
        value: systemKeys[key],
      })),
      h => h.name.toLowerCase()
    );
  };
}
