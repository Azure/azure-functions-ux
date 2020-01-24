import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';

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
  justifyContent: 'space-between',
});

export const logExpandButtonStyle = style({
  cursor: 'pointer',
});

export const logStreamStyle = (maximized: boolean) =>
  style({
    height: maximized ? 'calc(100vh - 124px)' : '175px',
    backgroundColor: '#000000',
    overflow: 'auto',
  });

export const logCommandBarButton = style({
  marginTop: '5px',
  paddingRight: '5px',
});

export const logCommandBarButtonListStyle = style({
  float: 'right',
});

export const logCommandBarButtonLabelStyle = style({
  marginRight: '16px',
  cursor: 'pointer',
});

export const logCommandBarButtonStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.primaryButtonBackground,
    paddingRight: '5px',
  });

export const logCommandBarSeparatorStyle = style({
  marginLeft: '7px',
  marginRight: '23px',
  width: '1px',
  border: '1px solid rgba(128, 128, 128, 0.7)',
  height: '16px',
});
