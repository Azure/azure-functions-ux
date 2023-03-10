import { mergeStyleSets, FontWeights, IIconProps } from '@fluentui/react';
import { style } from 'typestyle';

export const stackTokens = { childrenGap: 5 };

export const stackStyle = style({
  paddingTop: '5px',
});

export const uploadStyle = mergeStyleSets({
  labelHeader: {
    fontWeight: FontWeights.semibold,
  },
});

export const FabricFolder: IIconProps = { iconName: 'FabricFolder' };
