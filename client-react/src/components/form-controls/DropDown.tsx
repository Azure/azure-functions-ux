import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { IDropdownOption, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import React from 'react';
import DropdownNoFormik from './DropDownnoFormik';
import { Layout } from './ReactiveFormControl';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { useTranslation } from 'react-i18next';

export interface CustomDropdownProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  learnMoreLink?: string;
  dirty?: boolean;
  onPanel?: boolean;
  layout?: Layout;
  mouseOverToolTip?: string;
  isLoading?: boolean;
}

export const LoadingDropdownSpinnerStyle = style({
  marginTop: '4px',
});

const Dropdown = (props: FieldProps & IDropdownProps & CustomDropdownProps) => {
  const { field, form, multiSelect, isLoading } = props;

  const { t } = useTranslation();

  const modeSpecificProps = multiSelect
    ? {
        selectedKeys: field.value,
        onChange: (_, option: IDropdownOption) => {
          const value = field.value as any[];

          if (option.selected) {
            form.setFieldValue(field.name, [...value, option.key]);
          } else {
            const idx = field.value.indexOf(option.key);

            if (idx !== -1) {
              form.setFieldValue(field.name, [...value.slice(0, idx), ...value.slice(idx + 1)]);
            }
          }
        },
        ...props,
      }
    : {
        selectedKey: field.value,
        onChange: (_, option: IDropdownOption) => {
          form.setFieldValue(field.name, option.key);
        },
        ...props,
      };

  const errorMessage = get(form.errors, field.name, '') as string;

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
    <DropdownNoFormik
      onBlur={field.onBlur}
      errorMessage={errorMessage}
      // Overriding default dropdown to panel transfer due to many of our dropdown existing in panels
      // https://github.com/OfficeDev/office-ui-fabric-react/commit/1aa8ab4e9e16ecc17d8e90c1374c0958eba77ee3#diff-406409baf14f369160f322b075e148d4
      responsiveMode={ResponsiveMode.large}
      disabled={isLoading || props.disabled}
      {...loadingProps}
      {...modeSpecificProps}
    />
  );
};

export default Dropdown;
