import * as React from 'react';
const Head = props => {
  if ((props.config && props.config.clientOptimzationsOff) || !props.version) {
    return <base href="/ng-full/" />;
  }
  return (
    <>
      <base href="/ng-min/" />
      <link href={props.version.styles} rel="stylesheet" />
    </>
  );
};

export default Head;
