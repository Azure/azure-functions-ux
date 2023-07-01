import React from 'react';

import { Shimmer, ThemeProvider } from '@fluentui/react';

import { shimmerTheme, wrapperClass } from './Shimmer.styles';
import { LineCircleShimmerGroup, LineGapCircleShimmerGroup, LineGapShimmerGroup } from './Shimmer.types';

const CustomElementsShimmer: React.FC = () => {
  return (
    <ThemeProvider className={wrapperClass} theme={shimmerTheme}>
      <Shimmer customElementsGroup={<LineGapShimmerGroup />} width="350" />
      <Shimmer customElementsGroup={<LineCircleShimmerGroup />} width="550" />
      <Shimmer customElementsGroup={<LineGapCircleShimmerGroup />} width="90%" />
      <br />
      <Shimmer customElementsGroup={<LineGapShimmerGroup />} width="350" />
      <Shimmer customElementsGroup={<LineCircleShimmerGroup />} width="550" />
      <Shimmer customElementsGroup={<LineGapCircleShimmerGroup />} width="90%" />
    </ThemeProvider>
  );
};

export default CustomElementsShimmer;
