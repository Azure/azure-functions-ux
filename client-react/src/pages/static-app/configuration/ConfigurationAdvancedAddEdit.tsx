import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { EnvironmentVariable } from './Configuration.types';
import ActionBar from '../../../components/ActionBar';
import MonacoEditor, { getMonacoEditorTheme } from '../../../components/monaco-editor/monaco-editor';
import { PortalTheme } from '../../../models/portal-models';
import { StartupInfoContext } from '../../../StartupInfoContext';
import { MessageBarType } from 'office-ui-fabric-react';
import { ConfigurationUtils } from './Configuration.utils';

interface ConfigurationAdvancedAddEditProps {
  cancel: () => void;
  updateEnvironmentVariable: (environmentVariables: EnvironmentVariable[]) => void;
  environmentVariables: EnvironmentVariable[];
}

const ConfigurationAdvancedAddEdit: React.FC<ConfigurationAdvancedAddEditProps> = props => {
  const { environmentVariables, updateEnvironmentVariable, cancel } = props;

  const [environmentVariablesJSON, setEnvironmentVariablesJSON] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { t } = useTranslation();

  const startUpInfoContext = useContext(StartupInfoContext);

  const save = () => {
    const environmentVariablesArray = JSON.parse(environmentVariablesJSON);
    updateEnvironmentVariable(environmentVariablesArray);
    cancel();
  };

  const onChange = (newValue: string, event: any) => {
    setEnvironmentVariablesJSON(newValue);
    validate(newValue);
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: save,
    disable: false,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  const validate = newValue => {
    const err = ConfigurationUtils.getErrorMessage(newValue, t);
    setErrorMessage(err);
  };

  const getStatusMessage = () => {
    return errorMessage ? { message: errorMessage, level: MessageBarType.error } : undefined;
  };

  useEffect(() => {
    // third parameter refers to the number of white spaces.
    // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
    setEnvironmentVariablesJSON(JSON.stringify(environmentVariables, null, 2));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentVariables]);
  return (
    <>
      <form>
        <MonacoEditor
          value={environmentVariablesJSON}
          language="json"
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          height="calc(100vh - 140px)"
          theme={getMonacoEditorTheme(startUpInfoContext.theme as PortalTheme)}
        />
        <ActionBar
          id="environment-variable-edit-footer"
          primaryButton={actionBarPrimaryButtonProps}
          secondaryButton={actionBarSecondaryButtonProps}
          statusMessage={getStatusMessage()}
        />
      </form>
    </>
  );
};

export default ConfigurationAdvancedAddEdit;
