import { ThemeExtended } from './SemanticColorsExtended';

const themePalette = {
  themePrimary: '#41a5f1',
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
  white: '#242424',
  blackTranslucent40: 'rgba(0,0,0,.4)',
  neutralSecondaryAlt: '#767676',
  accent: '#0078d4',
  whiteTranslucent40: 'rgba(255,255,255,.4)',
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

const semanticColors = {
  bodyBackground: themePalette.black,
  bodyStandoutBackground: themePalette.neutralLighterAlt,
  bodyFrameBackground: themePalette.white,
  bodyFrameDivider: themePalette.neutralLight,
  bodyText: themePalette.neutralPrimary,
  bodyTextChecked: themePalette.black,
  bodySubtext: themePalette.neutralSecondary,
  bodyDivider: themePalette.neutralLight,

  disabledBackground: themePalette.neutralLighter,
  disabledText: themePalette.neutralTertiary,
  disabledBodyText: themePalette.neutralTertiaryAlt,
  disabledSubtext: themePalette.neutralQuaternary,

  focusBorder: themePalette.neutralSecondary,
  variantBorder: themePalette.neutralLight,
  variantBorderHovered: themePalette.neutralTertiary,
  defaultStateBackground: themePalette.neutralLight,

  errorText: themePalette.redDark,
  warningText: '#ffffff',
  errorBackground: 'rgba(232, 17, 35, .5)',
  blockingBackground: 'rgba(234, 67, 0, .5)',
  warningBackground: 'rgba(255, 251, 0, .6)',
  warningHighlight: '#fff100',
  successBackground: 'rgba(186, 216, 10, .4)',

  inputBorder: themePalette.neutralTertiary,
  inputBorderHovered: themePalette.neutralDark,
  inputBackground: themePalette.white,
  inputBackgroundChecked: themePalette.themePrimary,
  inputBackgroundCheckedHovered: themePalette.themeDarkAlt,
  inputForegroundChecked: themePalette.white,
  inputFocusBorderAlt: themePalette.themePrimary,
  smallInputBorder: themePalette.neutralSecondary,
  inputPlaceholderText: themePalette.neutralSecondary,

  buttonBackground: themePalette.neutralLighter,
  buttonBackgroundChecked: themePalette.neutralTertiaryAlt,
  buttonBackgroundHovered: themePalette.neutralLight,
  buttonBackgroundCheckedHovered: themePalette.neutralLight,
  buttonBackgroundPressed: themePalette.neutralLight,
  buttonBackgroundDisabled: themePalette.neutralLighter,
  buttonBorder: 'transparent',
  buttonText: themePalette.neutralPrimary,
  buttonTextHovered: themePalette.neutralDark,
  buttonTextChecked: themePalette.neutralDark,
  buttonTextCheckedHovered: themePalette.black,
  buttonTextPressed: themePalette.neutralDark,
  buttonTextDisabled: themePalette.neutralTertiary,
  buttonBorderDisabled: 'transparent',

  primaryButtonBackground: themePalette.themePrimary,
  primaryButtonBackgroundHovered: themePalette.themeDarkAlt,
  primaryButtonBackgroundPressed: themePalette.themeDark,
  primaryButtonBackgroundDisabled: themePalette.neutralLighter,
  primaryButtonBorder: 'transparent',

  primaryButtonText: themePalette.white,
  primaryButtonTextHovered: themePalette.white,
  primaryButtonTextPressed: themePalette.white,
  primaryButtonTextDisabled: themePalette.neutralQuaternary,

  menuBackground: themePalette.white,
  menuDivider: themePalette.neutralTertiaryAlt,
  menuIcon: themePalette.themePrimary,
  menuHeader: themePalette.themePrimary,
  menuItemBackgroundHovered: themePalette.neutralLighter,
  menuItemBackgroundPressed: themePalette.neutralLight,
  menuItemText: themePalette.neutralPrimary,
  menuItemTextHovered: themePalette.neutralDark,

  listBackground: themePalette.white,
  listText: themePalette.neutralPrimary,
  listItemBackgroundHovered: themePalette.neutralLighter,
  listItemBackgroundChecked: themePalette.neutralLight,
  listItemBackgroundCheckedHovered: themePalette.neutralQuaternaryAlt,

  listHeaderBackgroundHovered: themePalette.neutralLighter,
  listHeaderBackgroundPressed: themePalette.neutralLight,

  actionLink: themePalette.neutralPrimary,
  actionLinkHovered: themePalette.neutralDark,
  link: themePalette.themePrimary,
  linkHovered: themePalette.themeDarker,

  // Deprecated slots, second pass by _fixDeprecatedSlots() later for self-referential slots
  listTextColor: '',
  menuItemBackgroundChecked: themePalette.neutralLight,
  dirty: '#68217a',
};

const darkModeTheme: Partial<ThemeExtended> = {
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
    xxLarge: {
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
  // tslint:disable-next-line:object-shorthand-properties-first
  semanticColors,
  isInverted: false,
  disableGlobalClassNames: false,
  typography: {
    families: {
      default:
        "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      monospace: 'Menlo, Monaco, "Courier New", monospace',
    },
    sizes: {
      mini: '10px',
      xSmall: '11px',
      small: '12px',
      smallPlus: '13px',
      medium: '14px',
      mediumPlus: '15px',
      large: '17px',
      xLarge: '21px',
      xxLarge: '28px',
      mega: '72px',
    },
    weights: { default: 400, regular: 400, light: 100, semibold: 600, bold: 700 },
    variants: {
      default: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '14px',
        weight: 400,
      },
      caption: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '11px',
        weight: 400,
      },
      h1: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '72px',
        weight: 100,
      },
      h2: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '28px',
        weight: 100,
      },
      h3: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '21px',
        weight: 100,
      },
      h4: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '17px',
        weight: 100,
      },
      h5: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '15px',
        weight: 100,
      },
      link: {
        family:
          "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        size: '14px',
        weight: 400,
        color: 'link',
        hoverColor: 'linkHovered',
      },
    },
  },
};

export default darkModeTheme;
