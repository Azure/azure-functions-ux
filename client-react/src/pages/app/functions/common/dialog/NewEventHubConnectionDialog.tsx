import React from 'react';
import { FieldProps } from 'formik';
import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';
import { IDropdownProps, DialogType, Dialog } from 'office-ui-fabric-react';
import { NewConnectionDialogProps } from './DialogProperties';

const NewEventHubConnectionDialogProps: React.SFC<NewConnectionDialogProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setIsDialogVisible } = props;

  return (
    <Dialog
      hidden={false}
      onDismiss={() => setIsDialogVisible(false)}
      modalProps={{
        isBlocking: false,
      }}
      dialogContentProps={{
        type: DialogType.close,
        title: 'New Event Hub Connection',
      }}
    />
  );
};

export default NewEventHubConnectionDialogProps;
