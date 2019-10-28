import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FieldProps } from 'formik';
import DocumentDBPivotData from './DocumentDBPivot.data';

const documentDBPivotData = new DocumentDBPivotData();
export const EventHubPivotContext = React.createContext(documentDBPivotData);

const DocumentDBDataLoader: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  return <EventHubPivotContext.Provider value={documentDBPivotData} />;
};

export default DocumentDBDataLoader;
