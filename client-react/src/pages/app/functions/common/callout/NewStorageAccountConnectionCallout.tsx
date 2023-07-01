import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldProps } from 'formik';

import { IDropdownProps } from '@fluentui/react';

import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';

import StorageAccountPivotDataLoader from './storageAccountPivot/StorageAccountPivotDataLoader';
import { NewConnectionCalloutProps } from './Callout.properties';
import { paddingSidesStyle } from './Callout.styles';

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
