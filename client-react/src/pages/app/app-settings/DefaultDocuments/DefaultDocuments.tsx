import * as React from 'react';
import { IconButton, ActionButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { AppSettingsFormValues } from '../AppSettings.Types';
import TextField from '../../../../components/form-controls/TextField';
import { FormikProps, Field } from 'formik';

const DefaultDocuments: React.SFC<FormikProps<AppSettingsFormValues>> = props => {
  const { values, setValues, errors } = props;

  const duplicateValidation = (value: string) => {
    return values.config.properties.defaultDocuments.filter(v => v === value).length > 1 ? 'This field must be unique.' : null;
  };
  const removeItem = (index: number) => {
    const defaultDocuments: string[] = JSON.parse(JSON.stringify(values.config.properties.defaultDocuments));
    defaultDocuments.splice(index, 1);
    setValues({
      ...values,
      config: {
        ...values.config,
        properties: {
          ...values.config.properties,
          defaultDocuments,
        },
      },
    });
  };

  const createNewItem = () => {
    const defaultDocuments: string[] = JSON.parse(JSON.stringify(values.config.properties.defaultDocuments));
    defaultDocuments.push('');
    setValues({
      ...values,
      config: {
        ...values.config,
        properties: {
          ...values.config.properties,
          defaultDocuments,
        },
      },
    });
  };

  if (!values.config.properties.defaultDocuments) {
    return null;
  }

  return (
    <>
      <ActionButton onClick={createNewItem} styles={{ root: { marginTop: '5px' } }} iconProps={{ iconName: 'Add' }}>
        New Document
      </ActionButton>
      {values.config.properties.defaultDocuments.map((value, index) => (
        <div key={index} style={{ marginBottom: '5px' }}>
          <Field
            name={`config.properties.defaultDocuments[${index}]`}
            component={TextField}
            styles={{
              root: {
                display: 'inline-block',
                width: 'calc(100% - 20px)',
              },
            }}
            id="documentText"
            underlined
            errorMessage={
              errors &&
              errors.config &&
              errors.config.properties &&
              errors.config.properties.defaultDocuments &&
              errors.config.properties.defaultDocuments[index]
            }
            validate={duplicateValidation}
            {...props}
          />
          <IconButton
            style={{ display: 'inline-block', width: '16px' }}
            iconProps={{ iconName: 'Delete' }}
            title="Delete"
            onClick={() => removeItem(index)}
          />
        </div>
      ))}
    </>
  );
};

export default DefaultDocuments;
