import * as React from 'react';
import { Toggle as OfficeToggle, IToggleProps } from 'office-ui-fabric-react/lib/Toggle';
import { FieldProps } from 'formik';
import { connect } from 'react-redux';
import { ThemeExtended } from 'src/theme/SemanticColorsExtended';

interface IToggleStateProps {
  theme: ThemeExtended;
}
const Toggle = (props: FieldProps & IToggleProps & IToggleStateProps) => {
  const { field, form, theme, ...rest } = props;
  const onChange = (e: any, newValue: boolean) => {
    form.setFieldValue(field.name, newValue);
    field.onChange(e);
  };

  const checked = field.value;

  return (
    <OfficeToggle
      styles={{
        thumb: {
          backgroundColor: checked ? theme.semanticColors.buttonBackground : theme.semanticColors.primaryButtonBackground,
        },
      }}
      checked={checked}
      tabIndex={0}
      onChange={onChange}
      onBlur={field.onBlur}
      ariaLabel={rest.label}
      {...rest}
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
)(Toggle);
