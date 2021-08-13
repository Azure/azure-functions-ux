import { ISemanticColors, ITheme } from '@uifabric/styling';

export interface AzurePortalColors {
  lineSeparator: string;
  sectionDividerScrollbar: string;
  background: string;
  sectionBackground: string;
  itemBackgroundOnSelect: string;
  itemBackgroundOnHover: string;
  overlay: string;
  successText: string;
  successBackground: string;
  successIcon: string;
  errorText: string;
  errorBackground: string;
  errorIcon: string;
  warningBackground: string;
  warningIcon: string;
  infoBackground: string;
  infoIcon: string;
  monochromaticIcon: string;
  textColor: string;
  placeholderText: string;
  labelText: string;
  disabledText: string;
  hyperlinkText: string;
  hyperlinkHoverText: string;
  inlineSuccessText: string;
  inlineErrorText: string;
  buttonRest: string;
  buttonHovered: string;
  buttonPressed: string;
  buttonDisabled: string;
  textControlOutlineRest: string;
  textControlOutlineHovered: string;
  standardControlOutlineRest: string;
  standardControlOutlineDisabled: string;
  standardControlOutlineHover: string;
  standardControlOutlineAccent: string;
  controlErrorStateOutline: string;
  controlDirtyOutline: string;
  disabledControlBackground: string;
  cardBorderColor: string;
  cardBackgroundColor: string;
}

export interface SemanticColorsExtended extends ISemanticColors, AzurePortalColors {
  bodyBackground: string;
  bodyStandoutBackground: string;
  bodyFrameBackground: string;
  bodyFrameDivider: string;
  bodyText: string;
  bodyTextChecked: string;
  bodySubtext: string;
  bodyDivider: string;

  disabledBackground: string;
  disabledText: string;
  disabledBodyText: string;
  disabledSubtext: string;

  focusBorder: string;
  variantBorder: string;
  variantBorderHovered: string;
  defaultStateBackground: string;

  successText: string;
  successBackground: string;
  warningText: string;
  warningBackground: string;
  warningHighlight: string;
  errorText: string;
  errorBackground: string;
  blockingBackground: string;

  inputBorder: string;
  inputBorderHovered: string;
  inputBackground: string;
  inputBackgroundChecked: string;
  inputBackgroundCheckedHovered: string;
  inputForegroundChecked: string;
  inputFocusBorderAlt: string;
  smallInputBorder: string;
  inputPlaceholderText: string;

  buttonBackground: string;
  buttonBackgroundChecked: string;
  buttonBackgroundHovered: string;
  buttonBackgroundCheckedHovered: string;
  buttonBackgroundPressed: string;
  buttonBackgroundDisabled: string;
  buttonBorder: string;
  buttonBorderFocused: string;
  buttonOutlineFocused: string;
  buttonText: string;
  buttonTextHovered: string;
  buttonTextChecked: string;
  buttonTextCheckedHovered: string;
  buttonTextPressed: string;
  buttonTextDisabled: string;
  buttonBorderDisabled: string;

  primaryButtonBackground: string;
  primaryButtonBackgroundHovered: string;
  primaryButtonBackgroundPressed: string;
  primaryButtonBackgroundDisabled: string;
  primaryButtonBorder: string;
  primaryButtonBorderFocused: string;

  primaryButtonText: string;
  primaryButtonTextHovered: string;
  primaryButtonTextPressed: string;
  primaryButtonTextDisabled: string;

  menuBackground: string;
  menuDivider: string;
  menuIcon: string;
  menuHeader: string;
  menuItemBackgroundHovered: string;
  menuItemBackgroundPressed: string;
  menuItemText: string;
  menuItemTextHovered: string;

  listBackground: string;
  listText: string;
  listItemBackgroundHovered: string;
  listItemBackgroundChecked: string;
  listItemBackgroundCheckedHovered: string;

  listHeaderBackgroundHovered: string;
  listHeaderBackgroundPressed: string;

  actionLink: string;
  actionLinkHovered: string;
  link: string;
  linkHovered: string;

  // Deprecated slots, second pass by _fixDeprecatedSlots() later for self-referential slots
  listTextColor: string;
  accentButtonBackground: string;
  disabledBodySubtext: string;
  inputText: string;
  inputTextHovered: string;
  accentButtonText: string;
  menuItemBackgroundChecked: string;
}

export interface ThemeExtended extends ITheme {
  semanticColors: SemanticColorsExtended;
}
