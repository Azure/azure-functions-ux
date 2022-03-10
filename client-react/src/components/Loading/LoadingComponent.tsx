import { Spinner, SpinnerSize, Overlay } from '@fluentui/react';
import React from 'react';
import { style } from 'typestyle/lib';

interface LoadingComponentProps {
  className?: string;
  overlay?: boolean;
}

const loadingCSS = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1,
});

class LoadingComponent extends React.Component<LoadingComponentProps> {
  public render() {
    const { className, overlay } = this.props;

    return (
      <>
        {overlay && <Overlay />}
        <div className={className ?? loadingCSS}>
          <Spinner size={SpinnerSize.large} ariaLive="assertive" />
        </div>
      </>
    );
  }
}

export default LoadingComponent;
