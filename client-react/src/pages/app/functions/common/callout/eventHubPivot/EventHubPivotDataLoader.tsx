import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import EventHubPivot from './EventHubPivot';
import EventHubPivotData from './EventHubPivot.data';
import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { FieldProps } from 'formik';
import { IDropdownProps } from 'office-ui-fabric-react';

const eventHubPivotData = new EventHubPivotData();
export const EventHubPivotContext = React.createContext(eventHubPivotData);

const EventHubPivotDataLoader: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  return (
    <EventHubPivotContext.Provider value={eventHubPivotData}>
      <EventHubPivot {...props} />
    </EventHubPivotContext.Provider>
  );
};

export default EventHubPivotDataLoader;
