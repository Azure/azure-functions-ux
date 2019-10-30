import React, { useState } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import FunctionEditorCommandBar from './FunctionEditorCommandBar';
import FunctionEditorFileSelectorBar from './FunctionEditorFileSelectorBar';
import { BindingType } from '../../../../models/functions/function-binding';

// TODO(shimedh): Update this file for props, other controls, remove hardcoded value, get actual data and add logic.
export interface FunctionEditorProps {
  functionInfo: ArmObj<FunctionInfo>;
}

export const FunctionEditor: React.SFC<FunctionEditorProps> = props => {
  const { functionInfo } = props;

  const save = () => {};

  const discard = () => {};

  const test = () => {};

  const onFileSelectorChange = () => {};

  const inputBinding =
    functionInfo.properties.config && functionInfo.properties.config.bindings
      ? functionInfo.properties.config.bindings.find(e => e.type === BindingType.httpTrigger)
      : null;

  const [dirty /*, setDirtyState*/] = useState<boolean>(false);

  const functionAppDirectoryDropdownOptions = [
    {
      key: functionInfo.properties.name,
      text: `${functionInfo.properties.name} /`,
      data: {
        isDirectory: true,
        fileOrDirectoryName: functionInfo.properties.name,
      },
      selected: true,
    },
  ];

  const functionDirectoryDropdownOptions = [
    {
      key: 'index.js',
      text: 'index.js',
      data: {
        isDirectory: false,
        fileOrDirectoryName: 'index.js',
      },
      selected: true,
    },
  ];

  const hostKeyDropdownOptions = [
    {
      key: 'master',
      text: 'master',
      selected: true,
    },
  ];

  const hostUrls = [
    {
      key: 'master',
      url: 'https://test.com/key1',
    },
  ];

  return (
    <>
      <FunctionEditorCommandBar
        saveFunction={save}
        resetFunction={discard}
        testFunction={test}
        showGetFunctionUrlCommand={!!inputBinding}
        dirty={dirty}
        disabled={false}
        hostKeyDropdownOptions={hostKeyDropdownOptions}
        hostKeyDropdownSelectedKey={'master'}
        hostUrls={hostUrls}
      />
      <FunctionEditorFileSelectorBar
        functionAppNameLabel={'FunctionAppName /'}
        functionAppDirectoryDropdownOptions={functionAppDirectoryDropdownOptions}
        functionAppDirectoryDropdownSelectedKey={functionInfo.properties.name}
        functionDirectoryDropdownOptions={functionDirectoryDropdownOptions}
        functionDirectoryDropdownSelectedKey={'index.js'}
        isFunctionDirectoryDropdownVisible={true}
        onChangeDropdown={onFileSelectorChange}
      />
    </>
  );
};
