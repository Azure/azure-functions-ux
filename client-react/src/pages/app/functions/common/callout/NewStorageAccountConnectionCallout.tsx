import React, { useState } from 'react';
import { FieldProps } from 'formik';
import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import RadioButtonNoFormik from '../../../../../components/form-controls/RadioButtonNoFormik';
import { paddingSidesStyle } from './Callout.styles';
import StorageAccountPivotDataLoader from './storageAccountPivot/StorageAccountPivotDataLoader';
import NewPivot from './newPivot/NewPivot';

enum RadioState {
  existing = 'existing',
  new = 'new',
}

const NewStorageAccountConnectionCallout: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { t } = useTranslation();
  const [radioState, setRadioState] = useState<RadioState>(RadioState.existing);

  return (
    <div style={paddingSidesStyle}>
      <RadioButtonNoFormik
        id="storage-account-connection-callout-options"
        ariaLabelledBy={`storage-account-connection-callout-options-label`}
        selectedKey={radioState}
        options={[
          {
            key: RadioState.existing,
            text: t('stoageAccountCallout_existingStorageAccount'),
          },
          {
            key: RadioState.new,
            text: t('stoageAccountCallout_newStorageAccount'),
          },
        ]}
        onChange={(o, e) => e && setRadioState(e.key as RadioState)}
      />
      {radioState === RadioState.existing && <StorageAccountPivotDataLoader {...props} />}
      {radioState === RadioState.new && <NewPivot {...props} />}
    </div>
  );
};

export default NewStorageAccountConnectionCallout;
