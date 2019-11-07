import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import IotHubPivot from './IoTHubPivot';
import IotHubPivotData from './IoTHubPivot.data';

const iotHubPivotData = new IotHubPivotData();
export const IoTHubPivotContext = React.createContext(iotHubPivotData);

const IotHubPivotDataLoader: React.SFC<NewConnectionCalloutProps> = props => {
  return (
    <IoTHubPivotContext.Provider value={iotHubPivotData}>
      <IotHubPivot {...props} />
    </IoTHubPivotContext.Provider>
  );
};

export default IotHubPivotDataLoader;
