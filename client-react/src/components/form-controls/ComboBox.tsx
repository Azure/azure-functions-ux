import React, { useContext, useEffect, useRef, useState } from 'react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';
import { ThemeContext } from '../../ThemeContext';
import ComboBoxNoFormik from './ComboBoxnoFormik';
import { IComboBoxProps, IComboBoxOption, IComboBox, IDropdownOption } from 'office-ui-fabric-react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface CustomComboBoxProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  errorMessage?: string;
  dirty?: boolean;
  value: string;
  setOptions?: React.Dispatch<React.SetStateAction<IDropdownOption[]>>;
  onChange?: (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => void;
  learnMoreLink?: string;
  isLoading?: boolean;
  searchable?: boolean;
  clearComboBox?: boolean;
}

const ComboBox = (props: FieldProps & IComboBoxProps & CustomComboBoxProps) => {
  const { field, form, options, styles, setOptions, allowFreeform, isLoading, searchable, text, clearComboBox, ...rest } = props;
  const theme = useContext(ThemeContext);
  const inputDebouncer = useRef(new Subject<string>());
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void => {
    if (!!allowFreeform && !option && !!value) {
      // If allowFreeform is true, the newly selected option might be something the user typed that
      // doesn't exist in the options list yet. So there's extra work to manually add it.
      option = { key: value, text: value };
      !!setOptions && setOptions(prevOptions => [...prevOptions, option!]);
    }

    if (option) {
      form.setFieldValue(field.name, option.key);
      if (!!searchable) {
        setSearchTerm(option.text);
      }
    } else {
      form.setFieldValue(field.name, '');
    }
  };

  const onInputValueChange = (newValue?: string) => {
    setSearchTerm(newValue);
    inputDebouncer.current.next(newValue);
  };

  const watchForSearchTermUpdates = async () => {
    inputDebouncer.current.pipe(debounceTime(300)).subscribe(value => {
      form.setFieldValue('searchTerm', value);
      form.setFieldValue(field.name, undefined);
    });
  };

  useEffect(() => {
    if (!!searchable) {
      watchForSearchTermUpdates();
    }
  }, []);

  useEffect(() => {
    if (!!clearComboBox) {
      form.setFieldValue(field.name, undefined);
      setSearchTerm(undefined);
    }
  }, [options]);

  const errorMessage = get(form.errors, field.name, '') as string;

  return (
    <>
      <ComboBoxNoFormik
        selectedKey={field.value === undefined ? 'null' : field.value}
        text={searchTerm}
        ariaLabel={props.label}
        options={options}
        onChange={onChange}
        onBlur={field.onBlur}
        errorMessage={errorMessage}
        styles={ComboBoxStyles(theme)}
        allowFreeform={allowFreeform}
        disabled={isLoading || false}
        autofill={!!searchable ? { onInputValueChange: onInputValueChange } : {}}
        {...rest}
      />
    </>
  );
};

export default ComboBox;
