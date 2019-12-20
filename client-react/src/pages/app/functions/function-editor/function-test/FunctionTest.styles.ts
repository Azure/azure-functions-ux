import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';

export const pivotItemWrapper = style({
  marginTop: '25px',
});

export const bodyEditorStyle = style({
  paddingRight: '8px',
  marginBottom: '10px',
  paddingTop: '8px',
  border: '1px solid rgba(204,204,204,.8)',
});

export const httpAddDataStyle = style({
  borderTop: '1px solid rgba(204,204,204,.8)',
  borderBottom: '1px solid rgba(204,204,204,.8)',
  paddingTop: '8px',
  paddingBottom: '8px',
});

export const httpAddDataTextStyle = (theme: ThemeExtended) =>
  style({
    fontSize: '13px',
    color: theme.semanticColors.hyperlinkText,
    cursor: 'pointer',
  });

export const functionTestInputGroupStyle = style({
  marginTop: '15px',
});

export const keyValuePairTextStyle = style({
  width: '45%',
  display: 'inline-block',
  marginRight: '10px',
});

export const keyValuePairButtonStyle = style({
  display: 'inline-block',
});

export const keyValuePairStyle = style({
  marginBottom: '10px',
});
