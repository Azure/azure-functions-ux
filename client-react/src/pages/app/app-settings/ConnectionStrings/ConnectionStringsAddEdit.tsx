import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
import { IConnectionString } from '../../../../modules/site/config/connectionstrings/actions';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib-commonjs/Dropdown';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { typeValueToString, DatabaseType } from './connectionStringTypes';
export interface ConnectionStringAddEditProps extends IConnectionString {
  updateConnectionString: (item: IConnectionString) => any;
  otherConnectionStrings: IConnectionString[];
}

const ConnectionStringsAddEdit: React.SFC<ConnectionStringAddEditProps & InjectedTranslateProps> = props => {
  const { updateConnectionString, children, otherConnectionStrings, t, ...connectionString } = props;
  const [nameError, setNameError] = React.useState('');
  const validateConnectionStringName = (value: string) => {
    return otherConnectionStrings.filter(v => v.name === value).length >= 1 ? 'Connection string names must be unique' : '';
  };
  const updateConnectionStringName = (name: string) => {
    const error = validateConnectionStringName(name);
    setNameError(error);
    updateConnectionString({ ...connectionString, name });
  };

  const updateConnectionStringValue = (value: string) => {
    updateConnectionString({ ...connectionString, value });
  };

  const updateConnectionStringType = (event: any, typeOption: IDropdownOption) => {
    updateConnectionString({ ...connectionString, type: typeOption.key as number });
  };

  const updateConnectionStringSticky = (sticky: boolean) => {
    updateConnectionString({ ...connectionString, sticky });
  };
  return (
    <div>
      <TextField
        label={t('nameRes')}
        id="connection-strings-form-name"
        value={connectionString.name}
        errorMessage={nameError}
        onChanged={updateConnectionStringName}
      />
      <TextField
        label={t('value')}
        id="connection-strings-form-value"
        value={connectionString.value}
        onChanged={updateConnectionStringValue}
      />
      <Dropdown
        label={t('type')}
        id="connection-strings-form-type"
        selectedKey={connectionString.type}
        options={[
          {
            key: DatabaseType.MySql,
            text: typeValueToString(DatabaseType.MySql),
          },
          {
            key: DatabaseType.SQLServer,
            text: typeValueToString(DatabaseType.SQLServer),
          },
          {
            key: DatabaseType.SQLAzure,
            text: typeValueToString(DatabaseType.SQLAzure),
          },
        ]}
        onChange={updateConnectionStringType}
      />
      <Toggle
        label={t('sticky')}
        id="connection-strings-form-sticky"
        defaultChecked={connectionString.sticky}
        onChanged={updateConnectionStringSticky}
        onText={t('on')}
        offText={t('off')}
      />
    </div>
  );
};

export default translate('translation')(ConnectionStringsAddEdit);
