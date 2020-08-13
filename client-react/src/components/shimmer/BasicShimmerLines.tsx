import React from 'react';
import { wrapperClass } from './Shimmer.styles';
import { Shimmer, Fabric } from 'office-ui-fabric-react';
interface BasicShimmerLines {
  repeatShimmer?: number;
}

const BasicShimmerLines: React.FC<BasicShimmerLines> = props => {
  const { repeatShimmer } = props;

  const getBasicPattern = () => {
    return (
      <>
        <Shimmer width="40%" />
        <Shimmer width="30%" />
        <Shimmer width="50%" />
      </>
    );
  };

  const getLines = () => {
    const lines = !!repeatShimmer ? repeatShimmer : 1;
    const elements: JSX.Element[] = [];
    for (let i = 0; i < lines; i += 1) {
      elements.push(getBasicPattern());
    }
    return elements;
  };

  return <Fabric className={wrapperClass}>{getLines()}</Fabric>;
};

export default BasicShimmerLines;
