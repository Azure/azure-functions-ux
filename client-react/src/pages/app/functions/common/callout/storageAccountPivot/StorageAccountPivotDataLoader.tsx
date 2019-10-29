import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FieldProps } from 'formik';
import StorageAccountData from './StorageAccountPivot.data';
import StorageAccountPivot from './StorageAccountPivot';

const storageAccountPivotData = new StorageAccountData();
export const StorageAccountPivotContext = React.createContext(storageAccountPivotData);

const DocumentDBDataLoader: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  return (
    <StorageAccountPivotContext.Provider value={storageAccountPivotData}>
      <StorageAccountPivot {...props} />
    </StorageAccountPivotContext.Provider>
  );
};

export default DocumentDBDataLoader;
