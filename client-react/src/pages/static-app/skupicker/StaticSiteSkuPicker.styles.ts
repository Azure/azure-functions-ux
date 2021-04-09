import { style } from 'typestyle';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const gridContainerStyle = style({
  display: 'inline-grid',
  gridTemplateColumns: 'auto auto auto',
  padding: '10px',
});

export const gridItemStyle = (theme: ThemeExtended): string =>
  style({
    border: `1px solid ${theme.semanticColors.bodyDivider}`,
    padding: '20px',
    textAlign: 'center',
  });

export const gridHeaderItemStyle = (theme: ThemeExtended): string =>
  style({
    border: `1px solid ${theme.semanticColors.bodyDivider}`,
    padding: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
  });

export const footerStyle = (theme: ThemeExtended): string =>
  style({
    position: 'fixed',
    bottom: 0,
    left: '10px',
    width: '100%',
    height: '90px',
    borderTop: theme.semanticColors.bodyDivider,
  });
