import React, { useContext, CSSProperties } from 'react';
import { Stack } from 'office-ui-fabric-react';
import { style as typeStyle, classes } from 'typestyle';
import { useWindowSize } from 'react-use';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';
import { InfoTooltip, defaultTooltipClass } from '../InfoTooltip/InfoTooltip';

export enum Layout {
  horizontal = 'horizontal',
  vertical = 'vertical',
}

export interface FormControlWrapperProps {
  children: JSX.Element;
  label: string;
  tooltip?: string;
  required?: boolean;
  layout?: Layout;
  style?: CSSProperties;
}

const labelStyle = typeStyle({
  width: '250px',
  marginBottom: '5px',
});

const requiredIcon = (theme: ThemeExtended) => {
  return typeStyle({
    color: theme.palette.red,
  });
};

const tooltipStyle = typeStyle({
  marginLeft: '5px',
});

// It may make sense to have different preset sizes for small, medium, large configurations.
// I don't want to over-optimize for now so we can figure this out as new requirements come in.
const MaxHorizontalWidthPx = 750;

// We make a best effort to associate the "label" with the child input field by "id", however if the child
// element is not an "input" element, then the screen reader won't respect it and won't read the label first.
// In that case, you'll have to manually specify the "ariaLabel" property on the child element yourself
export const FormControlWrapper = (props: FormControlWrapperProps) => {
  const { label, children, layout, required, style, tooltip } = props;
  const { width } = useWindowSize();
  const theme = useContext(ThemeContext);

  return (
    <Stack horizontal={layout !== Layout.vertical && width > MaxHorizontalWidthPx} style={style}>
      <label className={labelStyle} htmlFor={children.props.id}>
        {getRequiredIcon(theme, required)} {label} {getToolTip(tooltip)}
      </label>
      {children}
    </Stack>
  );
};

const getRequiredIcon = (theme: ThemeExtended, required?: boolean) => {
  if (required) {
    return <span className={requiredIcon(theme)}>*</span>;
  }
};

const getToolTip = (tooltip?: string) => {
  if (tooltip) {
    return <InfoTooltip className={classes(tooltipStyle, defaultTooltipClass)} content={tooltip} />;
  }
};
