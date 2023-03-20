import { mergeStyleSets, FontWeights, IIconProps, mergeStyles } from '@fluentui/react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';

export const stackTokens = { childrenGap: 5 };

export const stackStyle = style({
  paddingTop: '5px',
});

export const uploadStyle = mergeStyleSets({
  labelHeader: {
    fontWeight: FontWeights.semibold,
  },
});

export const boldCellStyle = style({
  fontWeight: 400,
});

export const CellStyle = mergeStyles({
  display: 'flex !important',
  justifyContent: 'center',
  width: '100px !important',
});

export const IconCellStyles = {
  root: [
    {
      width: '100px !important',
      display: 'inline-flex !important',
      padding: '0 !important',
    },
  ],
  cellTitle: [
    {
      justifyContent: 'center !important',
    },
  ],
};

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
