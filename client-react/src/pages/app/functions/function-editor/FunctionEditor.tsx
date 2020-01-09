import React, { useState, useEffect } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import FunctionEditorCommandBar from './FunctionEditorCommandBar';
import FunctionEditorFileSelectorBar from './FunctionEditorFileSelectorBar';
import { BindingType } from '../../../../models/functions/function-binding';
import { Site } from '../../../../models/site/site';
import Panel from '../../../../components/Panel/Panel';
import { PanelType, IDropdownOption, Pivot, PivotItem } from 'office-ui-fabric-react';
import FunctionTest from './function-test/FunctionTest';
import MonacoEditor from '../../../../components/monaco-editor/monaco-editor';
import { style } from 'typestyle';
import { InputFormValues, EditorLanguage, ResponseContent, PivotType } from './FunctionEditor.types';
import { FormikActions } from 'formik';
import { VfsObject } from '../../../../models/functions/vfs';
import LoadingComponent from '../../../../components/loading/loading-component';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { pivotStyle } from './FunctionEditor.styles';

// TODO(shimedh): Update this file for props, other controls, remove hardcoded value, get actual data and add logic.
export interface FunctionEditorProps {
  functionInfo: ArmObj<FunctionInfo>;
  site: ArmObj<Site>;
  run: (functionInfo: ArmObj<FunctionInfo>) => void;
  responseContent?: ResponseContent;
  runtimeVersion?: string;
  fileList?: VfsObject[];
}

const editorStyle = style({
  marginTop: '20px',
  marginBottom: '10px',
  marginRight: '10px',
});

export const FunctionEditor: React.SFC<FunctionEditorProps> = props => {
  const { functionInfo, site, fileList, runtimeVersion, responseContent } = props;
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [reqBody, setReqBody] = useState('');
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const [defaultFileContent, setDefaultFileContent] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<IDropdownOption | undefined>(undefined);
  const [editorLanguage, setEditorLanguage] = useState(EditorLanguage.plaintext);
  const [dirty, setDirty] = useState<boolean>(false);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState<IDropdownOption | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [savingFile, setSavingFile] = useState<boolean>(false);
  const [selectedPivotTab, setSelectedPivotTab] = useState(PivotType.input);

  const { t } = useTranslation();

  const save = async () => {
    if (!selectedFile) {
      return;
    }
    setSavingFile(true);
    const fileData = selectedFile.data;
    const headers = {
      'Content-Type': fileData.mime,
      'If-Match': '*',
    };
    const fileResponse = await FunctionsService.saveFileContent(
      site.id,
      functionInfo.properties.name,
      fileData.name,
      newFileContent,
      runtimeVersion,
      headers
    );
    if (fileResponse.metadata.success) {
      setDefaultFileContent(newFileContent);
      setDirty(false);
    }
    setSavingFile(false);
  };

  const discard = () => {
    setNewFileContent(defaultFileContent);
  };

  const test = () => {
    setShowTestPanel(true);
  };

  const onCancelTest = () => {
    setShowTestPanel(false);
  };

  const onFileSelectorChange = async (e: unknown, option: IDropdownOption) => {
    if (dirty) {
      setSelectedDropdownOption(option);
      return;
    }
    changeDropdownOption(option);
  };

  const changeDropdownOption = (option: IDropdownOption) => {
    closeConfirmDialog();
    setFetchingFileContent(true);
    setSelectedFile(option);
    setSelectedFileContent(option.data);
    getAndSetEditorLanguage(option.data.name);
    setFetchingFileContent(false);
    setDirty(false);
  };

  const run = (values: InputFormValues, formikActions: FormikActions<InputFormValues>) => {
    const data = JSON.stringify({
      method: values.method,
      queryStringParams: values.queries,
      headers: values.headers,
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

  const getDropdownOptions = (): IDropdownOption[] => {
    return !!fileList
      ? fileList
          .map(file => ({
            key: file.name,
            text: file.name,
            isSelected: false,
            data: file,
          }))
          .filter(file => file.data.mime !== 'inode/directory')
          .sort((a, b) => a.key.localeCompare(b.key))
      : [];
  };

  const setSelectedFileContent = async (file: VfsObject) => {
    const headers = {
      'Content-Type': file.mime,
    };
    const fileResponse = await FunctionsService.getFileContent(site.id, functionInfo.properties.name, runtimeVersion, headers, file.name);
    if (fileResponse.metadata.success) {
      let fileText = fileResponse.data as string;
      if (file.mime === 'application/json') {
        fileText = JSON.stringify(fileResponse.data);
      }
      setDefaultFileContent(fileText);
      setNewFileContent(fileText);
    }
  };

  const fetchData = async () => {
    const options = getDropdownOptions();
    const file = options.length > 0 ? options[0] : undefined;
    if (!!file) {
      setSelectedFileContent(file.data);
      setSelectedFile(file);
      getAndSetEditorLanguage(file.data.name);
    }
    setInitialLoading(false);
  };

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
    setNewFileContent(newValue);
  };

  const getAndSetEditorLanguage = (fileName: string) => {
    const extension = fileName
      .toLowerCase()
      .split('.')
      .pop();
    let language;
    switch (extension) {
      case 'bat':
        language = EditorLanguage.bat;
        break;
      case 'csx':
        language = EditorLanguage.csharp;
        break;
      case 'fsx':
        language = EditorLanguage.fsharp;
        break;
      case 'js':
        language = EditorLanguage.javascript;
        break;
      case 'json':
        language = EditorLanguage.json;
        break;
      case 'ps1':
        language = EditorLanguage.powershell;
        break;
      case 'py':
        language = EditorLanguage.python;
        break;
      case 'ts':
        language = EditorLanguage.typescript;
        break;
      case 'md':
        language = EditorLanguage.markdown;
        break;
      case 'php':
        language = EditorLanguage.php;
        break;
      case 'sh':
        language = EditorLanguage.shell;
        break;
      default:
        language = EditorLanguage.plaintext;
        break;
    }
    setEditorLanguage(language);
  };

  const isLoading = () => {
    return fetchingFileContent || initialLoading || savingFile;
  };

  const closeConfirmDialog = () => {
    setSelectedDropdownOption(undefined);
  };

  const getPivotTabId = (itemKey: string, index: number): string => {
    switch (itemKey) {
      case PivotType.input:
        return 'function-test-input';
      case PivotType.output:
        return 'function-test-output';
      default:
        return '';
    }
  };

  const onPivotItemClick = (item?: PivotItem, ev?: React.MouseEvent<HTMLElement>) => {
    if (!!item) {
      setSelectedPivotTab(item.props.itemKey as PivotType);
    }
  };

  const getHeaderContent = (): JSX.Element => {
    return (
      <Pivot getTabId={getPivotTabId} className={pivotStyle} onLinkClick={onPivotItemClick} selectedKey={selectedPivotTab}>
        <PivotItem itemKey={PivotType.input} linkText={t('functionTestInput')} />
        <PivotItem itemKey={PivotType.output} linkText={t('functionTestOutput')} />
      </Pivot>
    );
  };

  const changePivotTab = (pivotItem: PivotType) => {
    setSelectedPivotTab(pivotItem);
  };

  useEffect(() => {
    setDirty(newFileContent !== defaultFileContent);
  }, [newFileContent, defaultFileContent]);
  useEffect(() => {
    if (!!responseContent) {
      changePivotTab(PivotType.output);
    }
  }, [responseContent]);
  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <FunctionEditorCommandBar
        saveFunction={save}
        resetFunction={discard}
        testFunction={test}
        showGetFunctionUrlCommand={!!inputBinding}
        dirty={dirty}
        disabled={isLoading()}
        hostKeyDropdownOptions={hostKeyDropdownOptions}
        hostKeyDropdownSelectedKey={'master'}
        hostUrls={hostUrls}
      />
      <ConfirmDialog
        primaryActionButton={{
          title: t('ok'),
          onClick: () => !!selectedDropdownOption && changeDropdownOption(selectedDropdownOption),
        }}
        defaultActionButton={{
          title: t('cancel'),
          onClick: closeConfirmDialog,
        }}
        title={t('editor_changeFile')}
        content={t('editor_changeFileConfirmMessage')}
        hidden={!selectedDropdownOption}
        onDismiss={closeConfirmDialog}
      />
      <FunctionEditorFileSelectorBar
        disabled={isLoading()}
        functionAppNameLabel={site.name}
        functionInfo={functionInfo}
        fileDropdownOptions={getDropdownOptions()}
        fileDropdownSelectedKey={!!selectedFile ? (selectedFile.key as string) : ''}
        onChangeDropdown={onFileSelectorChange}
      />
      <Panel type={PanelType.medium} isOpen={showTestPanel} onDismiss={onCancelTest} headerText={''} headerContent={getHeaderContent()}>
        <FunctionTest
          cancel={onCancelTest}
          run={run}
          functionInfo={functionInfo}
          reqBody={reqBody}
          setReqBody={setReqBody}
          responseContent={responseContent}
          selectedPivotTab={selectedPivotTab}
        />
      </Panel>
      {isLoading() && <LoadingComponent />}
      <div className={editorStyle}>
        <MonacoEditor
          value={newFileContent}
          language={editorLanguage}
          onChange={onChange}
          disabled={isLoading()}
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
