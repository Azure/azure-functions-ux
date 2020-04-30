import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { EnvironmentVariable } from './Configuration.types';
import ActionBar from '../../../components/ActionBar';
import { ConfigurationUtils } from './Configuration.utils';
import { MessageBarType } from 'office-ui-fabric-react';
import MonacoEditor, { getMonacoEditorTheme } from '../../../components/monaco-editor/monaco-editor';
import { EditorLanguage } from '../../../utils/EditorManager';
import { StartupInfoContext } from '../../../StartupInfoContext';
import { PortalTheme } from '../../../models/portal-models';

interface ConfigurationAdvancedAddEditProps {
  cancel: () => void;
  updateEnvironmentVariable: (environmentVariables: EnvironmentVariable[]) => void;
  environmentVariables: EnvironmentVariable[];
}

const ConfigurationAdvancedAddEdit: React.FC<ConfigurationAdvancedAddEditProps> = props => {
  const { environmentVariables, updateEnvironmentVariable, cancel } = props;

  const [environmentVariablesJSON, setEnvironmentVariablesJSON] = useState('[]');
  const [errorMessage, setErrorMessage] = useState('');

  const { t } = useTranslation();

  const startUpContext = useContext(StartupInfoContext);

  const save = () => {
    validate(environmentVariablesJSON);
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
    setEnvironmentVariablesJSON(newValue);
    validate(newValue);
  };

  useEffect(() => {
    setEnvironmentVariablesJSON(JSON.stringify(environmentVariables, null, 2));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentVariables]);
  return (
    <form>
      <MonacoEditor
        value={environmentVariablesJSON}
        language={EditorLanguage.json}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        height="calc(100vh - 140px)"
        theme={getMonacoEditorTheme(startUpContext.theme as PortalTheme)}
      />
      <ActionBar
        id="environment-variable-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
        statusMessage={getStatusMessage()}
      />
    </form>
  );
};

export default ConfigurationAdvancedAddEdit;
