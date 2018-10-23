import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
import { IConnectionString } from '../../../../modules/site/config/connectionstrings/actions';
import { translate, InjectedTranslateProps } from 'react-i18next';
export interface ConnectionStringAddEditProps extends IConnectionString {
  updateConnectionString: (item: IConnectionString) => any;
}

const ConnectionStringsAddEdit: React.SFC<ConnectionStringAddEditProps & InjectedTranslateProps> = props => {
  const { updateConnectionString, children, t, ...connectionString } = props;
  const updateConnectionStringName = (name: string) => {
    updateConnectionString({ ...connectionString, name });
  };

  const updateConnectionStringValue = (value: string) => {
    updateConnectionString({ ...connectionString, value });
  };

  const updateConnectionStringType = (type: number) => {
    updateConnectionString({ ...connectionString, type });
  };

  const updateConnectionStringSticky = (sticky: boolean) => {
    updateConnectionString({ ...connectionString, sticky });
  };
  return (
    <div>
      <TextField label={t('name')} id="connection-strings-form-name" value={connectionString.name} onChanged={updateConnectionStringName} />
      <TextField
        label={t('value')}
        id="connection-strings-form-value"
        value={connectionString.value}
        onChanged={updateConnectionStringValue}
      />
      <TextField
        label={t('type')}
        id="connection-strings-form-type"
        value={connectionString.type.toString()}
        onChanged={updateConnectionStringType}
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
