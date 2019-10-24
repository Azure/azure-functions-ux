import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import IotHubPivot from './IoTHubPivot';
import { FieldProps } from 'formik';
import IotHubPivotData from './IoTHubPivot.data';

const iotHubPivotData = new IotHubPivotData();
export const IoTHubPivotContext = React.createContext(iotHubPivotData);

const IotHubPivotDataLoader: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  return (
    <IoTHubPivotContext.Provider value={iotHubPivotData}>
      <IotHubPivot {...props} />
    </IoTHubPivotContext.Provider>
  );
};

export default IotHubPivotDataLoader;
