import React, { useContext } from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { formStyle, messageBannerStyle } from '../../pages/app/app-settings/AppSettings.styles';
import { ThemeContext } from '../../ThemeContext';

export interface BannerMessageProps {
  type?: MessageBarType;
  text: string;
}

interface PivotItemContentProps {
  bannerMessageProps?: BannerMessageProps;
}

const PivotItemContent: React.SFC<PivotItemContentProps> = props => {
  const theme = useContext(ThemeContext);
  const { bannerMessageProps } = props;
  const type = (bannerMessageProps && bannerMessageProps.type) || MessageBarType.info;

  return (
    <>
      {bannerMessageProps && (
        <MessageBar isMultiline={false} className={messageBannerStyle(theme, type)} messageBarType={type}>
          {bannerMessageProps.text}
        </MessageBar>
      )}
      <div className={formStyle}>{props.children}</div>
    </>
  );
};

export default PivotItemContent;
