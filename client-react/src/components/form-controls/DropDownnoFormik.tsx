import { Dropdown as OfficeDropdown, IDropdownOption, IDropdownProps } from '@fluentui/react';
import { useContext } from 'react';
import { useWindowSize } from 'react-use';
import { ThemeContext } from '../../ThemeContext';
import { LoadingDropdownSpinnerStyle } from './DropDown';
import { dropdownStyleOverrides } from './formControl.override.styles';
import ReactiveFormControl, { Layout } from './ReactiveFormControl';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { useTranslation } from 'react-i18next';

interface CustomDropdownProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label?: string;
  errorMessage?: string;
  dirty?: boolean;
  onChange: (e: unknown, option: IDropdownOption) => void;
  learnMoreLink?: string;
  widthOverride?: string;
  onPanel?: boolean;
  layout?: Layout;
  mouseOverToolTip?: string;
  customLabelClassName?: string;
  isLoading?: boolean;
}

const DropdownNoFormik = (props: IDropdownProps & CustomDropdownProps) => {
  const { onChange, errorMessage, id, options, label, widthOverride, onPanel, required, isLoading, ...rest } = props;
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();
  const { t } = useTranslation();

  const fullpage = !onPanel && width > 1000;

  const loadingProps = isLoading
    ? {
        onRenderCaretDown: () => {
          return <Spinner className={LoadingDropdownSpinnerStyle} size={SpinnerSize.xSmall} ariaLive="assertive" />;
        },
        onRenderPlaceholder: () => {
          return <>{t('Loading')}</>;
        },
      }
    : {};

  return (
    <ReactiveFormControl {...props}>
      <OfficeDropdown
        aria-labelledby={`${id}-label`}
        ariaLabel={label}
        options={options}
        onChange={onChange}
        errorMessage={errorMessage}
        {...rest}
        {...loadingProps}
        styles={dropdownStyleOverrides(theme, fullpage, widthOverride)}
        required={false} // ReactiveFormControl will handle displaying required
        //NOTE(michinoy): even though we are handling the required display marker at
        //the field level, for a11y we need to have the aria-required tag set.
        aria-required={!!required}
      />
    </ReactiveFormControl>
  );
};

export default DropdownNoFormik;
