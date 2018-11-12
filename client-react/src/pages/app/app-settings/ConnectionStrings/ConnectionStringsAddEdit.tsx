import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IConnectionString } from '../../../../modules/site/config/connectionstrings/actions';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { typeValueToString, DatabaseType } from './connectionStringTypes';
import { formElementStyle } from '../AppSettings.Styles';
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
  const updateConnectionStringName = (e: any, name: string) => {
    const error = validateConnectionStringName(name);
    setNameError(error);
    updateConnectionString({ ...connectionString, name });
  };

  const updateConnectionStringValue = (e: any, value: string) => {
    updateConnectionString({ ...connectionString, value });
  };

  const updateConnectionStringType = (e: any, typeOption: IDropdownOption) => {
    updateConnectionString({ ...connectionString, type: typeOption.key as number });
  };

  const updateConnectionStringSticky = (e: any, sticky: boolean) => {
    updateConnectionString({ ...connectionString, sticky });
  };
  return (
    <div>
      <TextField
        label={t('nameRes')}
        id="connection-strings-form-name"
        value={connectionString.name}
        errorMessage={nameError}
        onChange={updateConnectionStringName}
        styles={{
          root: formElementStyle,
        }}
      />
      <TextField
        label={t('value')}
        id="connection-strings-form-value"
        value={connectionString.value}
        onChange={updateConnectionStringValue}
        styles={{
          root: formElementStyle,
        }}
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
        styles={{
          root: formElementStyle,
        }}
      />
      <Checkbox
        label={t('sticky')}
        id="connection-strings-form-sticky"
        defaultChecked={connectionString.sticky}
        onChange={updateConnectionStringSticky}
        styles={{
          root: formElementStyle,
        }}
      />
    </div>
  );
};

export default translate('translation')(ConnectionStringsAddEdit);
