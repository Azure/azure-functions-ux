import { IButtonProps } from 'office-ui-fabric-react';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

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
