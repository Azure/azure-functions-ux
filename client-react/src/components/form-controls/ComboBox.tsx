import React, { useContext } from 'react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';
import { ThemeContext } from '../../ThemeContext';
import ComboBoxNoFormik from './ComboBoxnoFormik';
import { IComboBoxProps, IComboBoxOption, IComboBox, IDropdownOption } from 'office-ui-fabric-react';
interface CustomComboBoxProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  errorMessage?: string;
  dirty?: boolean;
  value: string;
  setOptions?: React.Dispatch<React.SetStateAction<IDropdownOption[]>>;
  onChange: (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => void;
  learnMoreLink?: string;
}

const ComboBox = (props: FieldProps & IComboBoxProps & CustomComboBoxProps) => {
  const { field, form, options, styles, setOptions, allowFreeform, ...rest } = props;
  const theme = useContext(ThemeContext);
  const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void => {
    if (!!allowFreeform && !option && value) {
      // If allowFreeform is true, the newly selected option might be something the user typed that
      // doesn't exist in the options list yet. So there's extra work to manually add it.
      option = { key: value, text: value };
      setOptions && setOptions(prevOptions => [...prevOptions, option!]);
    }

    if (option) {
      form.setFieldValue(field.name, option.key);
    } else {
      form.setFieldValue(field.name, '');
    }
  };
  const errorMessage = get(form.errors, field.name, '') as string;
  return (
    <ComboBoxNoFormik
      selectedKey={field.value === undefined ? 'null' : field.value}
      ariaLabel={props.label}
      options={options}
      onChange={onChange}
      onBlur={field.onBlur}
      errorMessage={errorMessage}
      styles={ComboBoxStyles(theme)}
      allowFreeform={allowFreeform}
      {...rest}
    />
  );
};

export default ComboBox;
