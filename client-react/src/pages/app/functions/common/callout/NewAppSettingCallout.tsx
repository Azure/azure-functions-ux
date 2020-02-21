import React from 'react';
import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import CustomPivot from './customPivot/CustomPivot';
import { paddingSidesStyle } from './Callout.styles';

const NewAppSettingCallout: React.SFC<NewConnectionCalloutProps> = props => {
  const { t } = useTranslation();

  return (
    <div style={paddingSidesStyle}>
      <h4>{t('resourceCallout_newCustomAppSetting')}</h4>
      <CustomPivot {...props} />
    </div>
  );
};

export default NewAppSettingCallout;
