import React from 'react';
import { FieldProps } from 'formik';

import { IDropdownProps } from '@fluentui/react';

import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { NewConnectionCalloutProps } from '../Callout.properties';

import StorageAccountPivot from './StorageAccountPivot';
import StorageAccountData from './StorageAccountPivot.data';

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
