import { IDialogContentStyles, IDialogFooterStyles, IModalStyles } from '@fluentui/react';

export const modalStyles: Pick<IModalStyles, 'main'> = {
  main: {
    position: 'absolute',
    top: '0px',
    minWidth: '100% !important',
  },
};

export const modalContentStyles: Pick<IDialogContentStyles, 'header' | 'inner' | 'innerContent' | 'title'> = {
  inner: {
    paddingLeft: '0px',
    paddingBottom: '10px',
    paddingRight: '3px',
    overflow: 'hidden',
  },
  header: {
    zIndex: 1,
  },
  title: {
    padding: '0px',
  },
  innerContent: {
    width: 'calc(100vw - 64px)',
    paddingLeft: '28px',
    paddingRight: '36px',
    paddingBottom: '5px',
  },
};

export const modalFooterStyles: Pick<IDialogFooterStyles, 'actionsRight'> = {
  actionsRight: {
    width: 'calc(100vw - 25px)',
    borderTop: '1px solid rgba(204,204,204,.8)',
    paddingTop: '10px',
    paddingLeft: '28px',
    textAlign: 'left',
  },
};
