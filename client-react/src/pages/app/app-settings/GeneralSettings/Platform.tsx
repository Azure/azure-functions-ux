import * as React from 'react';
import Dropdown from '../../../../components/form-controls/DropDown';
import { Field, FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';

const Platform: React.SFC<FormikProps<AppSettingsFormValues>> = (props: FormikProps<AppSettingsFormValues>) => {
  return (
    <div>
      <Field
        name="config.properties.use32BitWorkerProcess"
        component={Dropdown}
        label="Platform"
        id="use32BitWorkerProcess"
        options={[
          {
            key: true,
            text: '32 Bit',
          },
          {
            key: false,
            text: '64 Bit',
          },
        ]}
      />
      <Field
        name="config.properties.managedPipelineMode"
        component={Dropdown}
        label="Managed Pipeline Version"
        id="managedPipelineMode"
        options={[
          {
            key: 0,
            text: 'Integrated',
          },
          {
            key: 1,
            text: 'Classic',
          },
        ]}
      />

      <Field
        name="config.properties.ftpsState"
        component={Dropdown}
        label="FTP State"
        id="ftpsState"
        options={[
          {
            key: 'AllAllowed',
            text: 'All Allowed',
          },
          {
            key: 'FtpsOnly',
            text: 'Ftps Only',
          },
          {
            key: 'Disabled',
            text: 'Disabled',
          },
        ]}
      />
      <Field
        name="config.properties.alwaysOn"
        component={Dropdown}
        label="Always On"
        id="alwaysOn"
        options={[
          {
            key: true,
            text: 'On',
          },
          {
            key: false,
            text: 'Off',
          },
        ]}
      />
      <Field
        name="config.properties.webSocketsEnabled"
        component={Dropdown}
        label="Web Sockets"
        id="webSocketsEnabled"
        options={[
          {
            key: true,
            text: 'On',
          },
          {
            key: false,
            text: 'Off',
          },
        ]}
      />
      <Field
        name="site.properties.clientAffinityEnabled"
        component={Dropdown}
        label="ARR Affinity"
        id="clientAffinityEnabled"
        options={[
          {
            key: true,
            text: 'On',
          },
          {
            key: false,
            text: 'Off',
          },
        ]}
      />
      <Field
        name="config.properties.http20Enabled"
        component={Dropdown}
        label="Http 2.0 Enabled"
        id="http20Enabled"
        options={[
          {
            key: true,
            text: '2.0',
          },
          {
            key: false,
            text: '1.1',
          },
        ]}
      />
    </div>
  );
};
export default Platform;
