import { ITheme } from 'office-ui-fabric-react/lib/Styling';
import { Depths } from './AzureDepths';
import { IComboBoxStyles } from 'office-ui-fabric-react/lib/ComboBox';
import * as StyleConstants from './Constants';

const DROPDOWN_ITEMHEIGHT = 23;

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
          '.ms-Button-icon': {
            height: StyleConstants.inputControlHeightInner,
          },
        },
      },
    ],
    input: {
      height: StyleConstants.inputControlHeightInner,
      selectors: {
        '::placeholder': {
          fontStyle: 'normal',
        },
        '::-ms-input-placeholder': {
          fontStyle: 'normal',
        },
      },
    },
    rootDisabled: {
      selectors: {
        '.ms-Button': {
          backgroundColor: semanticColors.disabledBackground,
          color: semanticColors.inputText,
        },
        '.ms-Button:hover': {
          backgroundColor: semanticColors.disabledBackground,
          color: semanticColors.inputText,
        },
      },
    },
    rootFocused: {
      borderColor: semanticColors.focusBorder,
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
      ...fonts.small,
      color: semanticColors.errorText,
    },
    optionsContainer: {
      verticalAlign: 'middle',
      selectors: {
        '.ms-ComboBox-header': {
          ...fonts.medium,
          color: semanticColors.focusBorder,
        },
        '.ms-ComboBox-option': {
          ...fonts.medium,
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
          color: semanticColors.bodyText,
          cursor: 'pointer',
          display: 'block',
          padding: `0 ${DROPDOWN_ITEMHEIGHT}px 0 12px`,
          width: '100%',
          minHeight: DROPDOWN_ITEMHEIGHT,
          lineHeight: DROPDOWN_ITEMHEIGHT - 2,
          height: 'auto',
          position: 'relative',
          border: '1px solid transparent',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          textAlign: 'left',
          textOverflow: 'ellipsis',
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
