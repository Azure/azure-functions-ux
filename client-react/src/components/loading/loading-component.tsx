import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle/lib';
import * as Loadable from 'react-loadable';

const loadingCSS = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

const LoadingComponent: React.FC<Loadable.LoadingComponentProps> = props => {
  const { error, retry, pastDelay, timedOut } = props;
  const { t } = useTranslation();
  if (error || timedOut) {
    return (
      <div className={loadingCSS}>
        Failed to load! <DefaultButton onClick={retry}>Retry</DefaultButton>
      </div>
    );
  }
  if (pastDelay) {
    return (
      <div className={loadingCSS}>
        <Spinner size={SpinnerSize.large} label={t('loading')} ariaLive="assertive" />
      </div>
    );
  }

  return null;
};

export default LoadingComponent;
