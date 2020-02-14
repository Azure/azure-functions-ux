import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import DocumentDBPivotData from './DocumentDBPivot.data';
import DocumentDBPivot from './DocumentDBPivot';
import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { FieldProps } from 'formik';
import { IDropdownProps } from 'office-ui-fabric-react';

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
