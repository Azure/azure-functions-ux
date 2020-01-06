import React, { useState } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import FunctionEditorCommandBar from './FunctionEditorCommandBar';
import FunctionEditorFileSelectorBar from './FunctionEditorFileSelectorBar';
import { BindingType } from '../../../../models/functions/function-binding';
import { Site } from '../../../../models/site/site';
import Panel from '../../../../components/Panel/Panel';
import { PanelType, IDropdownOption } from 'office-ui-fabric-react';
import FunctionTest from './function-test/FunctionTest';
import MonacoEditor from '../../../../components/monaco-editor/monaco-editor';
import { style } from 'typestyle';
import { InputFormValues } from './FunctionEditor.types';
import { FormikActions } from 'formik';
import { VfsObject } from '../../../../models/functions/vfs';

// TODO(shimedh): Update this file for props, other controls, remove hardcoded value, get actual data and add logic.
export interface FunctionEditorProps {
  functionInfo: ArmObj<FunctionInfo>;
  site: ArmObj<Site>;
  run: (functionInfo: ArmObj<FunctionInfo>) => void;
  fileList?: VfsObject[];
}

const editorStyle = style({
  marginTop: '20px',
  marginBottom: '10px',
  marginRight: '10px',
});

export const FunctionEditor: React.SFC<FunctionEditorProps> = props => {
  const { functionInfo, site, fileList } = props;
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [reqBody, setReqBody] = useState('');

  const save = () => {};

  const discard = () => {};

  const test = () => {
    setShowTestPanel(true);
  };

  const onCancelTest = () => {
    setShowTestPanel(false);
  };

  const onFileSelectorChange = () => {};

  const run = (values: InputFormValues, formikActions: FormikActions<InputFormValues>) => {
    const data = JSON.stringify({
      method: values.method,
      queryStringParams: values.queries,
      headers: values.queries,
      body: reqBody,
    });
    const tempFunctionInfo = functionInfo;
    tempFunctionInfo.properties.test_data = data;
    props.run(tempFunctionInfo);
  };

  const inputBinding =
    functionInfo.properties.config && functionInfo.properties.config.bindings
      ? functionInfo.properties.config.bindings.find(e => e.type === BindingType.httpTrigger)
      : null;

  const [dirty /*, setDirtyState*/] = useState<boolean>(false);

  const getDropdownOptions = (): IDropdownOption[] => {
    return !!fileList
      ? fileList
          .map(file => ({
            key: file.name,
            text: file.name,
            isSelected: false,
            data: file,
          }))
          .sort((a, b) => a.key.localeCompare(b.key))
      : [];
  };

  const options = getDropdownOptions();

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

  const onChange = (newValue, event) => {
    // TODO(krmitta): Save the new content of the file in state [WI 5536378]
  };

  const getEditorLanguage = (): string => {
    // TODO(krmitta): Add language according to the file opened in the editor [WI 5536378]
    return 'javascript';
  };

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
        functionAppNameLabel={site.name}
        functionInfo={functionInfo}
        functionDirectoryDropdownOptions={options}
        functionDirectoryDropdownSelectedKey={options.length > 0 ? (options[0].key as string) : ''}
        isFunctionDirectoryDropdownVisible={true}
        onChangeDropdown={onFileSelectorChange}
      />
      <Panel type={PanelType.medium} isOpen={showTestPanel} onDismiss={onCancelTest} headerText={''}>
        <FunctionTest cancel={onCancelTest} run={run} functionInfo={functionInfo} reqBody={reqBody} setReqBody={setReqBody} />
      </Panel>
      <div className={editorStyle}>
        <MonacoEditor
          value={``}
          language={getEditorLanguage()}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            cursorBlinking: true,
            renderWhitespace: 'all',
          }}
        />
      </div>
    </>
  );
};
