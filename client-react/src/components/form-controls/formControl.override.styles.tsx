import { DropDownStyles } from '../../theme/CustomOfficeFabric/AzurePortal/Dropdown.styles';
import { IDropdownStyles } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export const dropdownStyleOverrides = (dirty, theme, fullpage) => styleProps => {
  const baseStyle = DropDownStyles(styleProps);
  return {
    ...baseStyle,
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
        width: '275px',
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

export const learnMoreLinkStyle = style({ paddingLeft: '5px' });
