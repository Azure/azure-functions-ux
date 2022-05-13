import { ITextFieldStyles } from '@fluentui/react';
import { useContext, useMemo } from 'react';
import { style } from 'typestyle';
import { ThemeContext } from '../../../../../../ThemeContext';

const fieldWidth = '275px';

const inputStack = style({
  justifyContent: 'space-between',
});

const accountNameField = style({
  width: fieldWidth,
  height: '24px',
});

const accountNameInput = style({
  fontSize: '13px',
  lineHeight: '18px',
});

const apiTypeField = style({
  fontSize: '13px',
  height: '24px',
  lineHeight: '18px',
  margin: '10px 0',
  width: fieldWidth,
});

export const inputErrorDivHorizontal = style({
  marginLeft: '178px',
  marginTop: '4px',
});

export const useStyles = () => {
  const theme = useContext(ThemeContext);

  const apiType = useMemo(
    () =>
      style({
        color: theme.semanticColors.textColor,
      }),
    [theme]
  );

  const errorIcon = useMemo(
    () =>
      style({
        color: theme.semanticColors.errorText,
        marginRight: '10px',
      }),
    [theme]
  );

  const inputError = useMemo(
    () =>
      style({
        color: theme.semanticColors.errorText,
        fontSize: '12px',
      }),
    [theme]
  );

  return {
    accountNameField,
    accountNameInput,
    apiType,
    apiTypeField,
    errorIcon,
    inputError,
    inputErrorDivHorizontal,
    inputStack,
  };
};

export const accountNameFieldStyles: Pick<ITextFieldStyles, 'fieldGroup'> = {
  fieldGroup: {
    height: '24px',
  },
};
