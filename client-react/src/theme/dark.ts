import { IPalette } from '@fluentui/react';
import { ThemeExtended } from './SemanticColorsExtended';
import { AzurePortalColors as LightThemePortalColors } from './light';

export const AzurePortalColors = {
  lineSeparator: 'rgba(107, 132, 156, 0.25)',
  sectionDividerScrollbar: 'rgba(107, 132, 156, 0.35)',
  background: '#111111',
  sectionBackground: 'rgba(107, 132, 156, 0.06)',
  itemBackgroundOnSelect: 'rgba(128, 128, 128, 0.25)',
  itemBackgroundOnHover: 'rgba(128, 128, 128, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  successText: LightThemePortalColors.successText, // No official dark color yet
  successBackground: '#1a3300',
  successIcon: '#5db300',
  errorText: LightThemePortalColors.errorText, // No official dark color yet
  errorBackground: '#61050c',
  errorIcon: '#e00b1c',
  warningBackground: '#b36200',
  warningIcon: '#ff8c00',
  infoBackground: '#012b65',
  infoIcon: '#bbb',
  monochromaticIcon: '#bbb',
  textColor: '#ffffff',
  placeholderText: '#afafaf',
  labelText: '#808080',
  disabledText: 'rgba(128, 128, 128, 0.7)',
  disabledControlBackground: 'rgba(128, 128, 128, 0.1)',
  hyperlinkText: '#4894fe',
  hyperlinkHoverText: '#6dbaf5',
  inlineSuccessText: '#5db300',
  inlineErrorText: '#f63747',
  buttonRest: '#4894fe',
  buttonHovered: '#6ca9fe',
  buttonPressed: '#257ffe',
  buttonDisabled: '#rgba(128, 128, 128, 0.1)',
  textControlOutlineRest: '#808080',
  textControlOutlineHovered: '#rgba(128, 128, 128, 0.7)',
  standardControlOutlineRest: '#808080',
  standardControlOutlineDisabled: '#rgba(128, 128, 128, 0.7)',
  standardControlOutlineHover: '#ffffff',
  standardControlOutlineAccent: '#4894fe',
  controlErrorStateOutline: '#f63747',
  controlDirtyOutline: '#c87fdc',
  cardBorderColor: '#b2b2b2',
  cardBackgroundColor: '#2b2b2b',
};

export const themePalette: IPalette = {
  themePrimary: '#4894fe',
  themeLighterAlt: '#03070a',
  themeLighter: '#0a1a27',
  themeLight: '#143249',
  themeTertiary: '#276391',
  themeSecondary: '#3a92d5',
  themeDarkAlt: '#54aef4',
  themeDark: '#6dbaf5',
  themeDarker: '#93ccf8',
  neutralLighterAlt: '#2d2d2d',
  neutralLighter: '#363636',
  neutralLight: '#434343',
  neutralQuaternaryAlt: '#4c4c4c',
  neutralQuaternary: '#535353',
  neutralTertiaryAlt: '#707070',
  neutralTertiary: '#c8c8c8',
  neutralSecondary: '#d0d0d0',
  neutralPrimaryAlt: '#dadada',
  neutralPrimary: '#ffffff',
  neutralDark: '#f4f4f4',
  black: '#111111',
  white: AzurePortalColors.background,
  blackTranslucent40: 'rgba(0,0,0,.4)',
  neutralSecondaryAlt: 'rgb(54, 54, 54)',
  accent: '#0078d4',
  whiteTranslucent40: 'rgba(255,255,255,.4)',
  yellowDark: '#d29200',
  yellow: '#ffb900',
  yellowLight: '#fff100',
  orange: '#d83b01',
  orangeLight: '#ea4300',
  orangeLighter: '#ff8c00',
  redDark: '#a80000',
  red: '#e81123',
  magentaDark: '#5c005c',
  magenta: '#b4009e',
  magentaLight: '#e3008c',
  purpleDark: '#32145a',
  purple: '#5c2d91',
  purpleLight: '#b4a0ff',
  blueDark: '#002050',
  blueMid: '#00188f',
  blue: '#0078d4',
  blueLight: '#00bcf2',
  tealDark: '#004b50',
  teal: '#008272',
  tealLight: '#00b294',
  greenDark: '#004b1c',
  green: '#107c10',
  greenLight: '#bad80a',
};

export const semanticColors = {
  bodyBackground: AzurePortalColors.background,
  bodyStandoutBackground: AzurePortalColors.sectionBackground,
  bodyBackgroundHovered: AzurePortalColors.background,
  bodyBackgroundChecked: AzurePortalColors.background,
  cardStandoutBackground: AzurePortalColors.cardBackgroundColor,
  severeWarningBackground: AzurePortalColors.warningBackground,
  bodyFrameBackground: AzurePortalColors.background,
  bodyFrameDivider: AzurePortalColors.sectionDividerScrollbar,
  bodyText: AzurePortalColors.textColor,
  bodyTextChecked: AzurePortalColors.textColor,
  bodySubtext: AzurePortalColors.textColor,
  bodyDivider: AzurePortalColors.sectionDividerScrollbar,

  disabledBackground: AzurePortalColors.buttonDisabled,
  disabledBodyText: AzurePortalColors.disabledText,
  disabledSubtext: AzurePortalColors.disabledText,

  focusBorder: AzurePortalColors.standardControlOutlineAccent,
  variantBorder: AzurePortalColors.standardControlOutlineAccent,
  variantBorderHovered: AzurePortalColors.standardControlOutlineHover,
  defaultStateBackground: AzurePortalColors.standardControlOutlineDisabled,
  disabledBorder: 'transparent',

  warningText: AzurePortalColors.textColor,
  warningHighlight: AzurePortalColors.warningIcon,
  blockingBackground: AzurePortalColors.errorBackground,
  cardShadow: AzurePortalColors.cardBackgroundColor,
  cardShadowHovered: AzurePortalColors.cardBackgroundColor,

  inputBorder: AzurePortalColors.textControlOutlineRest,
  inputBorderHovered: AzurePortalColors.textControlOutlineHovered,
  inputBackground: AzurePortalColors.background,
  inputBackgroundChecked: AzurePortalColors.buttonRest, // this is not used for backgrounds in fabric
  inputBackgroundCheckedHovered: AzurePortalColors.buttonHovered,
  inputForegroundChecked: AzurePortalColors.background,
  inputFocusBorderAlt: AzurePortalColors.standardControlOutlineAccent,
  smallInputBorder: AzurePortalColors.standardControlOutlineRest,
  inputPlaceholderText: AzurePortalColors.placeholderText,
  inputPlaceholderBackgroundChecked: AzurePortalColors.buttonPressed,
  inputIconDisabled: AzurePortalColors.buttonDisabled,
  inputIconHovered: AzurePortalColors.buttonHovered,
  inputIcon: AzurePortalColors.hyperlinkText,

  buttonBackground: AzurePortalColors.background,
  buttonBackgroundChecked: AzurePortalColors.buttonPressed,
  buttonBackgroundHovered: AzurePortalColors.buttonHovered,
  buttonBackgroundCheckedHovered: AzurePortalColors.background,
  buttonBackgroundPressed: AzurePortalColors.buttonPressed,
  buttonBackgroundDisabled: AzurePortalColors.buttonDisabled,
  buttonBorder: AzurePortalColors.buttonRest,
  buttonBorderFocused: AzurePortalColors.buttonRest,
  buttonOutlineFocused: themePalette.blueLight,
  buttonText: AzurePortalColors.buttonRest,
  buttonTextHovered: AzurePortalColors.background,
  buttonTextChecked: AzurePortalColors.background,
  buttonTextCheckedHovered: AzurePortalColors.background,
  buttonTextPressed: AzurePortalColors.background,
  buttonTextDisabled: AzurePortalColors.background,
  buttonBorderDisabled: 'transparent',

  primaryButtonBackground: AzurePortalColors.buttonRest,
  primaryButtonBackgroundHovered: AzurePortalColors.buttonHovered,
  primaryButtonBackgroundPressed: AzurePortalColors.buttonPressed,
  primaryButtonBackgroundDisabled: AzurePortalColors.buttonDisabled,
  primaryButtonBorder: 'transparent',
  primaryButtonBorderFocused: AzurePortalColors.background,

  primaryButtonText: AzurePortalColors.background,
  primaryButtonTextHovered: AzurePortalColors.background,
  primaryButtonTextPressed: AzurePortalColors.background,
  primaryButtonTextDisabled: AzurePortalColors.background,

  menuBackground: AzurePortalColors.background,
  menuDivider: AzurePortalColors.sectionDividerScrollbar,
  menuIcon: themePalette.themePrimary,
  menuHeader: themePalette.themePrimary,
  menuItemBackgroundHovered: AzurePortalColors.itemBackgroundOnHover,
  menuItemBackgroundPressed: AzurePortalColors.itemBackgroundOnSelect,
  menuItemText: AzurePortalColors.textColor,
  menuItemTextHovered: AzurePortalColors.textColor,

  listBackground: AzurePortalColors.background,
  listText: AzurePortalColors.textColor,
  listItemBackgroundHovered: AzurePortalColors.itemBackgroundOnHover,
  listItemBackgroundChecked: AzurePortalColors.itemBackgroundOnSelect,
  listItemBackgroundCheckedHovered: AzurePortalColors.itemBackgroundOnHover,

  listHeaderBackgroundHovered: AzurePortalColors.itemBackgroundOnHover,
  listHeaderBackgroundPressed: AzurePortalColors.itemBackgroundOnSelect,

  actionLink: AzurePortalColors.hyperlinkText,
  actionLinkHovered: AzurePortalColors.hyperlinkText,
  link: AzurePortalColors.hyperlinkText,
  linkHovered: AzurePortalColors.hyperlinkText,
  messageLink: AzurePortalColors.hyperlinkText,
  messageLinkHovered: AzurePortalColors.hyperlinkHoverText,
  messageText: AzurePortalColors.textColor,

  // Deprecated slots, second pass by _fixDeprecatedSlots() later for self-referential slots
  listTextColor: '',
  accentButtonBackground: AzurePortalColors.buttonRest,
  disabledBodySubtext: AzurePortalColors.disabledText,
  inputText: AzurePortalColors.textColor,
  inputTextHovered: AzurePortalColors.textControlOutlineHovered,
  accentButtonText: AzurePortalColors.textColor,
  menuItemBackgroundChecked: AzurePortalColors.background,
  blockingIcon: AzurePortalColors.warningIcon,
  severeWarningIcon: AzurePortalColors.warningIcon,
  ...AzurePortalColors,
};

export const darkTheme: Partial<ThemeExtended> = {
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
