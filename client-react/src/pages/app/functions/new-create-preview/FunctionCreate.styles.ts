import { style } from 'typestyle';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';

export const containerStyle = style({
  padding: '5px 20px',
});

export const developmentEnvironmentStyle = style({
  fontWeight: 'bold',
});

export const selectDevelopmentEnvironmentHeaderStyle = style({
  marginBottom: '4px',
});

export const selectDevelopmentEnvironmentDescriptionStyle = style({
  marginTop: '0px',
  marginBottom: '30px',
});

export const templateListStyle = style({
  maxHeight: '300px',
  display: 'inline-flex',
});

export const templateListNameColumnStyle = style({
  marginRight: '10px',
});

export const filterTextFieldStyle = { root: { marginTop: '30px', marginBottom: '10px', height: '25px', width: '200px' } };

export const formContainerStyle = style({
  height: '100vh',
});

export const formContainerDivStyle = style({
  height: '100vh',
});

export const detailContainerStyle = style({
  marginTop: '25px',
  paddingBottom: '57px',
});

export const dropdownIconStyle = style({
  width: '14px',
  height: '14px',
  verticalAlign: 'middle',
  marginRight: '6px',
});

export const developInPortalIconStyle = style({
  width: '14px',
  height: '14px',
  color: '#0078D4',
  marginRight: '6px',
});

export const tableRowStyle = (theme: ThemeExtended, isSelected: boolean, isDisabled: boolean) => {
  return {
    root: {
      background: isSelected ? theme.semanticColors.itemBackgroundOnSelect : theme.semanticColors.background,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      overflow: 'hidden',
    },
  };
};

export const localCreateContainerStyle = style({
  padding: '5px 20px',
  paddingBottom: '57px',
});
