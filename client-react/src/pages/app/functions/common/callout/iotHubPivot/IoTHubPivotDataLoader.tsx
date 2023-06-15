import { IDropdownProps } from '@fluentui/react';
import { FieldProps } from 'formik';
import React from 'react';

import { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { NewConnectionCalloutProps } from '../Callout.properties';
import IotHubPivot from './IoTHubPivot';
import IotHubPivotData from './IoTHubPivot.data';

const iotHubPivotData = new IotHubPivotData();
export const IoTHubPivotContext = React.createContext(iotHubPivotData);

const IotHubPivotDataLoader: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  return (
    <IoTHubPivotContext.Provider value={iotHubPivotData}>
      <IotHubPivot {...props} />
    </IoTHubPivotContext.Provider>
  );
};

export default IotHubPivotDataLoader;
