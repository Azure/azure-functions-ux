import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';

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
  fontSize: '13px',
  height: '24px',
  lineHeight: '18px',
  margin: '10px 0',
  width: fieldWidth,
});

export const inputErrorDivHorizontalStyle = style({
  marginLeft: '178px',
  marginTop: '4px',
});

export const errorIconStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.errorText,
    marginRight: '10px',
  });

export const inputErrorStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.errorText,
    fontSize: '12px',
  });

export const apiTypeStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.textColor,
  });
