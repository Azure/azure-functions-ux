import React from 'react';
import { Icon, Link, Stack } from 'office-ui-fabric-react';

const EventGridIntegration = props => {
  return (
    <div>
      <h3>Event Grid input</h3>

      <Link href="">Go to your Event Grid account</Link>
      <Link href="linkToDocs">
        <Stack horizontal verticalAlign="center">
          <span>Learn more about Event Grid inputs</span>
          <Icon iconName="OpenInNewWindow" />
        </Stack>
      </Link>
    </div>
  );
};

export default EventGridIntegration;
