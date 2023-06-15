import { IDropdownProps } from '@fluentui/react';
import { FieldProps } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';
import RadioButtonNoFormik from '../../../../../components/form-controls/RadioButtonNoFormik';
import { NewConnectionCalloutProps } from './Callout.properties';
import { paddingSidesStyle } from './Callout.styles';
import CustomPivot from './customPivot/CustomPivot';
import DocumentDBPivotDataLoader from './documentDBPivot/DocumentDBDataLoader';

enum RadioState {
  documentAccount = 'documentAccount',
  custom = 'custom',
}

const NewDocumentDBConnectionCallout: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { t } = useTranslation();
  const [radioState, setRadioState] = useState<RadioState>(RadioState.documentAccount);

  return (
    <div style={paddingSidesStyle}>
      <h4>{t('documentDBCallout_newDocumentDBConnection')}</h4>
      <RadioButtonNoFormik
        id="event-hub-connection-callout-options"
        ariaLabelledBy={`event-hub-connection-callout-options-label`}
        selectedKey={radioState}
        options={[
          {
            key: RadioState.documentAccount,
            text: t('documentDBCallout_azureCosmosDBAccount'),
          },
          {
            key: RadioState.custom,
            text: t('resourceCallout_customAppSetting'),
          },
        ]}
        onChange={(o, e) => e && setRadioState(e.key as RadioState)}
      />
      {radioState === RadioState.documentAccount && <DocumentDBPivotDataLoader {...props} />}
      {radioState === RadioState.custom && <CustomPivot {...props} />}
    </div>
  );
};

export default NewDocumentDBConnectionCallout;
