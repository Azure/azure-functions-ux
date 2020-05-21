import { style } from 'typestyle';

export const invocationsTabStyle = style({
  padding: '5px 8px',
});

export const invocationsSummary = style({
  borderBottom: '1px solid rgba(204,204,204,.8)',
  padding: '12px 0px',
});

export const summaryItem = style({
  minWidth: '175px',
  display: 'inline-block',
  fontSize: '13px',

  $nest: {
    h4: {
      marginTop: '5px',
      marginBottom: '5px',
    },
    label: {
      fontSize: '11px',
      fontWeight: 'normal',
    },
    svg: {
      position: 'relative',
      right: '2px',
      top: '3px',
    },
  },
});

export const successElement = style({
  display: 'inline-block',
  $nest: {
    svg: {
      display: 'inline',
      right: '2px',
    },
    span: {
      display: 'inline',
      position: 'relative',
      bottom: '3px',
      left: '1px',
    },
  },
});

export const invocationsTable = style({
  overflowY: 'auto',
  height: 'calc(100vh - 260px)',
});
