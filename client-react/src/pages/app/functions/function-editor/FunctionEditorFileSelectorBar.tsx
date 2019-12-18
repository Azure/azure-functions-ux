import { Dropdown as OfficeDropdown, IDropdownOption, Stack, Label } from 'office-ui-fabric-react';
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../ThemeContext';
import { style } from 'typestyle';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import StringUtils from '../../../../utils/string';

export interface FunctionEditorFileSelectorValue {
  isDirectory: boolean;
  fileOrDirectoryName: string;
}

interface FunctionEditorFileSelectorBarProps {
  functionAppNameLabel: string;
  functionDirectoryDropdownOptions: IDropdownOption[];
  functionDirectoryDropdownSelectedKey: string;
  isFunctionDirectoryDropdownVisible: boolean;
  functionInfo: ArmObj<FunctionInfo>;
  onChangeDropdown: (functionEditorFileSelectorValue: FunctionEditorFileSelectorValue) => void;
}
const fileSeparatorStyle = style({
  paddingLeft: '10px',
  paddingRight: '10px',
});

const FunctionEditorFileSelectorBar: React.FC<FunctionEditorFileSelectorBarProps> = props => {
  const {
    functionAppNameLabel,
    functionDirectoryDropdownOptions,
    functionDirectoryDropdownSelectedKey,
    isFunctionDirectoryDropdownVisible,
    onChangeDropdown,
    functionInfo,
  } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const [showFunctionDirectoryDropdown, setFunctionDirectoryDropdownVisibility] = useState<boolean>(isFunctionDirectoryDropdownVisible);

  const onChangeDirectoryDropdown = (e: unknown, option: IDropdownOption) => {
    setFunctionDirectoryDropdownVisibility(option.data.isDirectory);
    onChangeDropdown({
      isDirectory: option.data.isDirectory,
      fileOrDirectoryName: option.key as string,
    });
  };

  const stackStyle = (theme: ThemeExtended) =>
    style({
      padding: '8px 15px 8px 15px',
      borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}`,
    });

  return (
    <>
      <Stack horizontal className={stackStyle(theme)}>
        <Label>{functionAppNameLabel}</Label>
        <Label className={fileSeparatorStyle}>{StringUtils.fileSeparator}</Label>
        <Label>{functionInfo.properties.name}</Label>
        <Label className={fileSeparatorStyle}>{StringUtils.fileSeparator}</Label>
        {showFunctionDirectoryDropdown && (
          <OfficeDropdown
            selectedKey={functionDirectoryDropdownSelectedKey}
            options={functionDirectoryDropdownOptions}
            onChange={onChangeDirectoryDropdown}
            ariaLabel={t('functionDirectoryDropdownAriaLabel')}
            style={{ minWidth: '200px' }}
          />
        )}
      </Stack>
    </>
  );
};

export default FunctionEditorFileSelectorBar;
