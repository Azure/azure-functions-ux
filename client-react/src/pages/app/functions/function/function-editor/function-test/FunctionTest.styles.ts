import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';

export const pivotItemWrapper = style({
  marginTop: '10px',
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
  paddingTop: '4px',
  paddingBottom: '8px',
});

export const httpAddDataTextStyle = (theme: ThemeExtended) =>
  style({
    fontSize: '13px',
    color: theme.semanticColors.hyperlinkText,
    cursor: 'pointer',
  });

export const functionTestGroupStyle = style({
  marginTop: '15px',
});

export const keyValuePairTextStyle = style({
  width: '45%',
  display: 'inline-block',
  marginRight: '10px',
});

export const keyValuePairButtonStyle = (theme: ThemeExtended) =>
  style({
    display: 'inline-block',
    color: theme.semanticColors.primaryButtonBackground,
  });

export const keyValuePairStyle = style({
  marginBottom: '10px',
});

export const responseContentStyle = style({
  width: '95%',
  minHeight: '200px',
  backgroundColor: 'rgba(128, 128, 128, 0.1)',
  border: '1px solid rgba(204, 204, 204, 0.8)',
  boxSizing: 'border-box',
  padding: '7px',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
});

export const responseCodeStyle = style({
  padding: '3px',
});

export const functionTestBodyStyle = style({
  paddingLeft: '8px',
});

export const keyValuePairLabelStyle = style({
  fontWeight: 600,
  width: '45%',
  display: 'inline-block',
  marginRight: '10px',
  fontSize: '12px',
});

export const keyValuePairLabelDivStyle = style({
  paddingBottom: '4px',
  marginBottom: '8px',
  borderBottom: '1px solid rgba(204,204,204,.8)',
});

export const testFormLabelStyle = style({
  fontWeight: 600,
  fontSize: '14px',
});
