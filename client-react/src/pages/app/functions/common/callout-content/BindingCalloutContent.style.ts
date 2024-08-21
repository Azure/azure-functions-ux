import { useContext, useMemo } from 'react';
import { style } from 'typestyle';
import { ThemeContext } from '../../../../../ThemeContext';

const actionBarStyle = style({
  display: 'flex',
  gap: '8px',
});

const calloutContentStyle = style({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px 24px',
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
        fontWeight: 600,
        lineHeight: '24px',
        marginBlock: 0,
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
