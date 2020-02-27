import React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyles } from './WarningBanner.styles';

interface WarningBannerProps {
  message: string;
}

const WarningBanner: React.FC<WarningBannerProps> = props => {
  const { message } = props;

  return (
    <div>
      <MessageBar id="app-stopped-banner" isMultiline={true} messageBarType={MessageBarType.warning} styles={messageBannerStyles}>
        {message}
      </MessageBar>
    </div>
  );
};

export default WarningBanner;
