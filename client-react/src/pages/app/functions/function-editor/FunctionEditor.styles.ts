import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';

export const fileSelectorStackStyle = (theme: ThemeExtended) =>
  style({
    padding: '8px 15px 8px 15px',
    borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}`,
  });

export const fileDropdownStyle = style({
  minWidth: '200px',
});

export const pivotWrapper = style({
  paddingLeft: '8px',
});

export const pivotStyle = style({
  margin: '20px',
  borderBottom: '1px solid rgba(204, 204, 204, 0.8)',
});

export const testLoadingStyle = style({
  position: 'absolute',
  zIndex: 1,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const disableTestPanelStyle = style({
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  pointerEvents: 'none',
});

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});
