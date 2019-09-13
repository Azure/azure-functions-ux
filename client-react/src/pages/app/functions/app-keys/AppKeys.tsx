import React from 'react';

export interface AppKeysProps {
  resourceId: string;
}

class AppKeys extends React.Component<AppKeysProps> {
  constructor(props) {
    super(props);
  }

  public render() {
    return <p>It Works</p>;
  }
}

export default AppKeys;
