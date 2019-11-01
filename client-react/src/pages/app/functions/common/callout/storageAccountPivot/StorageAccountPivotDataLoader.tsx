import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import StorageAccountData from './StorageAccountPivot.data';
import StorageAccountPivot from './StorageAccountPivot';

const storageAccountPivotData = new StorageAccountData();
export const StorageAccountPivotContext = React.createContext(storageAccountPivotData);

const StorageAccountDataLoader: React.SFC<NewConnectionCalloutProps> = props => {
  return (
    <StorageAccountPivotContext.Provider value={storageAccountPivotData}>
      <StorageAccountPivot {...props} />
    </StorageAccountPivotContext.Provider>
  );
};

export default StorageAccountDataLoader;
