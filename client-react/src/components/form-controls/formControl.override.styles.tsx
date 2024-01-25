import { IStyleBaseArray, IRawStyle } from '@fluentui/merge-styles';
import { IDropdownStyles, ITextFieldStyles, ITooltipHostStyles } from '@fluentui/react';
import { style } from 'typestyle';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';
import { DropDownStyles } from '../../theme/CustomOfficeFabric/AzurePortal/Dropdown.styles';
import { TextFieldStyles } from '../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const FORM_DEFAULT_WIDTH = '275px';
const FULL_PAGE_WIDTH = '220px';
const NOT_FULL_PAGE_WIDTH = '200px';

export const dropdownStyleOverrides = (theme: ThemeExtended, fullpage: boolean, widthOverride?: string) => styleProps => {
  const baseStyle = DropDownStyles({ ...styleProps, widthOverride });
  return {
    ...baseStyle,
    root: [
      ...baseStyle.root,
      {
        width: widthOverride || FORM_DEFAULT_WIDTH,
      },
    ],
    title: [...baseStyle.title],
    errorMessage: [...baseStyle.errorMessage],
    dropdown: [
      ...baseStyle.dropdown,
      {
        width: widthOverride || FORM_DEFAULT_WIDTH,
        maxWidth: widthOverride || baseStyle.dropdown[1].maxWidth,
      },
    ],
  } as IDropdownStyles;
};

export const comboboxStyleOverrides = (theme: ThemeExtended, fullpage: boolean, widthOverride?: string) => {
  const baseStyle = ComboBoxStyles(theme);
  return {
    ...baseStyle,
    root: [
      ...(baseStyle.root as IStyleBaseArray),
      {
        width: widthOverride || FORM_DEFAULT_WIDTH,
      },
    ],
    errorMessage: {
      ...(baseStyle.errorMessage as IRawStyle),
      width: widthOverride || FORM_DEFAULT_WIDTH,
    },
  } as IDropdownStyles;
};

export const textFieldPrefixStylesOverride = (hasPrefix: boolean) => {
  return hasPrefix
    ? {
        field: {
          paddingLeft: '0px',
        },
        prefix: {
          paddingRight: '0px',
        },
      }
    : undefined;
};

export const textFieldStyleOverrides = (theme?: ThemeExtended, fullPage?: boolean, widthOverride?: string) => styleProps => {
  const baseStyle = TextFieldStyles(styleProps);
  return {
    ...baseStyle,
    root: {
      width: widthOverride || FORM_DEFAULT_WIDTH,
    },
    field: {
      width: widthOverride || FORM_DEFAULT_WIDTH,
    },
    suffix: {
      paddingRight: '0px',
    },
  } as ITextFieldStyles;
};

export const controlContainerStyle = (upsellIcon: boolean, fullpage: boolean) =>
  style({ marginBottom: '15px', marginLeft: upsellIcon && fullpage ? '-20px' : undefined });

export const upsellIconStyle = style({ marginRight: '6px' });

export const infoMessageStyle = () =>
  style({
    paddingTop: '10px',
  });

export const copyButtonStyle = {
  root: {
    fontSize: '15px',
  },
};

export const learnMoreLinkStyle = style({ minWidth: '70px' });

export const addEditFormStyle = style({ paddingBottom: '60px' });

export const formStackStyle = (upsellIcon: boolean, fullpage: boolean, horizontal?: boolean) =>
  style({
    minWidth: upsellIcon && fullpage ? FULL_PAGE_WIDTH : NOT_FULL_PAGE_WIDTH,
    maxWidth: horizontal ? (upsellIcon && fullpage ? FULL_PAGE_WIDTH : NOT_FULL_PAGE_WIDTH) : '',
    paddingRight: '8px',
  });

export const formLabelStyle = (upsellIcon: boolean, fullpage: boolean, horizontal?: boolean, width?: string) =>
  style({
    minWidth: width ? width : upsellIcon && fullpage ? FULL_PAGE_WIDTH : NOT_FULL_PAGE_WIDTH,
    maxWidth: width ? width : horizontal ? (upsellIcon && fullpage ? FULL_PAGE_WIDTH : NOT_FULL_PAGE_WIDTH) : '',
    paddingRight: '5px',
  });

export const detailListHeaderStyle = style({
  fontWeight: 'bolder',
  fontSize: '13px',
});

export const filterTextFieldStyle = { root: { marginTop: '5px', height: '25px', width: '300px' } };

export const tooltipStyle: Partial<ITooltipHostStyles> = { root: { display: 'inline', float: 'left' } };

export const hostStyle = (multiline?: boolean, horizontal?: boolean) =>
  style({
    overflow: !multiline ? 'hidden' : 'visible',
    textOverflow: 'ellipsis',
    whiteSpace: !multiline ? 'nowrap' : 'normal',
    maxWidth: horizontal ? '85%' : '100%',
  });

export const stackControlStyle = () =>
  style({
    paddingTop: '5px',
    paddingBottom: '5px',
    width: '100%',
  });
