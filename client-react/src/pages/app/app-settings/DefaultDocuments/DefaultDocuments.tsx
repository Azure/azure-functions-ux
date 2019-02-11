import { Field, FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import TextField from '../../../../components/form-controls/TextField';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';

const DefaultDocuments: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const [focusLast, setFocusLast] = useState(false);
  const { t } = useTranslation();
  let lastFieldRef: HTMLInputElement;
  const { app_write } = useContext(PermissionsContext);
  // This is a hook that is run after render if finished
  useEffect(() => {
    if (focusLast) {
      lastFieldRef.focus();
      setFocusLast(false);
    }
  });

  const { values, setValues, errors } = props;
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
    setFocusLast(true);
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
      <ActionButton
        id="app-settings-new-default-document-button"
        disabled={!app_write}
        onClick={createNewItem}
        styles={{ root: { marginTop: '5px' } }}
        iconProps={{ iconName: 'Add' }}>
        {t('newDocument')}
      </ActionButton>
      <ol>
        {values.config.properties.defaultDocuments.map((value, index) => (
          <li key={index} style={{ marginBottom: '5px', marginLeft: '0px', listStyle: 'none' }}>
            <Field
              name={`config.properties.defaultDocuments[${index}]`}
              component={TextField}
              componentRef={field => {
                lastFieldRef = field;
              }}
              disabled={!app_write}
              styles={{
                root: {
                  display: 'inline-block',
                  width: 'calc(100% - 20px)',
                },
              }}
              id={`app-settings-document-text-${index}`}
              ariaLabel={t('defaultDocuments')}
              underlined
              errorMessage={
                errors &&
                errors.config &&
                errors.config.properties &&
                errors.config.properties.defaultDocuments &&
                errors.config.properties.defaultDocuments[index]
              }
              {...props}
            />
            <IconButton
              id={`app-settings-document-delete-${index}`}
              disabled={!app_write}
              style={{ display: 'inline-block', width: '16px' }}
              iconProps={{ iconName: 'Delete' }}
              title={t('delete')}
              onClick={() => removeItem(index)}
            />
          </li>
        ))}
      </ol>
    </>
  );
};

export default DefaultDocuments;
