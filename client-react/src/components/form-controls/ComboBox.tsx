import * as React from 'react';
import { ComboBox as OfficeComboBox, IComboBoxProps, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { connect } from 'react-redux';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
interface CustomComboBoxProps {
  fullpage?: boolean;
  id: string;
  subLabel?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}
interface CustomComboBoxStateProps {
  theme: ThemeExtended;
}

const ComboBox = (props: FieldProps & IComboBoxProps & CustomComboBoxProps & CustomComboBoxStateProps) => {
  const { field, form, options, learnMore, subLabel, fullpage, theme, ...rest } = props;
  //const dirty = get(form.initialValues, field.name, null) !== field.value;

  const onChange = (e: unknown, option: IComboBoxOption) => {
    form.setFieldValue(field.name, option.key);
  };
  const errorMessage = get(form.errors, field.name, '') as string;
  return (
    <OfficeComboBox
      selectedKey={field.value === undefined ? 'null' : field.value}
      ariaLabel={props.label}
      options={options}
      onChange={onChange}
      onBlur={field.onBlur}
      errorMessage={errorMessage}
      {...rest}
      // styles={{
      //   title: dirty && {
      //     borderColor: theme.semanticColors.controlDirtyOutline,
      //   },
      //   label: [
      //     fullpage && {
      //       display: 'inline-block',
      //     },
      //   ],
      //   errorMessage: [
      //     fullpage && {
      //       paddingLeft: '200px',
      //     },
      //   ],
      //   dropdown: [
      //     fullpage && {
      //       display: 'inline-block',
      //     },
      //     dirty && {
      //       selectors: {
      //         ['&:focus .ms-ComboBox-title']: [{ borderColor: theme.semanticColors.controlDirtyOutline }],
      //         ['&:hover .ms-ComboBox-title']: [{ borderColor: theme.semanticColors.controlDirtyOutline }],
      //       },
      //     },
      //   ],
      //}}
    />
  );
};

const mapStateToProps = state => {
  return {
    theme: state.portalService && state.portalService.theme,
  };
};

export default connect(
  mapStateToProps,
  null
)(ComboBox);
