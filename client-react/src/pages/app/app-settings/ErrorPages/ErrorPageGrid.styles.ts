import { mergeStyleSets, FontWeights, IIconProps } from '@fluentui/react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';

export const stackTokens = { childrenGap: 5 };

export const stackStyle = style({
  paddingTop: '5px',
});

export const checkboxStyle = style({
  paddingTop: '15px',
});

export const errorPageCheckboxStyles = style({
  paddingRight: '15px',
});

export const uploadStyle = mergeStyleSets({
  labelHeader: {
    fontWeight: FontWeights.semibold,
  },
});

export const boldCellStyle = style({
  fontWeight: 400,
});

export const overlayStyle = style({
  opacity: 0.5,
  zIndex: 10,
});

export const browseButtonStyle = (theme: ThemeExtended) =>
  style({
    backgroundColor: theme.semanticColors.accentButtonBackground,
    color: theme.semanticColors.buttonTextChecked,
    $nest: {
      '&:hover': {
        color: theme.semanticColors.buttonTextChecked,
      },
    },
  });

export const FabricFolder: IIconProps = { iconName: 'FabricFolder' };
