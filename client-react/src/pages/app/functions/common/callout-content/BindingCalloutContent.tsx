import { DefaultButton, PrimaryButton } from '@fluentui/react';
import { Form, Formik, FormikActions, FormikProps } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './BindingCalloutContent.style';

interface BindingCalloutContentProps<TValues> {
  description: React.ReactNode;
  header: string;
  initialValues: TValues;
  onCancel: () => void;
  onCreate: (values: TValues, formikActions: FormikActions<TValues>) => void;
  onRenderCreator: (formProps: FormikProps<TValues>, setTemplate: React.Dispatch<string>, template?: string) => React.ReactNode;
}

const BindingCalloutContent = <T,>({
  description,
  header,
  initialValues,
  onCancel,
  onCreate,
  onRenderCreator,
}: BindingCalloutContentProps<T>) => {
  const [template, setTemplate] = useState<string>();
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.calloutContent}>
      <h3 className={styles.header}>{header}</h3>
      <div className={styles.description}>{description}</div>
      <Formik initialValues={initialValues} onSubmit={onCreate}>
        {formProps => (
          <>
            <Form>{onRenderCreator(formProps, setTemplate, template)}</Form>
            <div className={styles.actionBar}>
              <PrimaryButton disabled={!formProps.isValid} text={t('create')} onClick={formProps.submitForm} />
              <DefaultButton text={t('cancel')} onClick={onCancel} />
            </div>
          </>
        )}
      </Formik>
    </div>
  );
};

export default BindingCalloutContent;
