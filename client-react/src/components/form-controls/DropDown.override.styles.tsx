import { DropDownStyles } from '../../theme/CustomOfficeFabric/AzurePortal/Dropdown.styles';
import { IDropdownStyles } from 'office-ui-fabric-react';
import { style } from 'typestyle';

export const styleOverride = (dirty, theme, fullpage) => styleProps => {
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

export const dropdownContainerStyle = (upsellIcon: boolean) =>
  style({ marginBottom: '15px', marginLeft: upsellIcon ? '-20px' : undefined });
