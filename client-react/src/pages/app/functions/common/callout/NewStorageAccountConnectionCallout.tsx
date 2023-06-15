import { IDropdownProps } from '@fluentui/react';
import { FieldProps } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';
import { NewConnectionCalloutProps } from './Callout.properties';
import { paddingSidesStyle } from './Callout.styles';
import StorageAccountPivotDataLoader from './storageAccountPivot/StorageAccountPivotDataLoader';

const NewStorageAccountConnectionCallout: React.SFC<NewConnectionCalloutProps &
  CustomDropdownProps &
  FieldProps &
  IDropdownProps> = props => {
  const { t } = useTranslation();

  return (
    <div style={paddingSidesStyle}>
      <h4>{t('storageAccountCallout_newStorageAccountConnection')}</h4>
      <StorageAccountPivotDataLoader {...props} />
    </div>
  );
};

export default NewStorageAccountConnectionCallout;
