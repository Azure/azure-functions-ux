import { style } from 'typestyle';

export const codeBoxStyles = style({
  border: '1px solid #E1DFDD',
  boxSizing: 'border-box',
  borderRadius: '2px',
  padding: '14px 18px',
  whiteSpace: 'pre-wrap', // Supports newlines/tabs in the codeText
});
