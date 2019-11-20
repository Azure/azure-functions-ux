import React, { useState } from 'react';
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

const NewServiceBusConnectionCallout: React.SFC<NewConnectionCalloutProps> = props => {
  const { t } = useTranslation();
  const [radioState, setRadioState] = useState<RadioState>(RadioState.serviceBus);

  return (
    <div style={paddingSidesStyle}>
      <RadioButtonNoFormik
        id="service-bus-connection-callout-options"
        ariaLabelledBy={`service-bus-connection-callout-options-label`}
        selectedKey={radioState}
        options={[
          {
            key: RadioState.serviceBus,
            text: t('serviceBusCallout_serviceBus'),
          },
          {
            key: RadioState.custom,
            text: t('resourceCallout_customAppSetting'),
          },
        ]}
        onChange={(o, e) => e && setRadioState(e.key as RadioState)}
      />
      {radioState === RadioState.serviceBus && <ServiceBusPivotDataLoader {...props} />}
      {radioState === RadioState.custom && <CustomPivot {...props} />}
    </div>
  );
};

export default NewServiceBusConnectionCallout;
