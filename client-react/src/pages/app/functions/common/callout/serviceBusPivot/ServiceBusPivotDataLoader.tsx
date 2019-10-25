import React from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FieldProps } from 'formik';
// import ServiceBusPivot from './ServiceBusPivot';
import ServiceBusPivotData from './ServiceBusPivot.data';

const serviceBusPivotData = new ServiceBusPivotData();
export const ServiceBusPivotContext = React.createContext(serviceBusPivotData);

const ServiceBusPivotDataLoader: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  return (
    <ServiceBusPivotContext.Provider value={serviceBusPivotData}>{/* <ServiceBusPivot {...props} /> */}</ServiceBusPivotContext.Provider>
  );
};

export default ServiceBusPivotDataLoader;
