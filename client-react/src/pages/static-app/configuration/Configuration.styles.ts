import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const formStyle = style({
  padding: '5px 20px',
});

export const formDescriptionStyle = style({
  maxWidth: '800px',
});

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const environmentSelectorStackStyle = () =>
  style({
    padding: '8px 15px 8px 0px',
  });

export const environmentSelectorLabelStyle = style({
  paddingRight: '10px',
});

export const tableValueComponentStyle = style({
  display: 'inline-flex',
  cursor: 'pointer',
  alignItems: 'center',
  width: '100%',
});

export const tableValueIconStyle = (theme: ThemeExtended) =>
  style({
    fontSize: '15px',
    marginRight: '5px',
    marginTop: '5px',
    color: theme.semanticColors.hyperlinkText,
  });

export const tableValueFormFieldStyle = style({
  marginBottom: '0px !important',
  height: 'fit-content',
});

export const tableValueTextFieldStyle = style({
  width: '100%',
});
