import React, { useState } from 'react';
import { FieldProps } from 'formik';
import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import CustomPivot from './customPivot/CustomPivot';
import RadioButtonNoFormik from '../../../../../components/form-controls/RadioButtonNoFormik';
import { paddingSidesStyle } from './Callout.styles';
import ServiceBusPivotDataLoader from './serviceBusPivot/ServiceBusPivotDataLoader';

enum RadioState {
  serviceBus = 'serviceBus',
  custom = 'custom',
}

const NewServiceBusConnectionCalloutProps: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { t } = useTranslation();
  const [radioState, setRadioState] = useState<RadioState>(RadioState.serviceBus);

  return (
    <div style={paddingSidesStyle}>
      <RadioButtonNoFormik
        id="event-hub-connection-callout-options"
        ariaLabelledBy={`event-hub-connection-callout-options-label`}
        selectedKey={radioState}
        options={[
          {
            key: RadioState.serviceBus,
            text: t('serviceBusPicker_serviceBus'),
          },
          {
            key: RadioState.custom,
            text: t('eventHubPicker_custom'),
          },
        ]}
        onChange={(o, e) => e && setRadioState(e.key as RadioState)}
      />
      {radioState === RadioState.serviceBus && <ServiceBusPivotDataLoader {...props} />}
      {radioState === RadioState.custom && <CustomPivot {...props} />}
    </div>
  );
};

export default NewServiceBusConnectionCalloutProps;
