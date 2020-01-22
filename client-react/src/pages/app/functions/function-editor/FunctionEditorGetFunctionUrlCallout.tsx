import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown as OfficeDropdown, IDropdownOption, Callout, DirectionalHint } from 'office-ui-fabric-react';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { style } from 'typestyle';
import { fileSelectorDropdownStyle, keyDivStyle, urlDivStyle, urlFieldStyle, urlFormStyle } from './FunctionEditor.styles';
import { FunctionUrl } from './FunctionEditor.types';

interface FunctionEditorGetFunctionUrlCalloutProps {
  urlObjs: FunctionUrl[];
  setIsDialogVisible: (isVisible: boolean) => void;
  dialogTarget: any;
}

const FunctionEditorGetFunctionUrlCallout: React.FC<FunctionEditorGetFunctionUrlCalloutProps> = props => {
  const { urlObjs, setIsDialogVisible, dialogTarget } = props;
  const { t } = useTranslation();
  const [dropdownOptions, setDropdownOptions] = useState<IDropdownOption[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<FunctionUrl | undefined>(undefined);

  const onCloseDialog = () => {
    setIsDialogVisible(false);
  };

  const onChangeHostKeyDropdown = (e: unknown, option: IDropdownOption) => {
    for (const urlObj of urlObjs) {
      if (urlObj.key === (option.key as string)) {
        setSelectedUrl(urlObj);
      }
    }
  };

  const calloutStyle = () =>
    style({
      padding: '20px',
      width: '600px',
    });

  useEffect(() => {
    const options: IDropdownOption[] = [];
    for (const urlObj of urlObjs) {
      options.push({
        key: urlObj.key,
        text: urlObj.key,
        isSelected: false,
      });
    }
    setDropdownOptions(options);
    setSelectedUrl(urlObjs.length > 0 ? urlObjs[0] : undefined);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlObjs]);
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
              defaultSelectedKey={!!selectedUrl ? selectedUrl.key : ''}
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
              value={!!selectedUrl ? selectedUrl.url : ''}
              disabled={true}
              copyButton={true}
              className={urlFieldStyle}
              formControlClassName={urlFormStyle}
            />
          </div>
        </div>
      </div>
    </Callout>
  );
};

export default FunctionEditorGetFunctionUrlCallout;
