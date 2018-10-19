import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
import { IConnectionString } from '../../../../modules/site/config/connectionstrings/actions';
export interface ConnectionStringAddEditProps extends IConnectionString {
  updateConnectionString: (item: IConnectionString) => any;
}

const ConnectionStringsAddEdit: React.SFC<ConnectionStringAddEditProps> = props => {
  const { updateConnectionString, children, ...connectionString } = props;
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
      <TextField label="Name" id="name" value={connectionString.name} onChanged={updateConnectionStringName} />
      <TextField label="Value" id="value" value={connectionString.value} onChanged={updateConnectionStringValue} />
      <TextField label="Type" id="type" value={connectionString.type.toString()} onChanged={updateConnectionStringType} />
      <Toggle
        label="Sticky"
        id="sticky"
        defaultChecked={connectionString.sticky}
        onChanged={updateConnectionStringSticky}
        onText="On"
        offText="Off"
      />
    </div>
  );
};

export default ConnectionStringsAddEdit;
