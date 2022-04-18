import React, { useContext, useEffect, useState } from 'react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';
import { ThemeContext } from '../../ThemeContext';
import ComboBoxNoFormik from './ComboBoxnoFormik';
import { IComboBoxProps, IComboBoxOption, IComboBox, IDropdownOption, Spinner, SpinnerSize } from '@fluentui/react';
import { comboBoxSpinnerStyle, loadingComboBoxStyle } from '../../pages/app/deployment-center/DeploymentCenter.styles';

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
      if (searchable) {
        setSearchTerm(option.text);
      }
    } else {
      setSearchTerm(value);
      form.setFieldValue(field.name, '');
    }
  };

  const onInputValueChange = (newValue?: string) => {
    setSearchTerm(newValue);
    form.setFieldValue('searchTerm', newValue);
    form.setFieldValue(field.name, undefined);
  };

  useEffect(() => {
    if (clearComboBox) {
      form.setFieldValue(field.name, undefined);
      setSearchTerm(undefined);
    }
  }, [options]);

  const errorMessage = get(form.errors, field.name, '') as string;

  return (
    <div className={loadingComboBoxStyle}>
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
        disabled={clearComboBox || (!searchable && isLoading)}
        autofill={searchable ? { onInputValueChange: onInputValueChange } : {}}
        {...rest}
      />
      {!!isLoading && <Spinner className={comboBoxSpinnerStyle} size={SpinnerSize.small} />}
    </div>
  );
};

export default ComboBox;
