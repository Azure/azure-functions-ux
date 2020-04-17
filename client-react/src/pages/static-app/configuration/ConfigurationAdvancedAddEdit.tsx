import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EnvironmentVariable } from './Configuration.types';
import ActionBar from '../../../components/ActionBar';
import { ConfigurationUtils } from './Configuration.utils';
import { MessageBarType } from 'office-ui-fabric-react';
import MonacoEditor from '../../../components/monaco-editor/MonacoEditor';
import { MonacoLanguage } from '../../../components/monaco-editor/MonacoEditor.types';

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

  const save = () => {
    const environmentVariablesArray = JSON.parse(environmentVariablesJSON);
    updateEnvironmentVariable(environmentVariablesArray);
    cancel();
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

  const onChange = (newValue, e) => {
    setEnvironmentVariablesJSON(environmentVariablesJSON);
    validate(environmentVariablesJSON);
  };

  useEffect(() => {
    setEnvironmentVariablesJSON(JSON.stringify(environmentVariables, null, 2));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentVariables]);
  return (
    <>
      <form>
        <MonacoEditor
          value={environmentVariablesJSON}
          language={MonacoLanguage.json}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          height="calc(100vh - 140px)"
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
