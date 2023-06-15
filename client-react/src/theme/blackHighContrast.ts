import { IPalette } from '@fluentui/react';

import {
  AzurePortalColors as DarkThemePortalColors,
  semanticColors as darkThemeSemanticColors,
  themePalette as darkThemePalette,
} from './dark';
import { ThemeExtended } from './SemanticColorsExtended';

export const AzurePortalColors = {
  ...DarkThemePortalColors,
  background: '#000000',
  placeholderText: '#00ff00',
  labelText: '#ffffff',
  disabledText: '#00ff00',
  hyperlinkText: '#ffff00',
  hyperlinkHoverText: '#ffff00',
  buttonPrimary: '00ffff',
  buttonRest: '#4894fe',
  buttonHovered: '#00ffff',
  buttonPressed: '#000000',
  primaryButtonPressed: '#1dd1d1',
  buttonDisabled: '#00ff00',
  textControlOutlineRest: '#ffffff',
  textControlOutlineHovered: '#00ffff',
  standardControlOutlineRest: '#ffffff',
  standardControlOutlineAccent: '#00ffff',
};

const themePalette: IPalette = {
  ...darkThemePalette,
  themePrimary: '#ffffff',
  black: '#000000',
  white: AzurePortalColors.background,
};

export const semanticColors = {
  ...darkThemeSemanticColors,
  bodyBackground: AzurePortalColors.background,
  bodyBackgroundHovered: AzurePortalColors.background,
  bodyBackgroundChecked: AzurePortalColors.background,
  bodyFrameBackground: AzurePortalColors.background,

  disabledBackground: AzurePortalColors.background,
  disabledBodyText: AzurePortalColors.disabledText,
  disabledSubtext: AzurePortalColors.disabledText,

  focusBorder: AzurePortalColors.standardControlOutlineAccent,
  variantBorder: AzurePortalColors.standardControlOutlineAccent,
  smallInputBorder: AzurePortalColors.standardControlOutlineRest,

  inputBorder: AzurePortalColors.textControlOutlineRest,
  inputBorderHovered: AzurePortalColors.textControlOutlineHovered,
  inputBackground: AzurePortalColors.background,
  inputBackgroundChecked: AzurePortalColors.buttonRest,
  inputBackgroundCheckedHovered: AzurePortalColors.buttonHovered,
  inputForegroundChecked: AzurePortalColors.background,
  inputFocusBorderAlt: AzurePortalColors.standardControlOutlineAccent,
  inputPlaceholderText: AzurePortalColors.placeholderText,
  inputPlaceholderBackgroundChecked: AzurePortalColors.buttonPressed,
  inputIconDisabled: AzurePortalColors.buttonDisabled,
  inputIconHovered: themePalette.neutralPrimary,
  inputIcon: themePalette.themePrimary,

  buttonBackground: AzurePortalColors.background,
  buttonBackgroundChecked: AzurePortalColors.buttonPressed,
  buttonBackgroundHovered: AzurePortalColors.buttonHovered,
  buttonBackgroundCheckedHovered: AzurePortalColors.buttonHovered,
  buttonBackgroundPressed: AzurePortalColors.buttonPressed,
  buttonBackgroundDisabled: AzurePortalColors.buttonDisabled,
  buttonBorderFocused: AzurePortalColors.buttonRest,
  buttonOutlineFocused: themePalette.blueLight,
  buttonText: AzurePortalColors.textColor,
  buttonTextHovered: AzurePortalColors.background,
  buttonTextChecked: AzurePortalColors.textColor,
  buttonTextCheckedHovered: AzurePortalColors.background,
  buttonTextPressed: AzurePortalColors.textColor,
  buttonTextDisabled: AzurePortalColors.background,
  buttonBorder: AzurePortalColors.textColor,
  buttonBorderDisabled: 'transparent',

  primaryButtonBackground: AzurePortalColors.buttonHovered,
  primaryButtonBackgroundHovered: AzurePortalColors.buttonHovered,
  primaryButtonBackgroundPressed: AzurePortalColors.primaryButtonPressed,
  primaryButtonBackgroundDisabled: AzurePortalColors.background,
  primaryButtonText: AzurePortalColors.background,
  primaryButtonTextHovered: AzurePortalColors.background,
  primaryButtonTextPressed: AzurePortalColors.background,
  primaryButtonTextDisabled: AzurePortalColors.buttonDisabled,
  primaryButtonBorderDisabled: AzurePortalColors.buttonDisabled,
  primaryButtonBorder: AzurePortalColors.textColor,

  menuBackground: AzurePortalColors.background,
  menuIcon: themePalette.themePrimary,
  menuHeader: themePalette.themePrimary,
  listBackground: AzurePortalColors.background,
  actionLink: themePalette.themePrimary,
  actionLinkHovered: themePalette.themePrimary,
  link: AzurePortalColors.hyperlinkText,
  linkHovered: AzurePortalColors.hyperlinkHoverText,
  messageLink: AzurePortalColors.hyperlinkText,
  messageLinkHovered: AzurePortalColors.hyperlinkHoverText,
  accentButtonBackground: AzurePortalColors.buttonRest,
  disabledBodySubtext: AzurePortalColors.disabledText,
  inputTextHovered: AzurePortalColors.textControlOutlineHovered,
  menuItemBackgroundChecked: AzurePortalColors.background,
  ...AzurePortalColors,
};

export const blackHighContrast: Partial<ThemeExtended> = {
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
  semanticColors,
  isInverted: false,
  disableGlobalClassNames: false,
};
