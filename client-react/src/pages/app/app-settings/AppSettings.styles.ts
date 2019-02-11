import { IButtonProps } from 'office-ui-fabric-react';
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
