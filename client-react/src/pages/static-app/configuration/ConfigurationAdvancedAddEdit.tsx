import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EnvironmentVariable } from './Configuration.types';
import ActionBar from '../../../components/ActionBar';
import { ConfigurationUtils } from './Configuration.utils';
import { MessageBarType } from 'office-ui-fabric-react';

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

  useEffect(() => {
    setEnvironmentVariablesJSON(JSON.stringify(environmentVariables, null, 2));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentVariables]);
  return (
    <>
      <form>
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
