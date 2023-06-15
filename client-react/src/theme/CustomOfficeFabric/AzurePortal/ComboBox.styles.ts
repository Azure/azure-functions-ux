import { IComboBoxStyles, ITheme } from '@fluentui/react';

import { Depths } from './AzureDepths';
import * as StyleConstants from './Constants';

export const ComboBoxStyles = (theme: ITheme): Partial<IComboBoxStyles> => {
  const { semanticColors, fonts } = theme;

  return {
    root: [
      {
        ...fonts.medium,
        height: StyleConstants.inputControlHeight,
        selectors: {
          '.ms-Button': {
            backgroundColor: semanticColors.bodyBackground,
            color: semanticColors.inputText,
          },
          '.ms-Button:hover': {
            backgroundColor: semanticColors.bodyBackground,
            color: semanticColors.inputText,
          },
          '&.is-open': {
            borderColor: semanticColors.focusBorder,
          },
        },
      },
    ],
    input: {
      height: StyleConstants.inputControlHeightInner,
      selectors: {
        '::placeholder': {
          fontStyle: 'italic',
        },
        '::-ms-input-placeholder': {
          fontStyle: 'italic',
        },
      },
    },
    rootDisabled: {
      color: semanticColors.inputText,
      backgroundColor: semanticColors.disabledBackground,
      cursor: 'default',
    },
    rootFocused: {
      borderColor: semanticColors.focusBorder,
    },
    inputDisabled: {
      background: 'transparent',
    },
    rootError: {
      borderColor: semanticColors.errorText,
      borderWidth: StyleConstants.borderWidthError,
    },
    rootPressed: {
      borderColor: semanticColors.focusBorder,
    },
    callout: {
      border: 'none',
      boxShadow: Depths.depth8,
      selectors: {
        '.ms-Callout-main': {
          backgroundColor: semanticColors.inputBackground,
          borderColor: semanticColors.inputBorder,
          borderStyle: StyleConstants.borderSolid,
          borderWidth: StyleConstants.borderWidth,
        },
      },
    },
    divider: {
      backgroundColor: semanticColors.inputBorder,
      border: 'none',
      height: '1px',
    },
    errorMessage: {
      ...fonts.medium,
      color: semanticColors.errorText,
    },
    optionsContainer: {
      verticalAlign: 'middle',
      selectors: {
        '.ms-ComboBox-header': {
          ...fonts.medium,
          fontWeight: StyleConstants.fontWeightBold,
          color: semanticColors.focusBorder,
        },
        '.ms-ComboBox-option': {
          ...fonts.medium,
          color: semanticColors.bodyText,
          selectors: {
            ':hover': {
              backgroundColor: semanticColors.menuItemBackgroundHovered,
              border: '1px solid transparent',
              color: semanticColors.bodyText,
            },
          },
        },
        '.is-checked': {
          backgroundColor: semanticColors.listItemBackgroundChecked,
        },
        '.is-disabled': {
          color: semanticColors.disabledBodyText,
        },
      },
    },
  };
};
