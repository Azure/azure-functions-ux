import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown as OfficeDropdown, IDropdownOption, Callout, DirectionalHint } from 'office-ui-fabric-react';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { style } from 'typestyle';
import { fileSelectorDropdownStyle, keyDivStyle, urlDivStyle, urlFieldStyle, urlFormStyle } from './FunctionEditor.styles';
import { FunctionUrl } from './FunctionEditor.types';

interface FunctionEditorGetFunctionUrlCalloutProps {
  dropdownOptions: IDropdownOption[];
  defaultSelectedKey: string;
  urls: FunctionUrl[];
  setIsDialogVisible: (isVisible: boolean) => void;
  dialogTarget: any;
}

const FunctionEditorGetFunctionUrlCallout: React.FC<FunctionEditorGetFunctionUrlCalloutProps> = props => {
  const { dropdownOptions, defaultSelectedKey, urls, setIsDialogVisible, dialogTarget } = props;
  const { t } = useTranslation();
  const [selectedUrl, setSelectedUrl] = useState<string | undefined>(() => {
    for (const obj of urls) {
      if (obj.key === defaultSelectedKey) {
        return obj.url;
      }
    }

    return undefined;
  });

  const onCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const onChangeHostKeyDropdown = (e: unknown, option: IDropdownOption) => {
    for (const obj of urls) {
      if (obj.key === (option.key as string)) {
        setSelectedUrl(obj.url);
      }
    }
  };

  const calloutStyle = () =>
    style({
      padding: '20px',
      width: '600px',
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
        <div>
          <div className={keyDivStyle}>
            {t('keysDialog_key')}
            <OfficeDropdown
              defaultSelectedKey={defaultSelectedKey}
              options={dropdownOptions}
              onChange={onChangeHostKeyDropdown}
              ariaLabel={t('functionAppDirectoryDropdownAriaLabel')}
              styles={fileSelectorDropdownStyle()}
            />
          </div>
          <div className={urlDivStyle}>
            {t('keysDialog_url')}
            <TextFieldNoFormik
              id="function-editor-function-url"
              value={selectedUrl}
              disabled={true}
              copyButton={true}
              textFieldClassName={urlFieldStyle}
              formControlClassName={urlFormStyle}
            />
          </div>
        </div>
      </div>
    </Callout>
  );
};

export default FunctionEditorGetFunctionUrlCallout;
