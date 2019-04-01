import React, { useContext } from 'react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';
import { ThemeContext } from '../../ThemeContext';
import ComboBoxNoFormik from './ComboBoxnoFormik';
import { IComboBoxProps, IComboBoxOption } from 'office-ui-fabric-react';
interface CustomComboBoxProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  errorMessage?: string;
  dirty?: boolean;
  value: string;
  onChange: (e: unknown, option: IComboBoxOption) => void;
  learnMoreLink?: string;
}

const ComboBox = (props: FieldProps & IComboBoxProps & CustomComboBoxProps) => {
  const { field, form, options, styles, ...rest } = props;

  const theme = useContext(ThemeContext);
  const onChange = (e: unknown, option: IComboBoxOption) => {
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
      {...rest}
    />
  );
};

export default ComboBox;
