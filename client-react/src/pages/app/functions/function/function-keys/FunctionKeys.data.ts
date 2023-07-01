import { sortBy } from 'lodash-es';

import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { KeyValue } from '../../../../../models/portal-models';

import { FunctionKeysFormValues, FunctionKeysModel } from './FunctionKeys.types';

export default class FunctionKeysData {
  public convertStateToForm = (props: { keys: KeyValue<string> | null }): FunctionKeysFormValues => {
    const { keys } = props;
    return {
      keys: this._retrieveFunctionKeys(keys),
    };
  };

  public fetchKeys = (resourceId: string) => {
    return FunctionsService.fetchKeys(resourceId);
  };

  public deleteKey = (resourceId: string, keyName: string) => {
    return FunctionsService.deleteKey(resourceId, keyName);
  };

  public createKey = (resourceId: string, keyName: string, keyValue: string) => {
    return FunctionsService.createKey(resourceId, keyName, keyValue);
  };

  private _retrieveFunctionKeys = (keys: KeyValue<string> | null): FunctionKeysModel[] => {
    if (!keys) {
      return [];
    }
    return sortBy(
      Object.keys(keys).map(key => ({
        name: key,
        value: keys[key],
      })),
      h => h.name.toLowerCase()
    );
  };
}
