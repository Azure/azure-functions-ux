import { DropDownStyles } from '../../theme/CustomOfficeFabric/AzurePortal/Dropdown.styles';
import { IDropdownStyles, ITextFieldStyles } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { TextFieldStyles } from '../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { ComboBoxStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ComboBox.styles';

const formDefaultWidth = '275px';
export const dropdownStyleOverrides = (dirty: boolean, theme: ThemeExtended, fullpage: boolean, widthOverride?: string) => styleProps => {
  const baseStyle = DropDownStyles({ ...styleProps, widthOverride });
  return {
    ...baseStyle,
    root: [
      ...baseStyle.root,
      {
        width: widthOverride || formDefaultWidth,
      },
    ],
    title: [
      ...baseStyle.title,
      dirty && {
        borderColor: theme.semanticColors.controlDirtyOutline,
      },
    ],
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
      dirty && {
        selectors: {
          ['&:focus .ms-Dropdown-title']: [{ borderColor: theme.semanticColors.controlDirtyOutline }],
          ['&:hover .ms-Dropdown-title']: [{ borderColor: theme.semanticColors.controlDirtyOutline }],
        },
      },
    ],
  } as IDropdownStyles;
};

export const comboboxStyleOverrides = (dirty: boolean, theme: ThemeExtended, fullpage: boolean, widthOverride?: string) => {
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

export const textFieldStyleOverrides = (dirty: boolean, theme: ThemeExtended, fullpage: boolean, widthOverride?: string) => styleProps => {
  const baseStyle = TextFieldStyles(styleProps);
  return {
    ...baseStyle,
    root: {
      width: widthOverride || formDefaultWidth,
    },
  } as ITextFieldStyles;
};
export const controlContainerStyle = (upsellIcon: boolean, fullpage: boolean) =>
  style({ marginBottom: '15px', marginLeft: upsellIcon && fullpage ? '-20px' : undefined });

export const upsellIconStyle = style({ marginRight: '6px' });

export const labelStyle = (upsellIcon: boolean, fullpage: boolean) =>
  style({
    width: upsellIcon && fullpage ? '220px' : '200px',
  });

export const infoMessageStyle = (fullpage: boolean) =>
  style({
    paddingLeft: fullpage ? '10px' : 0,
    paddingTop: fullpage ? 0 : '5px',
  });

export const infoIconStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.infoIcon,
    paddingRight: '5px',
  });

export const copyButtonStyle = (theme: ThemeExtended) =>
  style({
    paddingLeft: '5px',
  });

export const learnMoreLinkStyle = style({ minWidth: '70px' });
