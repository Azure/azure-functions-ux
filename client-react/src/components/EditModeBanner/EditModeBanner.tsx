import React, { useContext } from 'react';
import { SiteStateContext } from '../../SiteStateContext';
import { useTranslation } from 'react-i18next';
import SiteHelper from '../../utils/SiteHelper';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { messageBannerStyles, messageBannerClass, messageBannerIconStyle, messageBannerTextStyle } from './EditModeBanner.styles';
import { ThemeContext } from '../../ThemeContext';
import { ReactComponent as InfoSvg } from '../../images/Common/ibiza-info.svg';

interface EditModeBannerProps {
  setBanner?: (banner: HTMLDivElement | null) => void;
}

const EditModeBanner: React.FC<EditModeBannerProps> = props => {
  const siteState = useContext(SiteStateContext);
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const { setBanner } = props;

  if (SiteHelper.isFunctionAppReadOnly(siteState)) {
    return (
      <div ref={ref => !!setBanner && setBanner(ref)}>
        <MessageBar
          id="site-state-banner"
          isMultiline={true}
          className={messageBannerClass(theme)}
          messageBarType={MessageBarType.info}
          styles={messageBannerStyles}>
          <InfoSvg className={messageBannerIconStyle} />
          <span className={messageBannerTextStyle}>{SiteHelper.getFunctionAppEditModeString(siteState, t)}</span>
        </MessageBar>
      </div>
    );
  }

  return <></>;
};

export default EditModeBanner;
