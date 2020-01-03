import { Dropdown as OfficeDropdown, IDropdownOption, Stack, Label } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../../ThemeContext';
import { style } from 'typestyle';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import StringUtils from '../../../../utils/string';
import { fileSelectorStackStyle, fileDropdownStyle } from './FunctionEditor.styles';

export interface FunctionEditorFileSelectorBarProps {
  functionAppNameLabel: string;
  fileDropdownOptions: IDropdownOption[];
  fileDropdownSelectedKey: string;
  functionInfo: ArmObj<FunctionInfo>;
  onChangeDropdown: (e: unknown, option: IDropdownOption) => void;
  disabled: boolean;
}
const fileSeparatorStyle = style({
  paddingLeft: '10px',
  paddingRight: '10px',
});

const FunctionEditorFileSelectorBar: React.FC<FunctionEditorFileSelectorBarProps> = props => {
  const { functionAppNameLabel, fileDropdownOptions, fileDropdownSelectedKey, onChangeDropdown, functionInfo, disabled } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  return (
    <>
      <Stack horizontal className={fileSelectorStackStyle(theme)}>
        <Label>{functionAppNameLabel}</Label>
        <Label className={fileSeparatorStyle}>{StringUtils.fileSeparator}</Label>
        <Label>{functionInfo.properties.name}</Label>
        <Label className={fileSeparatorStyle}>{StringUtils.fileSeparator}</Label>
        <OfficeDropdown
          id="fucntion-editor-file-selector"
          defaultSelectedKey={fileDropdownSelectedKey}
          options={fileDropdownOptions}
          onChange={onChangeDropdown}
          ariaLabel={t('functionDirectoryDropdownAriaLabel')}
          className={fileDropdownStyle}
          disabled={disabled}
        />
      </Stack>
    </>
  );
};

export default FunctionEditorFileSelectorBar;
