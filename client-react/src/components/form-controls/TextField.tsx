import React from 'react';
import { ITextFieldProps } from '@fluentui/react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import TextFieldNoFormik from './TextFieldNoFormik';
import { Link } from '@fluentui/react';
import { Links } from '../../utils/FwLinks';
import { Layout } from './ReactiveFormControl';

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

const TextField: React.FC<FieldProps & ITextFieldProps & CustomTextFieldProps> = props => {
  const { field, form, ...rest } = props;

  const onChange = (e: any, value: string) => {
    form.setFieldValue(field.name, value);
    field.onChange(e);
  };

  const getErrorMessage = () => {
    return cronErrorMessage(get(form.errors, field.name, '') as string);
  };

  // TODO (refortie): Temporary hard-coding of the documentation link.
  // Remove this once we get the API update so that errors have learn more
  const cronErrorMessage = (errorMessage: string): string | JSX.Element => {
    if (errorMessage.includes('Invalid Cron Expression')) {
      return (
        <>
          Invalid Cron Expression. Please consult the{' '}
          <Link // eslint-disable-next-line react/jsx-no-target-blank
            target="_blank"
            href={Links.cronLearnMore}>
            documentation
          </Link>{' '}
          to learn more.
        </>
      );
    }
    return errorMessage;
  };

  return <TextFieldNoFormik value={field.value} onBlur={field.onBlur} errorMessage={getErrorMessage()} onChange={onChange} {...rest} />;
};

export default TextField;
