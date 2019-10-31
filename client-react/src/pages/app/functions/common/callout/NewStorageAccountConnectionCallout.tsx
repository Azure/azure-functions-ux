import React from 'react';
import { FieldProps } from 'formik';
import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle } from './Callout.styles';
import StorageAccountPivotDataLoader from './storageAccountPivot/StorageAccountPivotDataLoader';

const NewAppSettingCallout: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { t } = useTranslation();

  return (
    <div style={paddingSidesStyle}>
      <p>{t('stoageAccountCallout_existingStorageAccount')}</p>
      <StorageAccountPivotDataLoader {...props} />
    </div>
  );
};

export default NewAppSettingCallout;
