import React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyles } from './CustomBanner.styles';

interface CustomBannerProps {
  message: string;
  type: MessageBarType;
}

const CustomBanner: React.FC<CustomBannerProps> = props => {
  const { message, type } = props;

  return (
    <div>
      <MessageBar id="app-stopped-banner" isMultiline={true} messageBarType={type} styles={messageBannerStyles}>
        {message}
      </MessageBar>
    </div>
  );
};

export default CustomBanner;
