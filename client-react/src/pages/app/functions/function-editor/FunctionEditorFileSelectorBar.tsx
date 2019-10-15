import { Dropdown as OfficeDropdown, IDropdownOption, Stack, Label } from 'office-ui-fabric-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  const [showFunctionDirectoryDropdown, setFunctionDirectoryDropdownVisibility] = useState<boolean>(isFunctionDirectoryDropdownVisible);

  const onChangeDirectoryDropdown = (e: unknown, option: IDropdownOption) => {
    setFunctionDirectoryDropdownVisibility(option.data.isDirectory);
    onChangeDropdown({
      isDirectory: option.data.isDirectory,
      fileOrDirectoryName: option.key as string,
    });
  };

  return (
    <>
      <Stack horizontal>
        <Label>{functionAppNameLabel}</Label>
        <OfficeDropdown
          selectedKey={functionAppDirectoryDropdownSelectedKey}
          options={functionAppDirectoryDropdownOptions}
          onChange={onChangeDirectoryDropdown}
          ariaLabel={t('functionAppDirectoryDropdownAriaLabel')}
        />
        {showFunctionDirectoryDropdown && (
          <OfficeDropdown
            selectedKey={functionDirectoryDropdownSelectedKey}
            options={functionDirectoryDropdownOptions}
            onChange={onChangeDirectoryDropdown}
            ariaLabel={t('functionDirectoryDropdownAriaLabel')}
          />
        )}
      </Stack>
    </>
  );
};

export default FunctionEditorFileSelectorBar;
