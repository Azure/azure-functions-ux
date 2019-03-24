import * as React from 'react';
export const Head = props => {
  if ((props.config && props.config.clientOptimzationsOff) || !props.versionConfig) {
    return <base href="/ng-full/" />;
  }
  return (
    <>
      <base href="/ng-min/" />
      <link href={props.versionConfig.styles} rel="stylesheet" />
    </>
  );
};
