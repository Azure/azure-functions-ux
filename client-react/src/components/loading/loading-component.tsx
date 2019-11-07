import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import React from 'react';
import { style } from 'typestyle/lib';

const loadingCSS = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1,
});

const LoadingComponent = () => {
  return (
    <div className={loadingCSS}>
      <Spinner size={SpinnerSize.large} ariaLive="assertive" />
    </div>
  );
};

export default LoadingComponent;
