import React, { useState } from 'react';
import { FieldProps } from 'formik';
import { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { IDropdownProps, DialogType, Dialog } from 'office-ui-fabric-react';

export interface NewResourceConnectionProps {
  resourceId: string;
  setNewAppSettingName: (string) => void;
  setIsNewVisible: (boolean) => void;
}

const NewEventHubDialog: React.SFC<NewResourceConnectionProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setIsNewVisible } = props;
  const [hideDialog, setDialogVisibility] = useState<boolean>(false);

  const onCloseDialog = () => {
    setDialogVisibility(!hideDialog);
    setIsNewVisible(false);
  };

  return (
    <Dialog
      hidden={hideDialog}
      onDismiss={onCloseDialog}
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

export default NewEventHubDialog;
