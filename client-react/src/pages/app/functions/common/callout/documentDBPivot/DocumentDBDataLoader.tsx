import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import DocumentDBPivotData from './DocumentDBPivot.data';
import DocumentDBPivot from './DocumentDBPivot';

const documentDBPivotData = new DocumentDBPivotData();
export const DocumentDBPivotContext = React.createContext(documentDBPivotData);

const DocumentDBDataLoader: React.SFC<NewConnectionCalloutProps> = props => {
  return (
    <DocumentDBPivotContext.Provider value={documentDBPivotData}>
      <DocumentDBPivot {...props} />
    </DocumentDBPivotContext.Provider>
  );
};

export default DocumentDBDataLoader;
