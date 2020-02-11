import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { FunctionKeysFormValues, FunctionKeysModel } from './FunctionKeys.types';
import { sortBy } from 'lodash-es';

export default class FunctionKeysData {
  public convertStateToForm = (props: { keys: { [key: string]: string } | null }): FunctionKeysFormValues => {
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

  private _retrieveFunctionKeys = (keys: { [key: string]: string } | null): FunctionKeysModel[] => {
    if (!keys) {
      return [];
    }
    return sortBy(
      Object.keys(keys).map((key, i) => ({
        name: key,
        value: keys[key],
      })),
      h => h.name.toLowerCase()
    );
  };
}
