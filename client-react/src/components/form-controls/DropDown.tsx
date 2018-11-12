import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { style } from 'typestyle';
import { FieldProps } from 'formik';

interface CustomDropdownProps {
  width: string;
  subLabel?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}
const containerStyle = width =>
  style({
    width,
    display: 'block',
    paddingBottom: '15px',
    minHeight: '23px',
    fontWeight: 400,
  });
const Dropdown = (props: FieldProps & IDropdownProps & CustomDropdownProps) => {
  const { field, form, label, width, options, learnMore, subLabel, ...rest } = props;
  const onChange = (e: unknown, option: IDropdownOption) => {
    form.setFieldValue(field.name, option.key);
  };
  return (
    <div className={containerStyle(width || '530px')}>
      <Label required={true} id={`${rest.id}-label`} htmlFor={rest.id}>
        {label}
      </Label>
      {subLabel && (
        <Label
          id={`${rest.id}-sublabel`}
          required={false}
          style={{ color: '#595959', fontSize: '12px', marginTop: '1px', paddingTop: '0px' }}>
          {subLabel}
          {learnMore && (
            <Link href={learnMore.learnMoreLink} target="_blank">
              {learnMore.learnMoreText}
            </Link>
          )}
        </Label>
      )}
      <OfficeDropdown
        selectedKey={field.value === undefined ? 'null' : field.value}
        ariaLabel={label}
        options={options}
        onChange={onChange}
        onBlur={field.onBlur}
        errorMessage={form.errors[field.name] as string}
        {...rest}
      />
    </div>
  );
};

export default Dropdown;
