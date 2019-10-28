import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown as OfficeDropdown, IDropdownOption, Stack, Callout, DirectionalHint, Label } from 'office-ui-fabric-react';
import { formLabelStyle } from '../../../../components/form-controls/formControl.override.styles';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { style } from 'typestyle';

export interface HostUrl {
  key: string;
  url: string;
}

interface FunctionEditorGetFunctionUrlCalloutProps {
  hostKeyDropdownOptions: IDropdownOption[];
  hostKeyDropdownSelectedKey: string;
  hostUrls: HostUrl[];
  setIsDialogVisible: (isVisible: boolean) => void;
  dialogTarget: any;
}

const FunctionEditorGetFunctionUrlCallout: React.FC<FunctionEditorGetFunctionUrlCalloutProps> = props => {
  const { hostKeyDropdownOptions, hostKeyDropdownSelectedKey, hostUrls, setIsDialogVisible, dialogTarget } = props;
  const { t } = useTranslation();
  const [url, setUrl] = useState<string | undefined>(() => {
    for (const hostUrl of hostUrls) {
      if (hostUrl.key === hostKeyDropdownSelectedKey) {
        return hostUrl.url;
      }
    }

    return undefined;
  });

  const onCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const onChangeHostKeyDropdown = (e: unknown, option: IDropdownOption) => {
    setUrl(hostUrls[option.key]);
  };

  const calloutStyle = () =>
    style({
      padding: '20px',
      minWidth: '600px',
    });

  return (
    <Callout
      role="alertdialog"
      gapSpace={380}
      target={dialogTarget}
      onDismiss={onCloseDialog}
      setInitialFocus={true}
      directionalHint={DirectionalHint.rightBottomEdge}
      isBeakVisible={true}>
      <div className={calloutStyle()}>
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
          <Stack horizontal>
            <Label className={`${formLabelStyle(false, false)}`}>{t('keysDialog_url')}</Label>
            <TextFieldNoFormik id="function-editor-function-url" value={url} disabled={true} copyButton={true} />
          </Stack>
        </Stack>
      </div>
    </Callout>
  );
};

export default FunctionEditorGetFunctionUrlCallout;
