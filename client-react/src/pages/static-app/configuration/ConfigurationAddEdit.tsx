import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EnvironmentVariable } from './Configuration.types';
import { addEditFormStyle } from '../../../components/form-controls/formControl.override.styles';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import ActionBar from '../../../components/ActionBar';

interface ConfigurationAddEditProps {
  cancel: () => void;
  updateEnvironmentVariable: (environmentVariables: EnvironmentVariable[]) => void;
  environmentVariables: EnvironmentVariable[];
  currentEnvironmentVariableIndex?: number;
}

const ConfigurationAddEdit: React.FC<ConfigurationAddEditProps> = props => {
  const { environmentVariables, currentEnvironmentVariableIndex, updateEnvironmentVariable, cancel } = props;
  const [currentEnvironmentVariable, setCurrentEnvironmentVariable] = useState<EnvironmentVariable>({ name: '', value: '' });

  const { t } = useTranslation();

  const onNameChange = (e: any, name: string) => {
    setCurrentEnvironmentVariable({ ...currentEnvironmentVariable, name });
  };

  const onValueChange = (e: any, value: string) => {
    setCurrentEnvironmentVariable({ ...currentEnvironmentVariable, value });
  };

  const save = () => {
    // Check and resolve the edit scenario first
    if (currentEnvironmentVariableIndex !== undefined && environmentVariables.length > currentEnvironmentVariableIndex) {
      environmentVariables[currentEnvironmentVariableIndex] = currentEnvironmentVariable;
    } else {
      environmentVariables.push(currentEnvironmentVariable);
    }
    updateEnvironmentVariable(environmentVariables);
    cancel();
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: save,
    disable: !currentEnvironmentVariable.name || !currentEnvironmentVariable.value,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  useEffect(() => {
    if (currentEnvironmentVariableIndex !== undefined && environmentVariables.length > currentEnvironmentVariableIndex) {
      setCurrentEnvironmentVariable(environmentVariables[currentEnvironmentVariableIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <form className={addEditFormStyle}>
        <TextFieldNoFormik
          label={t('nameRes')}
          id="environment-variable-edit-name"
          widthOverride="100%"
          value={currentEnvironmentVariable.name}
          onChange={onNameChange}
          copyButton={true}
          autoFocus
        />
        <TextFieldNoFormik
          label={t('value')}
          id="environment-variable-edit-value"
          widthOverride="100%"
          value={currentEnvironmentVariable.value}
          onChange={onValueChange}
          copyButton={true}
        />
        <ActionBar
          id="environment-variable-edit-footer"
          primaryButton={actionBarPrimaryButtonProps}
          secondaryButton={actionBarSecondaryButtonProps}
        />
      </form>
    </>
  );
};

export default ConfigurationAddEdit;
