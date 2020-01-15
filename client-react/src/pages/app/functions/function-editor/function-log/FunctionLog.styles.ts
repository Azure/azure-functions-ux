import { style } from 'typestyle';

export const chevronIconStyle = (expand?: boolean) =>
  style({
    width: '13px',
    height: '8px',
    marginRight: '9px',
    transform: expand ? 'rotate(180deg)' : '',
  });

export const logCommandBarStyle = style({
  height: '37px',
  display: 'flex',
  alignItems: 'center',
  marginLeft: '10px',
});

export const logExpandButtonStyle = style({
  cursor: 'pointer',
});

export const logStreamStyle = style({
  height: '171px',
  backgroundColor: '#000000',
  overflow: 'auto',
});
