import React from 'react';
import { FieldProps } from 'formik';
import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import CustomPivot from './customPivot/CustomPivot';
import { paddingSidesStyle } from './Callout.styles';

const NewAppSettingCallout: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { t } = useTranslation();

  return (
    <div style={paddingSidesStyle}>
      <p>{t('resourceCallout_customAppSetting')}</p>
      <CustomPivot {...props} />
    </div>
  );
};

export default NewAppSettingCallout;
