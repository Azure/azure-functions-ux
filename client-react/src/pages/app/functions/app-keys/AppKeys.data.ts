import { AppKeysFormValues, AppKeysInfo, AppKeysModel, AppKeysTypes } from './AppKeys.types';
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

  public fetchKeys = (resourceId: string) => {
    return AppKeyService.fetchKeys(resourceId);
  };

  public deleteKey = (resourceId: string, keyName: string, keyType: AppKeysTypes) => {
    AppKeyService.deleteKey(resourceId, keyName, keyType);
  };

  public createKey = (resourceId: string, keyName: string, keyValue: string, keyType: AppKeysTypes) => {
    AppKeyService.createKey(resourceId, keyType, keyName, keyValue);
  };

  private _retrieveHostKeys = (keys: AppKeysInfo | null): AppKeysModel[] => {
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

  private _retrieveSystemKeys = (keys: AppKeysInfo | null): AppKeysModel[] => {
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
