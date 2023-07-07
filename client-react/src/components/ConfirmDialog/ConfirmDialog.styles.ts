import { IDialogContentStyles, IDialogFooterStyles, IModalStyles } from '@fluentui/react';
import { style } from 'typestyle';

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
    paddingBottom: '0px',
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

export const modalFooterStyles: Pick<IDialogFooterStyles, 'actions'> = {
  actions: {
    width: 'calc(100vw - 25px)',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'start',
    borderTop: '1px solid rgba(204,204,204,.8)',
    paddingTop: '10px',
    paddingLeft: '26px',
    paddingBottom: '10px',
    textAlign: 'left',
  },
};

export const headerStyle = style({
  fontWeight: 600,
  fontSize: '18px',
});
