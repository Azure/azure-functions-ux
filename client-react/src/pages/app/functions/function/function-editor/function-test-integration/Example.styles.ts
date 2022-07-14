import { style } from 'typestyle';

export const useStyles = () => {
  return {
    actionBar: style({
      alignItems: 'center',
      display: 'flex',
      flexFlow: 'row nowrap',
    }),
    description: style({
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '16px',
      marginBlock: '0',
    }),
    editor: style({
      border: 'thin solid GrayText',
    }),
    header: style({
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '22px',
      marginBlock: '0',
    }),
    link: style({
      alignContent: 'flex-end',
      flex: '1',
      textAlign: 'right',
    }),
    section: style({
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }),
  };
};
