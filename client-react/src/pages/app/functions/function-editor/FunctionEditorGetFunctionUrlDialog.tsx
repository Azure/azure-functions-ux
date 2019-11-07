import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown as OfficeDropdown, IDropdownOption, Stack, Dialog, DialogType } from 'office-ui-fabric-react';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';

interface HostUrl {
  key: string;
  url: string;
}

interface FunctionEditorGetFunctionUrlDialogProps {
  hostKeyDropdownOptions: IDropdownOption[];
  hostKeyDropdownSelectedKey: string;
  hostUrls: HostUrl[];
}

const FunctionEditorGetFunctionUrlDialog: React.FC<FunctionEditorGetFunctionUrlDialogProps> = props => {
  const { hostKeyDropdownOptions, hostKeyDropdownSelectedKey, hostUrls } = props;
  const { t } = useTranslation();
  const [hideDialog, setDialogVisibility] = useState<boolean>(false);
  const [url, setUrl] = useState<string>(hostUrls[hostKeyDropdownSelectedKey]);

  const onCloseDialog = () => {
    setDialogVisibility(!hideDialog);
  };

  const onChangeHostKeyDropdown = (e: unknown, option: IDropdownOption) => {
    setUrl(hostUrls[option.key]);
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
        title: t('keysDialog_getFunctionUrl'),
      }}>
      <Stack horizontal>
        <OfficeDropdown
          selectedKey={hostKeyDropdownSelectedKey}
          options={hostKeyDropdownOptions}
          onChange={onChangeHostKeyDropdown}
          ariaLabel={t('functionAppDirectoryDropdownAriaLabel')}
        />
        <TextFieldNoFormik label={t('nameRes')} id="function-editor-function-url" value={url} disabled={true} copyButton={true} />
      </Stack>
    </Dialog>
  );
};

export default FunctionEditorGetFunctionUrlDialog;
