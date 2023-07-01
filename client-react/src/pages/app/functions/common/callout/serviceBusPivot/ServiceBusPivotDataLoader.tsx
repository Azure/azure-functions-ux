import React from 'react';
import { FieldProps } from 'formik';

import { IDropdownProps } from '@fluentui/react';

import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { NewConnectionCalloutProps } from '../Callout.properties';

import ServiceBusPivot from './ServiceBusPivot';
import ServiceBusPivotData from './ServiceBusPivot.data';

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
