import { ISemanticColors, ITheme } from '@uifabric/styling';

export interface AzurePortalColors {
  lineSeperator: string;
  sectionDividerScrollbar: string;
  background: string;
  sectionBackground: string;
  itemBackgroundOnSelect: string;
  itemBackgroundOnHover: string;
  overlay: string;
  successBackground: string;
  successIcon: string;
  errorBackground: string;
  errorIcon: string;
  warningBackground: string;
  warningIcon: string;
  infoBackground: string;
  infoIcon: string;
  textColor: string;
  placeholderText: string;
  labelText: string;
  disabledText: string;
  hyperlinkText: string;
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
}
export interface SemanticColorsExtended extends ISemanticColors, AzurePortalColors {}
export interface ThemeExtended extends ITheme {
  semanticColors: SemanticColorsExtended;
}
