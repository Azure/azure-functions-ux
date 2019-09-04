import React, { FC, useContext } from 'react';
import ReactiveFormControl from '../form-controls/ReactiveFormControl';
import { Label, Link, Icon } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { ThemeContext } from '../../ThemeContext';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

interface CustomInformationLabelProps {
  id: string;
  icon?: string;
  value: string;
  label: string;
  link?: string;
  type?: string;
}

const labelIconStyle = style({
  fontSize: '12px',
  marginRight: '4px',
});

const getLabelStyle = (type: string, theme: ThemeExtended) => {
  return type === 'success'
    ? style({ color: theme.semanticColors.inlineSuccessText })
    : style({ color: theme.semanticColors.inlineErrorText });
};

const InformationLabel: FC<CustomInformationLabelProps> = props => {
  const { value, id, link, icon, type } = props;
  const theme = useContext(ThemeContext);
  const labelStyle = type ? getLabelStyle(type, theme) : style({ color: theme.semanticColors.textColor });

  return (
    <ReactiveFormControl {...props}>
      {link ? (
        <Link id={`${id}-value-link`} href={link} aria-labelledby={`${id}-label`}>
          {value}
        </Link>
      ) : (
        <Label id={`${id}-value`} aria-labelledby={`${id}-label`} className={labelStyle}>
          {icon && <Icon iconName={icon} className={labelIconStyle} />}
          <span>{value}</span>
        </Label>
      )}
    </ReactiveFormControl>
  );
};
export default InformationLabel;
