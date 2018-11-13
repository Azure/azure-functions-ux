import { ISemanticColors, ITheme } from '@uifabric/styling';

export interface SemanticColorsExtended extends ISemanticColors {
  dirty: string;
}
export interface ThemeExtended extends ITheme {
  semanticColors: SemanticColorsExtended;
}
