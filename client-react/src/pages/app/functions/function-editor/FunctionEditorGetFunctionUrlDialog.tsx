import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown as OfficeDropdown, IDropdownOption, Stack, Callout, DirectionalHint, Label, TextField } from 'office-ui-fabric-react';
import { formLabelStyle } from '../../../../components/form-controls/formControl.override.styles';

export interface HostUrl {
  key: string;
  url: string;
}

interface FunctionEditorGetFunctionUrlDialogProps {
  hostKeyDropdownOptions: IDropdownOption[];
  hostKeyDropdownSelectedKey: string;
  hostUrls: HostUrl[];
  setIsDialogVisible: (isVisible: boolean) => void;
  dialogTarget: any;
}

const FunctionEditorGetFunctionUrlDialog: React.FC<FunctionEditorGetFunctionUrlDialogProps> = props => {
  const { hostKeyDropdownOptions, hostKeyDropdownSelectedKey, hostUrls, setIsDialogVisible, dialogTarget } = props;
  const { t } = useTranslation();
  const [url, setUrl] = useState<string>(() => {
    for (const hostUrl of hostUrls) {
      if (hostUrl.key === hostKeyDropdownSelectedKey) {
        return hostUrl.url;
      }
    }

    return '';
  });

  const onCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const onChangeHostKeyDropdown = (e: unknown, option: IDropdownOption) => {
    setUrl(hostUrls[option.key]);
  };

  return (
    <Callout
      style={{ minWidth: '600px', padding: '20px' }}
      role="alertdialog"
      gapSpace={50}
      target={dialogTarget}
      onDismiss={onCloseDialog}
      setInitialFocus={true}
      hidden={false}
      directionalHint={DirectionalHint.bottomRightEdge}>
      <div className="ms-CalloutExample-header">
        <h4 className="ms-CalloutExample-title">{t('keysDialog_getFunctionUrl')}</h4>
      </div>
      <Stack>
        <Stack horizontal>
          <Label className={`${formLabelStyle(false, false)}`}>{t('keysDialog_key')}</Label>
          <OfficeDropdown
            selectedKey={hostKeyDropdownSelectedKey}
            options={hostKeyDropdownOptions}
            onChange={onChangeHostKeyDropdown}
            ariaLabel={t('functionAppDirectoryDropdownAriaLabel')}
          />
        </Stack>
        <TextField title={t('keysDialog_url')} id="function-editor-function-url" value={url} disabled={true} />
      </Stack>
    </Callout>
  );
};

export default FunctionEditorGetFunctionUrlDialog;
