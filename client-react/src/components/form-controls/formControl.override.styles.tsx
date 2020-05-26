import { DropDownStyles } from '../../theme/CustomOfficeFabric/AzurePortal/Dropdown.styles';
import { IDropdownStyles, ITextFieldStyles } from 'office-ui-fabric-react';
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

export const copyButtonStyle = {
  root: {
    fontSize: '15px',
  },
};

export const learnMoreLinkStyle = style({ minWidth: '70px' });

export const addEditFormStyle = style({ paddingBottom: '60px' });

export const formStackStyle = (upsellIcon: boolean, fullpage: boolean) =>
  style({
    width: upsellIcon && fullpage ? '220px' : '200px',
  });

export const formLabelStyle = (upsellIcon: boolean, fullpage: boolean) =>
  style({
    width: upsellIcon && fullpage ? '220px' : '200px',
    paddingRight: '5px',
  });

export const detailListHeaderStyle = style({
  fontWeight: 'bolder',
  fontSize: '13px',
});

export const filterTextFieldStyle = { root: { marginTop: '5px', height: '25px', width: '300px' } };

export const additionalControlsStyle = style({
  marginLeft: '5px',
});
