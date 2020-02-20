import React from 'react';
import { NewConnectionCalloutProps } from './Callout.properties';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle } from './Callout.styles';
import StorageAccountPivotDataLoader from './storageAccountPivot/StorageAccountPivotDataLoader';
import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';
import { FieldProps } from 'formik';
import { IDropdownProps } from 'office-ui-fabric-react';

const NewStorageAccountConnectionCallout: React.SFC<
  NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps
> = props => {
  const { t } = useTranslation();

  return (
    <div style={paddingSidesStyle}>
      <h4>{t('storageAccountCallout_newStorageAccountConnection')}</h4>
      <StorageAccountPivotDataLoader {...props} />
    </div>
  );
};

export default NewStorageAccountConnectionCallout;
