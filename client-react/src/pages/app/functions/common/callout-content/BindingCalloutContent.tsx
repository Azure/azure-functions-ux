import { DefaultButton, PrimaryButton } from '@fluentui/react';
import { Form, Formik, FormikActions, FormikProps, FormikValues } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './BindingCalloutContent.style';

interface BindingCalloutContentProps<TValues> {
  description: React.ReactNode;
  formRef: React.RefObject<Formik<FormikValues>>;
  header: string;
  initialValues: TValues;
  onCancel: () => void;
  onCreate: (values: TValues, formikActions: FormikActions<TValues>) => void;
  onRenderCreator: (
    formProps: FormikProps<TValues>,
    setTemplate: React.Dispatch<React.SetStateAction<string>>,
    template?: string
  ) => React.ReactNode;
}

const BindingCalloutContent = <T,>({
  description,
  formRef,
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
    <section className={styles.calloutContent}>
      <h1 className={styles.header}>{header}</h1>
      <div className={styles.description}>{description}</div>
      <Formik initialValues={initialValues} onSubmit={onCreate} ref={formRef}>
        {(formProps: FormikProps<T>) => (
          <>
            <Form>{onRenderCreator(formProps, setTemplate, template)}</Form>
            <div className={styles.actionBar}>
              <PrimaryButton disabled={!formProps.isValid} text={t('create')} onClick={formProps.submitForm} />
              <DefaultButton text={t('cancel')} onClick={onCancel} />
            </div>
          </>
        )}
      </Formik>
    </section>
  );
};

export default BindingCalloutContent;
