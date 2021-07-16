import { style } from 'typestyle';
import { ThemeExtended } from '../common/theme/SemanticColorsExtended';

const fieldWidth = '275px';

export const inputStackStyle = style({
  justifyContent: 'space-between',
});

export const accountNameFieldStyle = style({
  width: fieldWidth,
  height: '24px',
});

export const accountNameInputStyle = style({
  fontSize: '13px',
  lineHeight: '18px',
});

export const apiTypeFieldStyle = style({
  margin: '10px 0',
  height: '24px',
  width: fieldWidth,
  fontSize: '13px',
  lineHeight: '18px',
});

export const inputErrorDivHorizontalStyle = style({
  marginLeft: '178px',
  marginTop: '4px',
});

export const inputErrorDivVerticalStyle = style({
  marginTop: '4px',
  marginBottom: '15px',
});

export const errorIconStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.errorText,
    marginRight: '10px',
  });

export const inputErrorStyle = (theme: ThemeExtended) =>
  style({
    fontSize: '12px',
    color: theme.semanticColors.errorText,
  });

export const apiTypeStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.textColor,
  });
