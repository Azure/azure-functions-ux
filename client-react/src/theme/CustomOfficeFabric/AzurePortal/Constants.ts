import { getScreenSelector, ScreenWidthMaxMedium, ScreenWidthMaxSmall, ScreenWidthMinMedium } from '@fluentui/react';

export const borderWidth = '1px';
export const borderWidthError = '2px';
export const borderSolid = 'solid';
export const borderNone = 'none';
export const fontWeightBold = '700';
export const inputControlHeight = '25px';
export const inputControlHeightInner = '20px';
export const textAlignCenter = 'center';
export const transparent = 'transparent';
export const MinimumScreenSelector = getScreenSelector(0, ScreenWidthMaxSmall);
export const MediumScreenSelector = getScreenSelector(ScreenWidthMinMedium, ScreenWidthMaxMedium);
