/** @type {{main: React.CSSProperties}} */
export const modalStyles = {
  main: {
    position: 'absolute' as 'absolute',
    top: '0px',
    minWidth: '100% !important',
  },
};

export const modalContentStyles = {
  inner: {
    paddingLeft: '0px',
    paddingBottom: '10px',
    paddingRight: '3px',
    overflow: 'hidden' as 'hidden',
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

export const modalFooterStyles = {
  actionsRight: {
    width: 'calc(100vw - 25px)',
    borderTop: '1px solid rgba(204,204,204,.8)',
    paddingTop: '10px',
    paddingLeft: '28px',
    textAlign: 'left',
  },
};
