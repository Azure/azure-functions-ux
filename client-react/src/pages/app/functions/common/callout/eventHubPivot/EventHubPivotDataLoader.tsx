import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import EventHubPivot from './EventHubPivot';
import EventHubPivotData from './EventHubPivot.data';

const eventHubPivotData = new EventHubPivotData();
export const EventHubPivotContext = React.createContext(eventHubPivotData);

const EventHubPivotDataLoader: React.SFC<NewConnectionCalloutProps> = props => {
  return (
    <EventHubPivotContext.Provider value={eventHubPivotData}>
      <EventHubPivot {...props} />
    </EventHubPivotContext.Provider>
  );
};

export default EventHubPivotDataLoader;
