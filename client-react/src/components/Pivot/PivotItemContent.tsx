import React, { useContext, useState } from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { formStyle, messageBannerStyle } from '../../pages/app/app-settings/AppSettings.styles';
import { ThemeContext } from '../../ThemeContext';
import { isEqual } from 'lodash';
import { BannerMessageContext } from '../../pages/app/app-settings/Contexts';

export interface BannerMessageProps {
  type?: MessageBarType;
  text: string;
}
const PivotItemContent: React.FC<{}> = props => {
  const [bannerMessageProps, setBannerMessageProps] = useState<BannerMessageProps | undefined>(undefined);
  const theme = useContext(ThemeContext);
  const bannerMessageContext = {
    updateBanner: (bannerMsgProps?: BannerMessageProps) => {
      if (!isEqual(bannerMessageProps, bannerMsgProps)) {
        setBannerMessageProps(bannerMsgProps);
      }
    },
  };

  const type = (bannerMessageProps && bannerMessageProps.type) || MessageBarType.info;

  return (
    <>
      {bannerMessageProps && (
        <MessageBar isMultiline={false} className={messageBannerStyle(theme, type)} messageBarType={type}>
          {bannerMessageProps.text}
        </MessageBar>
      )}
      <BannerMessageContext.Provider value={bannerMessageContext}>
        <div className={formStyle}>{props.children}</div>
      </BannerMessageContext.Provider>
    </>
  );
};

export default PivotItemContent;
