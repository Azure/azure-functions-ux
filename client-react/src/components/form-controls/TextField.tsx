import React from 'react';
import { ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { debounceTime } from 'rxjs/operators';
import { FieldProps } from 'formik';
import { Subject } from 'rxjs';
import get from 'lodash-es/get';
import TextFieldNoFormik from './TextFieldNoFormik';
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
    return <TextFieldNoFormik value={field.value} onBlur={field.onBlur} errorMessage={errorMessage} onChange={this.onChange} {...rest} />;
  }

  private onChange = (e: any, value: string) => {
    this.inputDebouncer.next({
      e,
      value,
    });
  };
}
export default TextField;
