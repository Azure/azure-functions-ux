import React from 'react';
import { Fabric, Shimmer } from 'office-ui-fabric-react';
import { wrapperClass } from './Shimmer.styles';
import { getLineGapShimmerGroup, getLineCircleShimmerGroup, getLineGapCircleShimmerGroup } from './Shimmer.types';

interface CustomElementsShimmerProps {
  className?: string;
}

const CustomElementsShimmer: React.FC<CustomElementsShimmerProps> = props => {
  return (
    <Fabric className={wrapperClass}>
      <Shimmer customElementsGroup={getLineGapShimmerGroup()} width="350" />
      <Shimmer customElementsGroup={getLineCircleShimmerGroup()} width="550" />
      <Shimmer customElementsGroup={getLineGapCircleShimmerGroup()} width="90%" />
      <br />
      <Shimmer customElementsGroup={getLineGapShimmerGroup()} width="350" />
      <Shimmer customElementsGroup={getLineCircleShimmerGroup()} width="550" />
      <Shimmer customElementsGroup={getLineGapCircleShimmerGroup()} width="90%" />
    </Fabric>
  );
};

export default CustomElementsShimmer;
