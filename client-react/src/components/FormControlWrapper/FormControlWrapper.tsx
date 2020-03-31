import React, { useContext, CSSProperties } from 'react';
import { Stack, TooltipHost, TooltipOverflowMode, ITooltipHostStyles } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { useWindowSize } from 'react-use';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';
import { InfoTooltip } from '../InfoTooltip/InfoTooltip';

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
  defaultLabelClassName?: string;
  multiline?: boolean;
}

const hostStyle = (multiline?: boolean) =>
  style({
    overflow: !multiline ? 'hidden' : 'visible',
    textOverflow: 'ellipsis',
    whiteSpace: !multiline ? 'nowrap' : 'normal',
    maxWidth: 250,
  });

const tooltipStyle: Partial<ITooltipHostStyles> = { root: { display: 'inline', float: 'left' } };

const labelStyle = (layout: Layout | undefined) => {
  const s = {
    marginBottom: '5px',
  };

  if (layout !== Layout.vertical) {
    s['width'] = '250px';
  }

  return style(s);
};

const requiredIcon = (theme: ThemeExtended) => {
  return style({
    fontWeight: 'bold',
    color: theme.palette.red,
  });
};

// It may make sense to have different preset sizes for small, medium, large configurations.
// I don't want to over-optimize for now so we can figure this out as new requirements come in.
const MaxHorizontalWidthPx = 750;

// We make a best effort to associate the "label" with the child input field by "id", however if the child
// element is not an "input" element, then the screen reader won't respect it and won't read the label first.
// In that case, you'll have to manually specify the "ariaLabel" property on the child element yourself
export const FormControlWrapper = (props: FormControlWrapperProps) => {
  const { label, children, layout, required, style, tooltip: toolTipContent, defaultLabelClassName, multiline } = props;
  const { width } = useWindowSize();
  const theme = useContext(ThemeContext);

  return (
    <Stack horizontal={layout !== Layout.vertical && width > MaxHorizontalWidthPx} style={style}>
      <label className={`${labelStyle(layout)} ${defaultLabelClassName || ''}`} htmlFor={children.props.id}>
        <TooltipHost overflowMode={TooltipOverflowMode.Self} content={label} hostClassName={hostStyle(multiline)} styles={tooltipStyle}>
          {label}
        </TooltipHost>
        {getRequiredIcon(theme, required)} {getToolTip(`${children.props.id}-tooltip`, toolTipContent)}
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

const getToolTip = (id: string, content?: string) => {
  if (content) {
    return <InfoTooltip id={id} content={content} />;
  }
};
