import React, { useState } from 'react';
import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import CustomPivot from './customPivot/CustomPivot';
import RadioButtonNoFormik from '../../../../../components/form-controls/RadioButtonNoFormik';
import { paddingSidesStyle } from './Callout.styles';
import ServiceBusPivotDataLoader from './serviceBusPivot/ServiceBusPivotDataLoader';
import { IDropdownProps } from 'office-ui-fabric-react';
import { FieldProps } from 'formik';
import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';

enum RadioState {
  serviceBus = 'serviceBus',
  custom = 'custom',
}

const NewServiceBusConnectionCallout: React.SFC<NewConnectionCalloutProps & IDropdownProps & FieldProps & CustomDropdownProps> = props => {
  const { t } = useTranslation();
  const [radioState, setRadioState] = useState<RadioState>(RadioState.serviceBus);

  return (
    <div style={paddingSidesStyle}>
      <h4>{t('serviceBusCallout_newServiceBusConnection')}</h4>
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
