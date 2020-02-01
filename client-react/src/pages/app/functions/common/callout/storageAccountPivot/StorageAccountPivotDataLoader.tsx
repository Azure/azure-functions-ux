import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import StorageAccountData from './StorageAccountPivot.data';
import StorageAccountPivot from './StorageAccountPivot';
import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { FieldProps } from 'formik';
import { IDropdownProps } from 'office-ui-fabric-react';

const storageAccountPivotData = new StorageAccountData();
export const StorageAccountPivotContext = React.createContext(storageAccountPivotData);

const StorageAccountDataLoader: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  return (
    <StorageAccountPivotContext.Provider value={storageAccountPivotData}>
      <StorageAccountPivot {...props} />
    </StorageAccountPivotContext.Provider>
  );
};

export default StorageAccountDataLoader;
