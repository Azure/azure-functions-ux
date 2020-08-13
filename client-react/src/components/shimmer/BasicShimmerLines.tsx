import React from 'react';
import { wrapperClass } from './Shimmer.styles';
import { Shimmer, Fabric } from 'office-ui-fabric-react';

const BasicShimmerLines: React.FC<{}> = props => {
  return (
    <Fabric className={wrapperClass}>
      <Shimmer />
      <Shimmer width="40%" />
      <Shimmer width="50%" />
      <Shimmer width="60%" />
      <Shimmer width="30%" />
      <Shimmer width="50%" />
    </Fabric>
  );
};

export default BasicShimmerLines;
