import { Dropdown as OfficeDropdown, IDropdownOption, Stack, Label } from 'office-ui-fabric-react';
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../ThemeContext';
import { style } from 'typestyle';

export interface FunctionEditorFileSelectorValue {
  isDirectory: boolean;
  fileOrDirectoryName: string;
}

interface FunctionEditorFileSelectorBarProps {
  functionAppNameLabel: string;
  functionAppDirectoryDropdownOptions: IDropdownOption[];
  functionDirectoryDropdownOptions: IDropdownOption[];
  functionAppDirectoryDropdownSelectedKey: string;
  functionDirectoryDropdownSelectedKey: string;
  isFunctionDirectoryDropdownVisible: boolean;
  onChangeDropdown: (functionEditorFileSelectorValue: FunctionEditorFileSelectorValue) => void;
}

const FunctionEditorFileSelectorBar: React.FC<FunctionEditorFileSelectorBarProps> = props => {
  const {
    functionAppNameLabel,
    functionAppDirectoryDropdownOptions,
    functionDirectoryDropdownOptions,
    functionAppDirectoryDropdownSelectedKey,
    functionDirectoryDropdownSelectedKey,
    isFunctionDirectoryDropdownVisible,
    onChangeDropdown,
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

  const functionAppDropdownStyle = () =>
    style({
      marginRight: '10px',
      minWidth: '200px',
    });

  return (
    <>
      <Stack horizontal className={stackStyle(theme)}>
        <Label style={{ marginRight: '10px' }}>{functionAppNameLabel}</Label>
        <OfficeDropdown
          selectedKey={functionAppDirectoryDropdownSelectedKey}
          options={functionAppDirectoryDropdownOptions}
          onChange={onChangeDirectoryDropdown}
          ariaLabel={t('functionAppDirectoryDropdownAriaLabel')}
          className={functionAppDropdownStyle()}
        />
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
