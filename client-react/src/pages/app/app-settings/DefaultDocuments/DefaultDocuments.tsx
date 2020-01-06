import { Field, FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import TextField from '../../../../components/form-controls/TextFieldNoLabel';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import { ThemeContext } from '../../../../ThemeContext';
import { dirtyElementStyle } from '../AppSettings.styles';

const DefaultDocuments: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const [focusLast, setFocusLast] = useState(false);
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  let lastFieldRef: HTMLInputElement;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  // This is a hook that is run after render if finished
  useEffect(() => {
    if (focusLast) {
      lastFieldRef.focus();
      setFocusLast(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusLast]);

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

  const isAppSettingDirty = (index: number): boolean => {
    const initialDefaultDocuments = props.initialValues.config.properties.defaultDocuments;
    const currentRow = values.config.properties.defaultDocuments[index];
    const initialDefaultDocumentIndex = initialDefaultDocuments.findIndex(x => x.toLowerCase() === currentRow.toLowerCase());
    return initialDefaultDocumentIndex < 0;
  };

  if (!values.config.properties.defaultDocuments) {
    return null;
  }

  return (
    <>
      <ActionButton
        id="app-settings-new-default-document-button"
        disabled={disableAllControls}
        onClick={createNewItem}
        styles={{ root: { marginTop: '5px' } }}
        iconProps={{ iconName: 'Add' }}
        ariaLabel={t('addNewDocument')}>
        {t('newDocument')}
      </ActionButton>
      <ol>
        {values.config.properties.defaultDocuments.map((value, index) => (
          <li key={index} style={{ marginBottom: '5px', marginLeft: '0px', listStyle: 'none' }}>
            <div
              className={`${isAppSettingDirty(index) ? dirtyElementStyle(theme) : ''}`}
              style={{
                display: 'inline-block',
                width: 'calc(100% - 20px)',
              }}>
              <Field
                name={`config.properties.defaultDocuments[${index}]`}
                component={TextField}
                componentRef={field => {
                  lastFieldRef = field;
                }}
                disabled={disableAllControls}
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
            </div>
            <IconButton
              id={`app-settings-document-delete-${index}`}
              disabled={disableAllControls}
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
