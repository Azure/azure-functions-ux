import React from 'react';
import { FieldProps } from 'formik';

import { IDropdownProps } from '@fluentui/react';

import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { NewConnectionCalloutProps } from '../Callout.properties';

import DocumentDBPivot from './DocumentDBPivot';
import DocumentDBPivotData from './DocumentDBPivot.data';

const documentDBPivotData = new DocumentDBPivotData();
export const DocumentDBPivotContext = React.createContext(documentDBPivotData);

const DocumentDBDataLoader: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  return (
    <DocumentDBPivotContext.Provider value={documentDBPivotData}>
      <DocumentDBPivot {...props} />
    </DocumentDBPivotContext.Provider>
  );
};

export default DocumentDBDataLoader;
