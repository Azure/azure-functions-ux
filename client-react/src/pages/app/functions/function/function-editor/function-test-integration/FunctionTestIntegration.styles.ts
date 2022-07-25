import { style } from 'typestyle';

export const useStyles = () => {
  return {
    content: style({
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px 0',
    }),
  };
};
