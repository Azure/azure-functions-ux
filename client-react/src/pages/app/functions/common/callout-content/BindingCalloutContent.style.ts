import { useContext, useMemo } from 'react';
import { style } from 'typestyle';
import { ThemeContext } from '../../../../../ThemeContext';

const actionBarStyle = style({
  display: 'flex',
  gap: '8px',
});

const calloutContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const useStyles = () => {
  const theme = useContext(ThemeContext);

  const description = useMemo(
    () =>
      style({
        color: theme.semanticColors.textColor,
        fontSize: '13px',
        lineHeight: '18px',
      }),
    [theme]
  );

  const header = useMemo(
    () =>
      style({
        color: theme.semanticColors.textColor,
        fontSize: '18px',
        lineHeight: '24px',
        margin: 0,
        padding: 0,
      }),
    [theme]
  );

  return {
    actionBar: actionBarStyle,
    calloutContent: calloutContentStyle,
    description,
    header,
  };
};
