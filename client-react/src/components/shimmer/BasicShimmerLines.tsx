import React from 'react';
import { wrapperClass, shimmerStyle } from './Shimmer.styles';
import { Shimmer, Fabric } from '@fluentui/react';
interface BasicShimmerLinesProps {
  repeatShimmer?: number;
}

const BasicShimmerLines: React.FC<BasicShimmerLinesProps> = ({ repeatShimmer = 1 }) => {
  const getBasicPattern = (key: string) => {
    const shimmers = [{ width: '40%' }, { width: '30%' }, { width: '50%' }];
    return (
      <div key={key}>
        {shimmers.map((shimmer, index) => (
          <Shimmer width={shimmer.width} key={index} className={shimmerStyle} />
        ))}
      </div>
    );
  };

  const getLines = () => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < repeatShimmer; i += 1) {
      elements.push(getBasicPattern(`shimmerGroup-${i}`));
    }
    return elements;
  };

  return <Fabric className={wrapperClass}>{getLines()}</Fabric>;
};

export default BasicShimmerLines;
