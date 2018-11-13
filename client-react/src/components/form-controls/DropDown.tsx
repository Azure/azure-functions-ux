import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { style } from 'typestyle';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { Shimmer } from 'office-ui-fabric-react/lib/components/Shimmer';
import { connect } from 'react-redux';
import { ThemeExtended } from 'src/theme/SemanticColorsExtended';
interface CustomDropdownProps {
  width: string;
  id: string;
  subLabel?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}
interface CustomDropdownStateProps {
  theme: ThemeExtended;
}
const containerStyle = width =>
  style({
    width,
    display: 'block',
    paddingBottom: '15px',
    minHeight: '23px',
    fontWeight: 400,
  });

const Dropdown = (props: FieldProps & IDropdownProps & CustomDropdownProps & CustomDropdownStateProps) => {
  const { field, form, label, width, options, learnMore, subLabel, theme, ...rest } = props;
  const dirty = get(form.initialValues, field.name, null) !== field.value;

  const onChange = (e: unknown, option: IDropdownOption) => {
    form.setFieldValue(field.name, option.key);
  };
  return (
    <div className={containerStyle(width || '530px')}>
      <Label required={true} id={`${rest.id}-label`} htmlFor={rest.id}>
        {label}
      </Label>
      {subLabel && (
        <Label id={`${rest.id}-sublabel`} required={false} style={{ fontSize: '12px', marginTop: '1px', paddingTop: '0px' }}>
          {subLabel}
          {learnMore && (
            <Link href={learnMore.learnMoreLink} target="_blank">
              {learnMore.learnMoreText}
            </Link>
          )}
        </Label>
      )}

      <Shimmer isDataLoaded={options.length > 0} ariaLabel={'Loading content'}>
        <OfficeDropdown
          selectedKey={field.value === undefined ? 'null' : field.value}
          ariaLabel={label}
          options={options}
          onChange={onChange}
          onBlur={field.onBlur}
          errorMessage={form.errors[field.name] as string}
          {...rest}
          styles={{
            title: dirty && {
              borderColor: theme.semanticColors.dirty,
            },
            dropdown: dirty && {
              selectors: {
                ['&:focus .ms-Dropdown-title']: [{ borderColor: theme.semanticColors.dirty }],
                ['&:hover .ms-Dropdown-title']: [{ borderColor: theme.semanticColors.dirty }],
              },
            },
          }}
        />
      </Shimmer>
    </div>
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
)(Dropdown);
