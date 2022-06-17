import { IPivotStyles } from '@fluentui/react';

const pivot: Pick<IPivotStyles, 'root'> = {
  root: {
    marginLeft: '20px',
  },
};

export const useStyles = () => {
  return {
    pivot,
  };
};
