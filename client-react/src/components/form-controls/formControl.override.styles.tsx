import { DropDownStyles } from '../../theme/CustomOfficeFabric/AzurePortal/Dropdown.styles';
import { IDropdownStyles, ITextFieldStyles, ITooltipHostStyles } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { TextFieldStyles } from '../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';

const formDefaultWidth = '275px';
export const dropdownStyleOverrides = (theme: ThemeExtended, fullpage: boolean, widthOverride?: string) => styleProps => {
  const baseStyle = DropDownStyles({ ...styleProps, widthOverride });
  return {
    ...baseStyle,
    root: [
      ...baseStyle.root,
      {
        width: widthOverride || formDefaultWidth,
      },
    ],
    title: [...baseStyle.title],
    errorMessage: [
      ...baseStyle.errorMessage,
      fullpage && {
        paddingLeft: '200px',
      },
    ],
    dropdown: [
      ...baseStyle.dropdown,
      {
        width: widthOverride || formDefaultWidth,
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
      ...baseStyle.root,
      {
        width: widthOverride || formDefaultWidth,
      },
    ],
  } as IDropdownStyles;
};

export const textFieldStyleOverrides = (theme: ThemeExtended, fullpage: boolean, widthOverride?: string) => styleProps => {
  const baseStyle = TextFieldStyles(styleProps);
  return {
    ...baseStyle,
    root: {
      width: widthOverride || formDefaultWidth,
    },
    field: {
      width: widthOverride || formDefaultWidth,
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

export const formStackStyle = (upsellIcon: boolean, fullpage: boolean) =>
  style({
    minWidth: upsellIcon && fullpage ? '220px' : '200px',
  });

export const formLabelStyle = (upsellIcon: boolean, fullpage: boolean) =>
  style({
    minWidth: upsellIcon && fullpage ? '220px' : '200px',
    paddingRight: '5px',
  });

export const detailListHeaderStyle = style({
  fontWeight: 'bolder',
  fontSize: '13px',
});

export const filterTextFieldStyle = { root: { marginTop: '5px', height: '25px', width: '300px' } };

export const tooltipStyle: Partial<ITooltipHostStyles> = { root: { display: 'inline', float: 'left' } };

export const hostStyle = (multiline?: boolean) =>
  style({
    overflow: !multiline ? 'hidden' : 'visible',
    textOverflow: 'ellipsis',
    whiteSpace: !multiline ? 'nowrap' : 'normal',
    maxWidth: 250,
  });

export const stackControlStyle = () =>
  style({
    paddingTop: '5px',
    paddingBottom: '5px',
    width: '100%',
  });
