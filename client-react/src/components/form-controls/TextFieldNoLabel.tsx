import React from 'react';
import { TextField as OfficeTextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { FieldProps } from 'formik';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TextFieldStyles } from '../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
interface EventMsg {
  e: any;
  value: string;
}

class TextField extends React.Component<FieldProps & ITextFieldProps, any> {
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
    const { field, ...rest } = this.props;

    return (
      <OfficeTextField
        value={field.value}
        tabIndex={0}
        onChange={this.onChange}
        onBlur={field.onBlur}
        errorMessage={rest.errorMessage}
        styles={TextFieldStyles}
        {...rest}
      />
    );
  }

  private onChange = (e: any, value: string) => {
    this.inputDebouncer.next({
      e,
      value,
    });
  };
}
export default TextField;
