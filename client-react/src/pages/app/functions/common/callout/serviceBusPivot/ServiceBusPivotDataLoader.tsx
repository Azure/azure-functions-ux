import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import ServiceBusPivot from './ServiceBusPivot';
import ServiceBusPivotData from './ServiceBusPivot.data';
import { IDropdownProps } from 'office-ui-fabric-react';
import { FieldProps } from 'formik';
import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';

const serviceBusPivotData = new ServiceBusPivotData();
export const ServiceBusPivotContext = React.createContext(serviceBusPivotData);

const ServiceBusPivotDataLoader: React.SFC<NewConnectionCalloutProps & IDropdownProps & FieldProps & CustomDropdownProps> = props => {
  return (
    <ServiceBusPivotContext.Provider value={serviceBusPivotData}>
      <ServiceBusPivot {...props} />
    </ServiceBusPivotContext.Provider>
  );
};

export default ServiceBusPivotDataLoader;
