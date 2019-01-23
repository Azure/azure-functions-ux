import { Field, FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import TextField from '../../../../components/form-controls/TextField';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues } from '../AppSettings.types';

const DefaultDocuments: React.SFC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const [focusLast, setFocusLast] = React.useState(false);
  let lastFieldRef: HTMLInputElement;

  // This is a hook that is run after render if finished
  React.useEffect(() => {
    if (focusLast) {
      lastFieldRef.focus();
      setFocusLast(false);
    }
  });

  const { values, setValues, errors, t } = props;
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
        disabled={!values.siteWritePermission}
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
              disabled={!values.siteWritePermission}
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
              disabled={!values.siteWritePermission}
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

export default translate('translation')(DefaultDocuments);
