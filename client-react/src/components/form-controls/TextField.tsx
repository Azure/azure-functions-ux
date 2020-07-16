import React from 'react';
import { ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { debounceTime } from 'rxjs/operators';
import { FieldProps } from 'formik';
import { Subject } from 'rxjs';
import get from 'lodash-es/get';
import TextFieldNoFormik from './TextFieldNoFormik';
import { Link } from 'office-ui-fabric-react';
import { Links } from '../../utils/FwLinks';

interface EventMsg {
  e: any;
  value: string;
}

interface CustomTextFieldProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  learnMoreLink?: string;
  dirty?: boolean;
  widthOverride?: string;
  additionalControls?: JSX.Element[];
}

class TextField extends React.Component<FieldProps & ITextFieldProps & CustomTextFieldProps, any> {
  private inputDebouncer = new Subject<EventMsg>();
  private readonly DEBOUNCE_TIME = 300;

  public componentWillMount() {
    const { field, form } = this.props;
    this.inputDebouncer.pipe(debounceTime(this.DEBOUNCE_TIME)).subscribe(({ e, value }) => {
      form.setFieldValue(field.name, value);
      field.onChange(e);
    });
  }

  public componentWillUnmount() {
    this.inputDebouncer.unsubscribe();
  }

  public render() {
    const { field, form, ...rest } = this.props;
    const errorMessage = get(form.errors, field.name, '') as string;
    const finalErrorMessage = this.cronErrorMessage(errorMessage);

    return (
      <TextFieldNoFormik value={field.value} onBlur={field.onBlur} errorMessage={finalErrorMessage} onChange={this.onChange} {...rest} />
    );
  }

  private onChange = (e: any, value: string) => {
    this.inputDebouncer.next({
      e,
      value,
    });
  };

  // TODO (refortie): Temporary hard-coding of the documentation link.
  // Remove this once we get the API update so that errors have learn more
  private cronErrorMessage(errorMessage: string): string | JSX.Element {
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
  }
}

export default TextField;
