import { IPalette } from '@fluentui/react';

import {
  AzurePortalColors as LightThemePortalColors,
  semanticColors as lightThemeSemanticColors,
  themePalette as lightThemePalette,
} from './light';
import { ThemeExtended } from './SemanticColorsExtended';

export const AzurePortalColors = {
  ...LightThemePortalColors,
  placeholderText: '#800000',
  disabledText: '#800000',
  hyperlinkText: '#0000cd',
  hyperlinkHoverText: '#0000cd',
  buttonPrimary: '#800080',
  buttonRest: '#000000',
  buttonHovered: '#800080',
  buttonPressed: '#800080',
  buttonDisabled: '#800000',
  textControlOutlineHovered: '#800080',
  standardControlOutlineAccent: '#800080',
  inputChecked: '#0078d4',
};

const themePalette: IPalette = {
  ...lightThemePalette,
  themePrimary: '#000000',
  white: '#ffffff',
};

const semanticColors = {
  ...lightThemeSemanticColors,
  disabledBodyText: AzurePortalColors.disabledText,
  disabledSubtext: AzurePortalColors.disabledText,

  focusBorder: AzurePortalColors.standardControlOutlineAccent,
  inputBorderHovered: AzurePortalColors.textControlOutlineHovered,
  inputBackgroundChecked: AzurePortalColors.inputChecked,
  inputBackgroundCheckedHovered: AzurePortalColors.buttonHovered,
  inputFocusBorderAlt: AzurePortalColors.standardControlOutlineAccent,
  inputPlaceholderText: AzurePortalColors.placeholderText,
  inputPlaceholderBackgroundChecked: AzurePortalColors.buttonPressed,
  inputIconDisabled: AzurePortalColors.buttonDisabled,
  inputIconHovered: AzurePortalColors.buttonHovered,
  inputIcon: themePalette.themePrimary,

  buttonBackgroundChecked: AzurePortalColors.buttonPressed,
  buttonBackgroundHovered: AzurePortalColors.buttonHovered,
  buttonBackgroundCheckedHovered: AzurePortalColors.buttonHovered,
  buttonBackgroundPressed: AzurePortalColors.buttonPressed,
  buttonBackgroundDisabled: themePalette.white,
  buttonBorder: AzurePortalColors.buttonRest,
  buttonBorderFocused: AzurePortalColors.buttonHovered,
  buttonText: AzurePortalColors.buttonRest,
  buttonTextDisabled: AzurePortalColors.disabledText,

  primaryButtonBackground: AzurePortalColors.buttonPrimary,
  primaryButtonBackgroundHovered: AzurePortalColors.buttonHovered,
  primaryButtonBackgroundPressed: AzurePortalColors.buttonPressed,
  primaryButtonBackgroundDisabled: themePalette.white,
  primaryButtonBorderDisabled: AzurePortalColors.disabledText,
  primaryButtonTextDisabled: AzurePortalColors.disabledText,

  menuIcon: themePalette.themePrimary,
  menuHeader: themePalette.themePrimary,
  actionLink: themePalette.themePrimary,
  actionLinkHovered: themePalette.themePrimary,
  link: AzurePortalColors.hyperlinkText,
  linkHovered: AzurePortalColors.hyperlinkHoverText,
  messageLink: AzurePortalColors.hyperlinkText,
  messageLinkHovered: AzurePortalColors.hyperlinkHoverText,
  disabledBodySubtext: AzurePortalColors.disabledText,
  inputTextHovered: AzurePortalColors.textControlOutlineHovered,
  ...AzurePortalColors,
};

export const whiteHighContrast: Partial<ThemeExtended> = {
  semanticColors,
  palette: themePalette,
  fonts: {
    tiny: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '10px',
      fontWeight: 600,
    },
    xSmall: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '11px',
      fontWeight: 400,
    },
    small: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '12px',
      fontWeight: 400,
    },
    smallPlus: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '13px',
      fontWeight: 400,
    },
    medium: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '14px',
      fontWeight: 400,
    },
    mediumPlus: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '15px',
      fontWeight: 400,
    },
    large: {
      fontFamily: "'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '17px',
      fontWeight: 300,
    },
    xLarge: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '21px',
      fontWeight: 100,
    },
    xLargePlus: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '21px',
      fontWeight: 100,
    },
    xxLarge: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '28px',
      fontWeight: 100,
    },
    xxLargePlus: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '28px',
      fontWeight: 100,
    },
    superLarge: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '42px',
      fontWeight: 100,
    },
    mega: {
      fontFamily:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      MozOsxFontSmoothing: 'grayscale',
      WebkitFontSmoothing: 'antialiased',
      fontSize: '72px',
      fontWeight: 100,
    },
  },
  isInverted: false,
  disableGlobalClassNames: false,
};
