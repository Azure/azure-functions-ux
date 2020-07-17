import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { style } from 'typestyle';
import { DropDownStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/Dropdown.styles';
import { IDropdownStyles, ITooltipHostStyles } from 'office-ui-fabric-react';

export const fileSelectorStackStyle = (theme: ThemeExtended) =>
  style({
    padding: '8px 15px 8px 25px',
    borderBottom: `1px solid ${theme.palette.neutralTertiaryAlt}`,
    background: theme.semanticColors.background,
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

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const fileSelectorDropdownStyle = () => styleProps => {
  const baseStyle = DropDownStyles({ ...styleProps });
  return {
    ...baseStyle,
    root: [
      ...baseStyle.root,
      {
        paddingTop: '5px',
      },
    ],
    title: [...baseStyle.title],
    errorMessage: [...baseStyle.errorMessage],
    dropdown: [
      ...baseStyle.dropdown,
      {
        minWidth: '200px',
      },
    ],
  } as IDropdownStyles;
};

export const logPanelStyle = (isExpanded: boolean, fullscreen: boolean, readOnlyBannerHeight: number) =>
  fullscreen
    ? style({
        height: `calc(100vh - ${87 + readOnlyBannerHeight}px)`,
      })
    : style({
        position: 'sticky',
        zIndex: 1,
        bottom: '0',
        height: isExpanded ? '212px' : '37px',
        borderTop: '1px solid rgba(204,204,204,.8)',
      });

export const editorDivStyle = style({
  marginRight: '10px',
});

export const defaultMonacoEditorHeight = 'calc(100vh - 138px)';

export const urlCalloutTextfieldStyle = style({
  marginTop: '5px',
});

export const keyDivStyle = style({
  width: '200px',
  float: 'left',
  marginRight: '15px',
});

export const urlDivStyle = style({
  width: '380px',
  float: 'right',
});

export const urlFieldStyle = style({
  minWidth: '350px',
});

export const urlFormStyle = style({
  marginBottom: '0px',
});

export const shrinkEditorStyle = (width: number) => {
  let panelWidth = width;

  if (width >= 1024) {
    panelWidth = 644;
  } else if (width >= 640) {
    panelWidth = 592;
  } else if (width >= 480) {
    panelWidth = 272;
  }

  return {
    width: `calc(100vw - ${panelWidth}px)`,
  };
};

export const testPanelStyle = {
  main: {
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 0px 5px 0px',
  },
  contentInner: {
    marginTop: '20px',
  },
};

export const toolTipStyle: Partial<ITooltipHostStyles> = { root: { display: 'inherit' } };

export const editorStyle = style({
  paddingTop: '10px',
});
