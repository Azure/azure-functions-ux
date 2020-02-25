import React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyles } from './AppStopBanner.styles';

interface AppStopBannerProps {
  message: string;
}

const AppStopBanner: React.FC<AppStopBannerProps> = props => {
  const { message } = props;

  return (
    <div>
      <MessageBar id="app-stopped-banner" isMultiline={true} messageBarType={MessageBarType.warning} styles={messageBannerStyles}>
        {message}
      </MessageBar>
    </div>
  );
};

export default AppStopBanner;
