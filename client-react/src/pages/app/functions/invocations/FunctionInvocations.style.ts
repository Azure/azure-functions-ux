import { style } from 'typestyle';

export const invocationsTabStyle = style({
  padding: '5px 8px',
});

export const filterBoxStyle = { root: { marginTop: '5px', height: '25px', width: '100%' } };

export const invocationsSummary = style({
  borderBottom: '1px solid rgba(204,204,204,.8)',
  padding: '12px 10px',
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
  },
});
