import { IDialogContentStyleProps, IDialogContentStyles, IDialogFooterStyleProps, IDialogFooterStyles } from '@fluentui/react/lib/Dialog';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { IStyleFunctionOrObject } from '@fluentui/react/lib/Utilities';

export const consoleStyles = mergeStyleSets({
  customTextField: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialogFooterAlignLeft: {
    textAlign: 'left',
  },
});

export const dialogFooterStyles = (): IStyleFunctionOrObject<IDialogFooterStyleProps, IDialogFooterStyles> => {
  return { actions: { marginTop: '34px' }, actionsRight: { textAlign: 'left' } };
};

export const dialogTitleStyles = (): IStyleFunctionOrObject<IDialogContentStyleProps, IDialogContentStyles> => {
  return { title: { fontWeight: 600 } };
};
