import React from 'react';
import { ITextFieldProps } from '@fluentui/react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import TextFieldNoFormik from './TextFieldNoFormik';
import { Links } from '../../utils/FwLinks';
import { Layout } from './ReactiveFormControl';
import { useTranslation } from 'react-i18next';

export interface CustomTextFieldProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label?: string;
  learnMoreLink?: string;
  dirty?: boolean;
  widthOverride?: string;
  copyButton?: boolean;
  formControlClassName?: string;
  additionalControls?: JSX.Element[];
  layout?: Layout;
}

/** @note (joechung): The `form` attribute from `FieldProps` does not match the one from `ITextFieldProps`. */
const TextField: React.FC<FieldProps & Omit<ITextFieldProps, 'form'> & CustomTextFieldProps> = props => {
  const { field, form, ...rest } = props;

  const { t } = useTranslation();

  const onChange = (e: any, value: string) => {
    form.setFieldValue(field.name, value);
    field.onChange(e);
  };

  const getErrorMessage = () => {
    return get(form.touched, field.name, false) ? cronErrorMessage(get(form.errors, field.name, '') as string) : undefined;
  };

  // TODO (refortie): Temporary hard-coding of the documentation link.
  // Remove this once we get the API update so that errors have learn more
  const cronErrorMessage = (errorMessage: string): string | JSX.Element => {
    if (errorMessage.includes('Invalid Cron Expression')) {
      return <span dangerouslySetInnerHTML={{ __html: t('invalidCronExpressionMessage').format(Links.cronLearnMore) }} />;
    }
    return errorMessage;
  };

  return <TextFieldNoFormik value={field.value} onBlur={field.onBlur} errorMessage={getErrorMessage()} onChange={onChange} {...rest} />;
};

export default TextField;
