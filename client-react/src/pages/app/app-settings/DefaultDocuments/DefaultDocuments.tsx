import * as React from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { AppSettingsFormValues } from '../AppSettings.Types';
import TextField from '../../../../components/form-controls/TextField';
import { FormikProps, Field } from 'formik';
import { translate, InjectedTranslateProps } from 'react-i18next';
import IconButton from '../../../../components/IconButton/IconButton';

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
      {values.config.properties.defaultDocuments.map((value, index) => (
        <div key={index} style={{ marginBottom: '5px' }}>
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
            validate={duplicateValidation}
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
        </div>
      ))}
    </>
  );
};

export default translate('translation')(DefaultDocuments);
