import { IButtonProps, ICommandBarStyles, MessageBarType } from 'office-ui-fabric-react';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';

export const formElementStyle = {
  paddingBottom: '16px',
};

export const CommandBarButtonStyle = (props: IButtonProps, theme: ThemeExtended) => ({
  ...props.styles,
  root: {
    backgroundColor: theme.semanticColors.bodyBackground,
    border: '1px solid transparent',
  },
  rootDisabled: {
    backgroundColor: theme.semanticColors.bodyBackground,
  },
});

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const formStyle = style({
  padding: '5px 20px',
});
export const customCommandBarStyles = (theme: ThemeExtended): ICommandBarStyles => {
  return {
    root: [
      {
        backgroundColor: theme.semanticColors.bodyBackground,
      },
    ],
  };
};

export const newButtonOfficeFabricStyle = { root: { marginTop: '5px' } };
export const textBoxListStyle = style({ marginBottom: '5px', marginLeft: '0px', listStyle: 'none' });
export const textBoxInListStyle = style({ display: 'inline-block', width: 'calc(100% - 20px)' });
export const textBoxInListDeleteButtonStyle = style({ display: 'inline-block', width: '16px' });

export const tableActionButtonStyle = { root: { marginTop: '5px' } };
export const bladeLinkStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.actionLink,
    cursor: 'pointer',
  });

export const dirtyElementStyle = (theme: ThemeExtended, addPadding?: boolean) =>
  style({
    paddingLeft: addPadding ? '4px' : undefined,
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderLeftColor: theme.semanticColors.controlDirtyOutline,
    boxSizing: 'border-box',
  });

export const keyVaultIconStyle = (theme: ThemeExtended, resolved: boolean) =>
  style({
    color: resolved ? theme.semanticColors.inlineSuccessText : theme.semanticColors.inlineErrorText,
    position: 'absolute',
    marginTop: '2px',
  });

export const sourceTextStyle = style({
  marginLeft: '15px',
});

export const messageBannerStyle = (theme: ThemeExtended, type: MessageBarType) => {
  let backgroundColor: string;

  switch (type) {
    case MessageBarType.info:
      backgroundColor = theme.semanticColors.infoBackground;
      break;
    case MessageBarType.warning:
      backgroundColor = theme.semanticColors.warningBackground;
      break;
    case MessageBarType.error:
      backgroundColor = theme.semanticColors.errorBackground;
      break;
    default:
      backgroundColor = theme.semanticColors.infoBackground;
  }

  return style({
    backgroundColor,
    paddingLeft: '5px',
    marginBottom: '5px',
  });
};
