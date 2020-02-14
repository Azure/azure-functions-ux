import { style } from 'typestyle';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';

export const formStyle = style({
  padding: '5px 25px',
});

export const dropdownIconStyle = style({
  width: '17px',
  height: '17px',
  verticalAlign: 'middle',
  marginRight: '6px',
});

export const quickstartDropdownLabelStyle = style({
  marginBottom: '3px',
  marginLeft: '2px',
});

export const quickstartDropdownContainerStyle = style({
  marginTop: '20px',
  marginBottom: '20px',
});

export const quickstartLinkStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.link,
    textDecoration: 'none',
    $nest: {
      '&:hover': {
        color: theme.semanticColors.linkHovered,
        textDecoration: 'underline',
      },
    },
  });

export const markdownIconStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.menuIcon,
  });
