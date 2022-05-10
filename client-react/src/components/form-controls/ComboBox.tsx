import { css, IComboBox, IComboBoxOption, IComboBoxProps, IDropdownOption, Spinner, SpinnerSize } from '@fluentui/react';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { useContext, useEffect, useState } from 'react';
import { comboBoxSpinnerStyle, loadingComboBoxStyle } from '../../pages/app/deployment-center/DeploymentCenter.styles';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';
import { ThemeContext } from '../../ThemeContext';
import ComboBoxNoFormik from './ComboBoxnoFormik';

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
  overrideLoadingComboboxStyles?: string;
}

const ComboBox = (props: FieldProps & IComboBoxProps & CustomComboBoxProps) => {
  const {
    allowFreeform,
    clearComboBox,
    field,
    form,
    isLoading,
    options,
    overrideLoadingComboboxStyles,
    searchable,
    setOptions,
    styles,
    text,
    ...rest
  } = props;
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

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [options]);

  const errorMessage = get(form.touched, field.name, false) ? (get(form.errors, field.name, '') as string) : undefined;

  return (
    <div className={css(loadingComboBoxStyle, overrideLoadingComboboxStyles)}>
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
