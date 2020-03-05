import React, { useContext } from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyles, messageBannerTextStyle, messageBannerIconStyle, messageBannerClass } from './CustomBanner.styles';
import { ThemeContext } from '../../ThemeContext';

interface CustomBannerProps {
  message: string;
  type: MessageBarType;
  id?: string;
  icon?: JSX.Element;
  className?: string;
}

const CustomBanner: React.FC<CustomBannerProps> = props => {
  const { message, type, id, icon, className: customClassName } = props;

  const theme = useContext(ThemeContext);

  let className = messageBannerClass(theme, type);

  if (!!customClassName) {
    className = Object.assign(className, customClassName);
  }

  return (
    <div>
      <MessageBar
        id={`${id}-custom-banner`}
        isMultiline={true}
        messageBarType={type}
        styles={messageBannerStyles(!!icon)}
        className={className}>
        {!!icon ? (
          <>
            <span className={messageBannerIconStyle}>{icon}</span>
            <span className={messageBannerTextStyle}>{message}</span>
          </>
        ) : (
          message
        )}
      </MessageBar>
    </div>
  );
};

export default CustomBanner;
